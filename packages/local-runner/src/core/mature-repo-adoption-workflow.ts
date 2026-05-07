import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import type { JsonValue } from "./json-value";
import { runBoundedProcess } from "./bounded-process";
import type { RunnerCredential } from "./local-runner-home";
import type { LocalProjectState } from "./local-project-state";
import { ensureLocalProjectStateDirectory } from "./local-project-state";
import {
	createRunnerEvent,
	flushRunnerEvents,
	queueRunnerEvent,
} from "./runner-events";
import type { ApprovedWorkflowRunPacket } from "./workflow-run-api";

const MATURE_REPO_ADOPTION_WORKFLOW_ID = "mature-repo-adoption";
const MATURE_REPO_ADOPTION_WORKFLOW_VERSION = "v1";
const DEFAULT_PROFILE_NAME = "sbs-workspace-write";
const NEXT_RECOMMENDED_WORKFLOW_ID = "normalize-validation-and-source-truth";
const MAX_SCAN_FILES = 600;
const MAX_PACKAGE_FIELD_NAMES = 80;
const MATURE_REPO_ADOPTION_EXPECTED_OUTPUTS = [
	"mature repo adoption workflow packet",
	"sync-safe repo convention audit",
	"adoption Program packet draft",
	"first child ExecPlan draft",
	"local proof or blocked-proof summary",
] as const;
const MATURE_REPO_ADOPTION_ALLOWED_TOUCH_TARGETS = [
	".sbs/runs/<workflow-run-id>/**",
	".sbs/mature-repo/**",
	"repo convention metadata only",
] as const;
const MATURE_REPO_ADOPTION_DISALLOWED_TOUCH_TARGETS = [
	"runtime app code",
	"environment files",
	"dependency manifests",
	"dependency locks",
	"database migrations",
	"provider configuration",
	"generated folders",
	"package scripts",
	"root agent instructions",
	"CI configuration",
	"CI-affecting commands",
	"branch pushes",
	"pull requests",
	"raw logs",
	"raw source",
	"Codex transcripts",
] as const;
const MATURE_REPO_ADOPTION_PROOF_COMMANDS = [
	"git status --short",
	"git diff --name-only",
	"git diff --check",
] as const;
const MATURE_REPO_ADOPTION_SYNC_POLICY_SUMMARY =
	"Only approved structured workflow metadata, proof status, command names, artifact names, and repo-relative refs sync. Local code, command output, and Codex session history stay on the machine.";
const MATURE_REPO_ADOPTION_STOP_CONDITIONS = [
	"worktree is dirty before branch creation",
	"write lease expires before adoption audit starts",
	"requested work needs generated-starter rewrites, provider setup, package installs, migrations, CI, PRs, branch pushes, raw source, raw logs, or Codex transcripts",
	"proof command fails",
] as const;
const MATURE_REPO_ADOPTION_ROLLBACK_NOTES =
	"Keep the branch local by default. Roll back with git switch back to the base branch and git branch -D the mature adoption branch after reviewing local proof.";
const MATURE_REPO_ADOPTION_PROVIDER_ACCESS_POLICY =
	"Provider access is disabled. Missing provider setup, dashboard access, dependency installs, migrations, CI changes, branch pushes, and pull requests require a later explicit workflow packet.";
const MATURE_REPO_ADOPTION_PROOF_DELIVERY =
	"Proof stays local under .sbs/runs/<workflow-run-id>/** and .sbs/mature-repo/**. Hosted sync receives only sync-safe proof metadata and artifact refs.";
const MATURE_REPO_ADOPTION_REVOCATION_BEHAVIOR =
	"Runner revocation, write lease expiry, dirty worktree, unsafe branch state, or work needing wider authority stops execution and writes blocked proof instead of escalating permissions.";

type ProofCommandResult = {
	commandName: string;
	status: "passed" | "failed" | "blocked";
	exitCodeSummary: string;
};

type MatureRepoAdoptionAudit = {
	schemaVersion: "mature-repo-adoption-audit.v1";
	workflowId: typeof MATURE_REPO_ADOPTION_WORKFLOW_ID;
	workflowVersion: typeof MATURE_REPO_ADOPTION_WORKFLOW_VERSION;
	repositoryShape: {
		packageManager: string;
		packageScripts: string[];
		dependencyNames: string[];
		devDependencyNames: string[];
	};
	sourceTruth: {
		agentInstructionRefs: string[];
		docsRefs: string[];
		validationRefs: string[];
		ciRefs: string[];
		releaseRefs: string[];
	};
	adoptionReadiness: Array<{
		checkId: string;
		label: string;
		status: "detected" | "missing" | "blocked";
		evidenceRefs: string[];
		blockedReason?: string;
	}>;
	blockedProof: Array<{
		stage: string;
		reason: string;
		nextApprovalRequired: boolean;
	}>;
	createdAt: number;
};

export type MatureRepoAdoptionWorkflowResult = {
	workflowRunId: string;
	workflowId: typeof MATURE_REPO_ADOPTION_WORKFLOW_ID;
	status: "proof_completed" | "blocked";
	branchName: string;
	profileName: string;
	proofStatus: "passed" | "failed" | "blocked";
	localRunDirectoryRef: string;
	touchedFiles: string[];
	createdArtifacts: string[];
	blockedReason?: string;
	deliveredEvents: number;
	remainingEvents: number;
};

type RunMatureRepoAdoptionWorkflowOptions = {
	repositoryRoot: string;
	state: LocalProjectState;
	credential: RunnerCredential;
	approvedWorkflowRun: ApprovedWorkflowRunPacket;
	confirmAdoptionAudit: boolean;
	now?: number;
	fetchRunnerEvent?: typeof fetch;
};

export async function runMatureRepoAdoptionWorkflow({
	repositoryRoot,
	state,
	credential,
	approvedWorkflowRun,
	confirmAdoptionAudit,
	now = Date.now(),
	fetchRunnerEvent,
}: RunMatureRepoAdoptionWorkflowOptions): Promise<MatureRepoAdoptionWorkflowResult> {
	const {
		workflowRunId,
		branchName,
		profileName,
		writeLeaseId,
		writeLeaseExpiresAt,
	} = approvedWorkflowRun;
	assertSafeWorkflowRunId(workflowRunId);
	const localRunDirectoryRef = `.sbs/runs/${workflowRunId}`;
	const localRunDirectory = path.join(repositoryRoot, localRunDirectoryRef);

	if (!confirmAdoptionAudit) {
		return await blockWorkflow({
			repositoryRoot,
			state,
			credential,
			workflowRunId,
			branchName,
			profileName,
			writeLeaseId,
			localRunDirectoryRef,
			localRunDirectory,
			blockedStage: "terminal-confirmation",
			blockedReason:
				"mature-repo-adoption requires --confirm-adoption-audit because it creates a local branch and .sbs adoption proof.",
			fetchRunnerEvent,
		});
	}
	if (approvedWorkflowRun.workflowId !== MATURE_REPO_ADOPTION_WORKFLOW_ID) {
		return await blockWorkflow({
			repositoryRoot,
			state,
			credential,
			workflowRunId,
			branchName,
			profileName,
			writeLeaseId,
			localRunDirectoryRef,
			localRunDirectory,
			blockedStage: "approval-packet",
			blockedReason: "Approved workflow run is not mature-repo-adoption.",
			fetchRunnerEvent,
		});
	}

	try {
		assertApprovedMatureRepoAdoptionPacket(approvedWorkflowRun);
		assertSafeBranchName(branchName);
		assertApprovedProfile(profileName);
	} catch (error) {
		return await blockWorkflow({
			repositoryRoot,
			state,
			credential,
			workflowRunId,
			branchName,
			profileName,
			writeLeaseId,
			localRunDirectoryRef,
			localRunDirectory,
			blockedStage: "approval-packet",
			blockedReason: error instanceof Error ? error.message : String(error),
			fetchRunnerEvent,
		});
	}

	if (now >= writeLeaseExpiresAt) {
		return await blockWorkflow({
			repositoryRoot,
			state,
			credential,
			workflowRunId,
			branchName,
			profileName,
			writeLeaseId,
			localRunDirectoryRef,
			localRunDirectory,
			blockedStage: "write-lease",
			blockedReason:
				"Approved write lease expired before mature repo adoption audit started.",
			fetchRunnerEvent,
		});
	}

	const dirtyState = await runGit(repositoryRoot, ["status", "--porcelain"]);
	if (!dirtyState.succeeded || dirtyState.stdout.trim()) {
		return await blockWorkflow({
			repositoryRoot,
			state,
			credential,
			workflowRunId,
			branchName,
			profileName,
			writeLeaseId,
			localRunDirectoryRef,
			localRunDirectory,
			blockedStage: "dirty-state",
			blockedReason: dirtyState.succeeded
				? "Worktree is dirty before mature repo adoption audit writes."
				: "Unable to inspect Git dirty state before mature repo adoption audit writes.",
			fetchRunnerEvent,
		});
	}

	await ensureLocalProjectStateDirectory(repositoryRoot, {
		updateGitExclude: false,
	});
	await mkdir(localRunDirectory, { recursive: true });

	const baseBranchResult = await runGit(repositoryRoot, [
		"rev-parse",
		"--abbrev-ref",
		"HEAD",
	]);
	if (!baseBranchResult.succeeded) {
		return await blockWorkflow({
			repositoryRoot,
			state,
			credential,
			workflowRunId,
			branchName,
			profileName,
			writeLeaseId,
			localRunDirectoryRef,
			localRunDirectory,
			blockedStage: "base-branch",
			blockedReason: "Unable to read the current Git branch.",
			fetchRunnerEvent,
		});
	}
	const baseBranch = baseBranchResult.stdout.trim();

	const branchResult = await checkoutOrCreateBranch(repositoryRoot, branchName);
	if (!branchResult.succeeded) {
		return await blockWorkflow({
			repositoryRoot,
			state,
			credential,
			workflowRunId,
			branchName,
			profileName,
			writeLeaseId,
			localRunDirectoryRef,
			localRunDirectory,
			blockedStage: "branch",
			blockedReason:
				branchResult.blockedReason ??
				"Unable to prepare the approved mature adoption branch.",
			fetchRunnerEvent,
		});
	}

	await queueRunnerEvent(
		repositoryRoot,
		createRunnerEvent({
			projectId: state.projectId,
			runnerId: state.runnerId,
			workflowRunId,
			payload: {
				eventType: "workflow.started",
				workflowId: MATURE_REPO_ADOPTION_WORKFLOW_ID,
				branchName,
				profileName,
			},
		}),
		{ updateGitExclude: false },
	);

	const workflowPacketRef = `${localRunDirectoryRef}/workflow-packet.json`;
	const auditRef = ".sbs/mature-repo/adoption-audit.json";
	const programRef = ".sbs/mature-repo/adoption-program.md";
	const execPlanRef = ".sbs/mature-repo/first-execplan.md";
	const proofRef = `${localRunDirectoryRef}/proof.json`;
	const syncPreviewRef = `${localRunDirectoryRef}/sync-preview.json`;
	let audit: MatureRepoAdoptionAudit;
	try {
		audit = await buildMatureRepoAdoptionAudit(repositoryRoot, now);
	} catch (error) {
		return await blockWorkflow({
			repositoryRoot,
			state,
			credential,
			workflowRunId,
			branchName,
			profileName,
			writeLeaseId,
			localRunDirectoryRef,
			localRunDirectory,
			blockedStage: "adoption-audit",
			blockedReason: error instanceof Error ? error.message : String(error),
			fetchRunnerEvent,
		});
	}

	const createdArtifacts = [
		workflowPacketRef,
		auditRef,
		programRef,
		execPlanRef,
		proofRef,
		syncPreviewRef,
	];

	await writeJsonArtifact(repositoryRoot, workflowPacketRef, {
		schemaVersion: "mature-repo-adoption-workflow-packet.v1",
		workflowId: MATURE_REPO_ADOPTION_WORKFLOW_ID,
		workflowVersion: MATURE_REPO_ADOPTION_WORKFLOW_VERSION,
		projectId: state.projectId,
		runnerId: state.runnerId,
		profileName,
		writeLeaseId,
		writeLeaseExpiresAt,
		baseBranch,
		targetBranch: branchName,
		dirtyStatePolicy: "require_clean_worktree",
		inputs: {
			approvedWorkflowRunId: workflowRunId,
			customerBottleneckContext:
				"Adopt the existing repository conventions before larger agent work.",
		},
		deterministicProbes: [
			"package-manager-detection",
			"package-script-inventory",
			"docs-and-agent-instruction-inventory",
			"ci-and-release-inventory",
		],
		executionSurface: "local_runner",
		codexInterpretation: "disabled for this audit-only workflow",
		codexWritePolicy: "disabled outside approved .sbs adoption artifacts",
		localArtifacts: createdArtifacts,
		allowedTouchTargets: MATURE_REPO_ADOPTION_ALLOWED_TOUCH_TARGETS,
		disallowedTouchTargets: MATURE_REPO_ADOPTION_DISALLOWED_TOUCH_TARGETS,
		providerAccessPolicy: MATURE_REPO_ADOPTION_PROVIDER_ACCESS_POLICY,
		proofCommands: MATURE_REPO_ADOPTION_PROOF_COMMANDS,
		syncPolicy: MATURE_REPO_ADOPTION_SYNC_POLICY_SUMMARY,
		stopConditions: MATURE_REPO_ADOPTION_STOP_CONDITIONS,
		approvalRequired: true,
		expectedOutputs: MATURE_REPO_ADOPTION_EXPECTED_OUTPUTS,
		rollbackNotes: MATURE_REPO_ADOPTION_ROLLBACK_NOTES,
		proofDelivery: MATURE_REPO_ADOPTION_PROOF_DELIVERY,
		revocationBehavior: MATURE_REPO_ADOPTION_REVOCATION_BEHAVIOR,
		createdAt: now,
	});
	await writeJsonArtifact(repositoryRoot, auditRef, audit);
	await writeTextArtifact(
		repositoryRoot,
		programRef,
		renderAdoptionProgram(audit),
	);
	await writeTextArtifact(
		repositoryRoot,
		execPlanRef,
		renderFirstExecPlan(audit),
	);

	const { proofCommandResults, unexpectedTouchedFiles } =
		await runProofCommands(repositoryRoot);
	const proofStatus = proofCommandResults.every(
		(result) => result.status === "passed",
	)
		? "passed"
		: "failed";
	const proofSummary =
		proofStatus === "passed"
			? "Mature repo adoption wrote sync-safe audit and adoption packet artifacts."
			: "Mature repo adoption wrote local artifacts, but one or more proof commands failed.";

	await writeJsonArtifact(repositoryRoot, proofRef, {
		schemaVersion: "mature-repo-adoption-proof.v1",
		workflowId: MATURE_REPO_ADOPTION_WORKFLOW_ID,
		workflowVersion: MATURE_REPO_ADOPTION_WORKFLOW_VERSION,
		workflowRunId,
		branchName,
		profileName,
		auditRef,
		programRef,
		execPlanRef,
		diffSummary: await readGitDiffSummary(repositoryRoot),
		touchedFiles: unexpectedTouchedFiles,
		createdArtifacts,
		proofCommandsRun: proofCommandResults.map((result) => result.commandName),
		proofCommandResults,
		blockedProof: audit.blockedProof,
		rollbackInstructions:
			"Review the local .sbs adoption artifacts. To roll back, switch to the base branch and delete this local branch.",
		nextRecommendedWorkflow: NEXT_RECOMMENDED_WORKFLOW_ID,
		createdAt: now,
	});
	await writeJsonArtifact(repositoryRoot, syncPreviewRef, {
		schemaVersion: "mature-repo-adoption-sync-preview.v1",
		workflowId: MATURE_REPO_ADOPTION_WORKFLOW_ID,
		workflowVersion: MATURE_REPO_ADOPTION_WORKFLOW_VERSION,
		branchName,
		profileName,
		touchedFileRefs: unexpectedTouchedFiles,
		createdArtifactRefs: createdArtifacts,
		proofCommandResults: proofCommandResults.map(({ commandName, status }) => ({
			commandName,
			status,
		})),
		blockedProofCount: audit.blockedProof.length,
		nextRecommendedWorkflowId: NEXT_RECOMMENDED_WORKFLOW_ID,
	});

	await queueRunnerEvent(
		repositoryRoot,
		createRunnerEvent({
			projectId: state.projectId,
			runnerId: state.runnerId,
			workflowRunId,
			payload: {
				eventType: "workflow.proof.completed",
				workflowId: MATURE_REPO_ADOPTION_WORKFLOW_ID,
				writeLeaseId,
				proofStatus,
				proofSummary,
				touchedFileRefs: unexpectedTouchedFiles,
				createdArtifactRefs: createdArtifacts,
				proofCommandResults: proofCommandResults.map(
					({ commandName, status }) => ({
						commandName,
						status,
					}),
				),
				nextRecommendedWorkflowId: NEXT_RECOMMENDED_WORKFLOW_ID,
			},
		}),
		{ updateGitExclude: false },
	);
	const flushResult = await flushRunnerEvents({
		repositoryRoot,
		credential,
		fetchRunnerEvent,
		updateGitExclude: false,
	});

	return {
		workflowRunId,
		workflowId: MATURE_REPO_ADOPTION_WORKFLOW_ID,
		status: "proof_completed",
		branchName,
		profileName,
		proofStatus,
		localRunDirectoryRef,
		touchedFiles: unexpectedTouchedFiles,
		createdArtifacts,
		deliveredEvents: flushResult.delivered,
		remainingEvents: flushResult.remaining,
	};
}

async function buildMatureRepoAdoptionAudit(
	repositoryRoot: string,
	now: number,
): Promise<MatureRepoAdoptionAudit> {
	const repoRefs = await listRepoRefs(repositoryRoot);
	const packageJson = await readPackageJson(repositoryRoot);
	const packageManager = detectPackageManager(repositoryRoot);
	const packageScripts = Object.keys(packageJson?.scripts ?? {}).slice(
		0,
		MAX_PACKAGE_FIELD_NAMES,
	);
	const dependencies = Object.keys(packageJson?.dependencies ?? {}).slice(
		0,
		MAX_PACKAGE_FIELD_NAMES,
	);
	const devDependencies = Object.keys(packageJson?.devDependencies ?? {}).slice(
		0,
		MAX_PACKAGE_FIELD_NAMES,
	);
	const agentInstructionRefs = repoRefs.filter(isAgentInstructionRef);
	const docsRefs = repoRefs.filter(isDocsRef);
	const validationRefs = repoRefs.filter(isValidationRef);
	const ciRefs = repoRefs.filter(isCiRef);
	const releaseRefs = repoRefs.filter(isReleaseRef);
	const adoptionReadiness = [
		buildReadiness(
			"agent-instructions",
			"Agent instructions",
			agentInstructionRefs,
		),
		buildReadiness("docs-spine", "Documentation spine", docsRefs),
		buildReadiness("validation-map", "Validation commands", validationRefs),
		buildReadiness("ci-release", "CI or release evidence", [
			...ciRefs,
			...releaseRefs,
		]),
		buildReadiness("package-scripts", "Package scripts", packageScripts),
	];
	const blockedProof = adoptionReadiness
		.filter((check) => check.status !== "detected")
		.map((check) => ({
			stage: check.checkId,
			reason:
				check.blockedReason ??
				`${check.label} was not detected from sync-safe repo metadata.`,
			nextApprovalRequired: true,
		}));

	return {
		schemaVersion: "mature-repo-adoption-audit.v1",
		workflowId: MATURE_REPO_ADOPTION_WORKFLOW_ID,
		workflowVersion: MATURE_REPO_ADOPTION_WORKFLOW_VERSION,
		repositoryShape: {
			packageManager,
			packageScripts,
			dependencyNames: dependencies,
			devDependencyNames: devDependencies,
		},
		sourceTruth: {
			agentInstructionRefs,
			docsRefs,
			validationRefs,
			ciRefs,
			releaseRefs,
		},
		adoptionReadiness,
		blockedProof,
		createdAt: now,
	};
}

function renderAdoptionProgram(audit: MatureRepoAdoptionAudit) {
	return [
		"# Mature Repo Adoption Program",
		"",
		"This draft preserves the existing repository conventions detected by the local adoption audit. It is a review artifact, not an applied repo rewrite.",
		"",
		"## Detected Conventions",
		"",
		`- Package manager: ${audit.repositoryShape.packageManager}`,
		`- Package scripts: ${formatList(audit.repositoryShape.packageScripts)}`,
		`- Agent instruction refs: ${formatList(audit.sourceTruth.agentInstructionRefs)}`,
		`- Documentation refs: ${formatList(audit.sourceTruth.docsRefs)}`,
		`- CI refs: ${formatList(audit.sourceTruth.ciRefs)}`,
		`- Release refs: ${formatList(audit.sourceTruth.releaseRefs)}`,
		"",
		"## Blocked Proof",
		"",
		...formatBlockedProof(audit.blockedProof),
		"",
		"## First Recommended Slice",
		"",
		"Create `normalize-validation-and-source-truth` as the first child ExecPlan. It should map validation commands, source-truth docs, owner instructions, and release proof before any runtime change.",
		"",
	].join("\n");
}

function renderFirstExecPlan(audit: MatureRepoAdoptionAudit) {
	return [
		"# Normalize Validation And Source Truth",
		"",
		"This draft is the first recommended child ExecPlan for the mature repo adoption Program. It should be reviewed before applying any files to the repository.",
		"",
		"## Purpose / Big Picture",
		"",
		"Make the existing repository legible to future agents by mapping current validation commands, source-truth docs, ownership instructions, and release proof without changing runtime behavior.",
		"",
		"## Existing Conventions To Preserve",
		"",
		`- Package manager: ${audit.repositoryShape.packageManager}`,
		`- Scripts to inspect: ${formatList(audit.repositoryShape.packageScripts)}`,
		`- Docs refs: ${formatList(audit.sourceTruth.docsRefs)}`,
		"",
		"## Blocked Proof To Resolve",
		"",
		...formatBlockedProof(audit.blockedProof),
		"",
		"## Out Of Scope",
		"",
		"Do not install dependencies, change provider settings, run migrations, rewrite generated-starter assumptions into this repo, push branches, open pull requests, or share raw source/logs without a later explicit packet.",
		"",
	].join("\n");
}

function formatBlockedProof(
	blockedProof: MatureRepoAdoptionAudit["blockedProof"],
) {
	if (blockedProof.length === 0) {
		return ["- None detected from sync-safe metadata."];
	}

	return blockedProof.map((blocked) => `- ${blocked.stage}: ${blocked.reason}`);
}

function formatList(values: string[]) {
	return values.length > 0 ? values.join(", ") : "Not detected";
}

function buildReadiness(
	checkId: string,
	label: string,
	evidenceRefs: string[],
): MatureRepoAdoptionAudit["adoptionReadiness"][number] {
	return evidenceRefs.length > 0
		? {
				checkId,
				label,
				status: "detected",
				evidenceRefs,
			}
		: {
				checkId,
				label,
				status: "missing",
				evidenceRefs: [],
				blockedReason: `${label} needs review before agent work scales.`,
			};
}

async function listRepoRefs(repositoryRoot: string) {
	const refs: string[] = [];
	const pending = [repositoryRoot];
	while (pending.length > 0 && refs.length < MAX_SCAN_FILES) {
		const current = pending.shift();
		if (!current) {
			continue;
		}
		const entries = await readdir(current, { withFileTypes: true }).catch(
			() => [],
		);
		for (const entry of entries) {
			if (refs.length >= MAX_SCAN_FILES || shouldSkipEntry(entry.name)) {
				continue;
			}
			const absolutePath = path.join(current, entry.name);
			const repoRelativePath = path.relative(repositoryRoot, absolutePath);
			if (entry.isDirectory()) {
				pending.push(absolutePath);
			} else if (entry.isFile()) {
				const fileStat = await stat(absolutePath).catch(() => null);
				if (fileStat && fileStat.size < 512_000) {
					refs.push(repoRelativePath);
				}
			}
		}
	}
	return refs.sort();
}

function shouldSkipEntry(name: string) {
	return (
		name === ".git" ||
		name === "node_modules" ||
		name === ".next" ||
		name === "dist" ||
		name === "build" ||
		name === "coverage" ||
		name === ".sbs" ||
		name.startsWith(".env")
	);
}

async function readPackageJson(repositoryRoot: string) {
	const packageJsonPath = path.join(repositoryRoot, "package.json");
	if (!existsSync(packageJsonPath)) {
		return null;
	}
	const raw = await readFile(packageJsonPath, "utf8");
	const parsed = JSON.parse(raw) as {
		scripts?: Record<string, string>;
		dependencies?: Record<string, string>;
		devDependencies?: Record<string, string>;
	};
	return parsed;
}

function detectPackageManager(repositoryRoot: string) {
	if (existsSync(path.join(repositoryRoot, "bun.lock"))) {
		return "bun";
	}
	if (existsSync(path.join(repositoryRoot, "pnpm-lock.yaml"))) {
		return "pnpm";
	}
	if (existsSync(path.join(repositoryRoot, "yarn.lock"))) {
		return "yarn";
	}
	if (existsSync(path.join(repositoryRoot, "package-lock.json"))) {
		return "npm";
	}
	if (existsSync(path.join(repositoryRoot, "package.json"))) {
		return "unknown-node";
	}
	return "unknown";
}

function isAgentInstructionRef(ref: string) {
	const name = path.basename(ref).toLowerCase();
	return (
		name === "agents.md" ||
		name === "claude.md" ||
		name === "gemini.md" ||
		ref.startsWith(".agents/")
	);
}

function isDocsRef(ref: string) {
	const lower = ref.toLowerCase();
	return (
		lower === "readme.md" ||
		lower.startsWith("docs/") ||
		lower.includes("architecture") ||
		lower.includes("security") ||
		lower.includes("reliability")
	);
}

function isValidationRef(ref: string) {
	const lower = ref.toLowerCase();
	return (
		lower.includes("test") ||
		lower.includes("vitest") ||
		lower.includes("playwright") ||
		lower.includes("lint") ||
		lower.includes("typecheck")
	);
}

function isCiRef(ref: string) {
	return ref.startsWith(".github/workflows/") || ref.startsWith(".gitlab/");
}

function isReleaseRef(ref: string) {
	const lower = ref.toLowerCase();
	return lower.includes("release") || lower.includes("deploy");
}

async function checkoutOrCreateBranch(
	repositoryRoot: string,
	branchName: string,
) {
	const currentBranch = await runGit(repositoryRoot, [
		"rev-parse",
		"--abbrev-ref",
		"HEAD",
	]);
	if (!currentBranch.succeeded) {
		return {
			succeeded: false,
			blockedReason: "Unable to read current branch.",
		};
	}
	if (currentBranch.stdout.trim() === branchName) {
		return { succeeded: true };
	}
	const existingLocalBranch = await runGit(repositoryRoot, [
		"show-ref",
		"--verify",
		`refs/heads/${branchName}`,
	]);
	if (existingLocalBranch.succeeded) {
		return {
			succeeded: false,
			blockedReason:
				"Approved mature adoption branch already exists but is not checked out.",
		};
	}
	const checkout = await runGit(repositoryRoot, ["checkout", "-b", branchName]);
	if (!checkout.succeeded) {
		return {
			succeeded: false,
			blockedReason: "Unable to create the approved mature adoption branch.",
		};
	}
	return { succeeded: true };
}

async function runProofCommands(repositoryRoot: string) {
	const commands = [
		["git", ["status", "--short"]],
		["git", ["diff", "--name-only"]],
		["git", ["diff", "--check"]],
	] as const;
	const results: ProofCommandResult[] = [];
	const unexpectedTouchedFiles =
		await listUnexpectedTouchedFiles(repositoryRoot);
	for (const [command, args] of commands) {
		const result = await runBoundedProcess({
			command,
			args: [...args],
			cwd: repositoryRoot,
			timeoutMs: 10_000,
		});
		const commandName = [command, ...args].join(" ");
		const hasUnexpectedTouchedFiles =
			commandName === "git status --short" && unexpectedTouchedFiles.length > 0;
		const status =
			result.succeeded && !hasUnexpectedTouchedFiles ? "passed" : "failed";
		results.push({
			commandName,
			status,
			exitCodeSummary: result.timedOut
				? "timed out"
				: status === "passed"
					? "passed"
					: "failed",
		});
	}
	return { proofCommandResults: results, unexpectedTouchedFiles };
}

async function listUnexpectedTouchedFiles(repositoryRoot: string) {
	const result = await runGit(repositoryRoot, [
		"status",
		"--porcelain",
		"--untracked-files=all",
	]);
	if (!result.succeeded) {
		return ["<unable to inspect git status>"];
	}
	return result.stdout
		.split(/\r?\n/)
		.map(parseGitStatusPath)
		.filter((fileRef): fileRef is string => Boolean(fileRef))
		.filter((fileRef) => !isAllowedLocalProofRef(fileRef))
		.sort();
}

function parseGitStatusPath(statusLine: string) {
	if (statusLine.trim() === "") {
		return null;
	}
	const rawPath = statusLine.slice(3).trim();
	const renameSeparator = " -> ";
	if (rawPath.includes(renameSeparator)) {
		return rawPath.split(renameSeparator).at(-1)?.trim() ?? null;
	}
	return rawPath.replace(/^"|"$/g, "");
}

function isAllowedLocalProofRef(fileRef: string) {
	return (
		fileRef.startsWith(".sbs/runs/") ||
		fileRef.startsWith(".sbs/mature-repo/") ||
		fileRef === ".sbs/.gitignore" ||
		fileRef.startsWith(".sbs/events/")
	);
}

async function readGitDiffSummary(repositoryRoot: string) {
	const result = await runGit(repositoryRoot, ["diff", "--stat"]);
	return result.succeeded && result.stdout.trim()
		? result.stdout.trim()
		: "No tracked source diff.";
}

async function runGit(repositoryRoot: string, args: string[]) {
	const result = await runBoundedProcess({
		command: "git",
		args,
		cwd: repositoryRoot,
		timeoutMs: 10_000,
	});
	return {
		succeeded: result.succeeded,
		stdout: result.stdout,
		stderr: result.stderr,
	};
}

async function writeJsonArtifact(
	repositoryRoot: string,
	repoRelativePath: string,
	value: JsonValue,
) {
	await writeTextArtifact(
		repositoryRoot,
		repoRelativePath,
		`${JSON.stringify(value, null, 2)}\n`,
	);
}

async function writeTextArtifact(
	repositoryRoot: string,
	repoRelativePath: string,
	value: string,
) {
	const artifactPath = path.join(repositoryRoot, repoRelativePath);
	await mkdir(path.dirname(artifactPath), { recursive: true });
	await writeFile(artifactPath, value);
}

async function blockWorkflow({
	repositoryRoot,
	state,
	credential,
	workflowRunId,
	branchName,
	profileName,
	writeLeaseId,
	localRunDirectoryRef,
	localRunDirectory,
	blockedStage,
	blockedReason,
	fetchRunnerEvent,
}: {
	repositoryRoot: string;
	state: LocalProjectState;
	credential: RunnerCredential;
	workflowRunId: string;
	branchName: string;
	profileName: string;
	writeLeaseId: string;
	localRunDirectoryRef: string;
	localRunDirectory: string;
	blockedStage: string;
	blockedReason: string;
	fetchRunnerEvent?: typeof fetch;
}): Promise<MatureRepoAdoptionWorkflowResult> {
	await mkdir(localRunDirectory, { recursive: true });
	const proofRef = `${localRunDirectoryRef}/proof.json`;
	const syncPreviewRef = `${localRunDirectoryRef}/sync-preview.json`;
	const createdArtifacts = [proofRef, syncPreviewRef];
	await writeJsonArtifact(repositoryRoot, proofRef, {
		schemaVersion: "mature-repo-adoption-proof.v1",
		workflowId: MATURE_REPO_ADOPTION_WORKFLOW_ID,
		workflowVersion: MATURE_REPO_ADOPTION_WORKFLOW_VERSION,
		workflowRunId,
		branchName,
		profileName,
		touchedFiles: [],
		createdArtifacts,
		proofCommandsRun: [],
		proofCommandResults: [],
		blockedProof: [
			{
				stage: blockedStage,
				reason: blockedReason,
				nextApprovalRequired: true,
			},
		],
		rollbackInstructions:
			"No source files were patched. Resolve the block and approve a fresh adoption workflow if needed.",
		nextRecommendedWorkflow: NEXT_RECOMMENDED_WORKFLOW_ID,
		createdAt: Date.now(),
	});
	await writeJsonArtifact(repositoryRoot, syncPreviewRef, {
		schemaVersion: "mature-repo-adoption-sync-preview.v1",
		workflowId: MATURE_REPO_ADOPTION_WORKFLOW_ID,
		workflowVersion: MATURE_REPO_ADOPTION_WORKFLOW_VERSION,
		branchName,
		profileName,
		touchedFileRefs: [],
		createdArtifactRefs: createdArtifacts,
		proofCommandResults: [],
		blockedReason,
		nextRecommendedWorkflowId: NEXT_RECOMMENDED_WORKFLOW_ID,
	});
	await queueRunnerEvent(
		repositoryRoot,
		createRunnerEvent({
			projectId: state.projectId,
			runnerId: state.runnerId,
			workflowRunId,
			payload: {
				eventType: "workflow.blocked",
				workflowId: MATURE_REPO_ADOPTION_WORKFLOW_ID,
				writeLeaseId,
				blockedStage,
				blockedReason,
			},
		}),
		{ updateGitExclude: false },
	);
	const flushResult = await flushRunnerEvents({
		repositoryRoot,
		credential,
		fetchRunnerEvent,
		updateGitExclude: false,
	});
	return {
		workflowRunId,
		workflowId: MATURE_REPO_ADOPTION_WORKFLOW_ID,
		status: "blocked",
		branchName,
		profileName,
		proofStatus: "blocked",
		localRunDirectoryRef,
		touchedFiles: [],
		createdArtifacts,
		blockedReason,
		deliveredEvents: flushResult.delivered,
		remainingEvents: flushResult.remaining,
	};
}

function assertSafeWorkflowRunId(workflowRunId: string) {
	if (!/^[A-Za-z0-9_-]+$/.test(workflowRunId)) {
		throw new Error("Workflow run id is not safe for local artifact paths.");
	}
}

function assertSafeBranchName(branchName: string) {
	if (!/^sbs\/mature-repo-adoption-\d{8}-\d{4}$/.test(branchName)) {
		throw new Error("Approved branch name is not a mature adoption branch.");
	}
}

function assertApprovedProfile(profileName: string) {
	if (profileName !== DEFAULT_PROFILE_NAME) {
		throw new Error(
			"Mature repo adoption requires the sbs-workspace-write profile.",
		);
	}
}

function assertApprovedMatureRepoAdoptionPacket(
	approvedWorkflowRun: ApprovedWorkflowRunPacket,
) {
	if (
		approvedWorkflowRun.workflowVersion !==
		MATURE_REPO_ADOPTION_WORKFLOW_VERSION
	) {
		throw new Error("Mature repo adoption workflow version is not approved.");
	}
	if (approvedWorkflowRun.writeLeaseDurationMinutes !== 30) {
		throw new Error(
			"Mature repo adoption write lease duration is not approved.",
		);
	}
	if (approvedWorkflowRun.dirtyStatePolicy !== "require_clean_worktree") {
		throw new Error("Mature repo adoption requires a clean-worktree policy.");
	}
	assertExactTextList(
		approvedWorkflowRun.expectedOutputs,
		MATURE_REPO_ADOPTION_EXPECTED_OUTPUTS,
		"expected outputs",
	);
	assertExactTextList(
		approvedWorkflowRun.allowedTouchTargets,
		MATURE_REPO_ADOPTION_ALLOWED_TOUCH_TARGETS,
		"allowed touch targets",
	);
	assertExactTextList(
		approvedWorkflowRun.disallowedTouchTargets,
		MATURE_REPO_ADOPTION_DISALLOWED_TOUCH_TARGETS,
		"disallowed touch targets",
	);
	assertExactTextList(
		approvedWorkflowRun.proofCommands,
		MATURE_REPO_ADOPTION_PROOF_COMMANDS,
		"proof commands",
	);
	if (
		approvedWorkflowRun.syncPolicySummary !==
		MATURE_REPO_ADOPTION_SYNC_POLICY_SUMMARY
	) {
		throw new Error("Mature repo adoption sync policy is not approved.");
	}
	assertExactTextList(
		approvedWorkflowRun.stopConditions,
		MATURE_REPO_ADOPTION_STOP_CONDITIONS,
		"stop conditions",
	);
	if (
		approvedWorkflowRun.rollbackNotes !== MATURE_REPO_ADOPTION_ROLLBACK_NOTES
	) {
		throw new Error("Mature repo adoption rollback notes are not approved.");
	}
	const expectedWorkflowPacketRef = `.sbs/runs/${approvedWorkflowRun.workflowRunId}/workflow-packet.json`;
	if (
		approvedWorkflowRun.localWorkflowPacketRef !== expectedWorkflowPacketRef
	) {
		throw new Error(
			"Mature repo adoption workflow packet ref is not approved.",
		);
	}
	const expectedProofRef = `.sbs/runs/${approvedWorkflowRun.workflowRunId}/proof.json`;
	if (approvedWorkflowRun.localProofRef !== expectedProofRef) {
		throw new Error("Mature repo adoption proof ref is not approved.");
	}
}

function assertExactTextList(
	actual: string[],
	expected: readonly string[],
	label: string,
) {
	if (
		actual.length !== expected.length ||
		actual.some((value, index) => value !== expected[index])
	) {
		throw new Error(`Mature repo adoption ${label} are not approved.`);
	}
}
