import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { RunnerCredential } from "./local-runner-home";
import type { LocalProjectState } from "./local-project-state";
import { ensureLocalProjectStateDirectory } from "./local-project-state";
import { runBoundedProcess } from "./bounded-process";
import {
	createRunnerEvent,
	flushRunnerEvents,
	queueRunnerEvent,
} from "./runner-events";
import type { ApprovedWorkflowRunPacket } from "./workflow-run-api";

const SOURCE_TRUTH_WORKFLOW_ID = "source-truth-agent-readiness";
const SOURCE_TRUTH_WORKFLOW_VERSION = "v1";
const DEFAULT_PROFILE_NAME = "sbs-workspace-write";
const NEXT_RECOMMENDED_WORKFLOW_ID = "observability-debuggability";
const SBS_SOURCE_TRUTH_BLOCK_START =
	"<!-- sbs-source-truth-agent-readiness-start -->";
const SBS_SOURCE_TRUTH_BLOCK_END =
	"<!-- sbs-source-truth-agent-readiness-end -->";

export type SourceTruthWorkflowResult = {
	workflowRunId: string;
	workflowId: typeof SOURCE_TRUTH_WORKFLOW_ID;
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

type ProofCommandResult = {
	commandName: string;
	status: "passed" | "failed" | "blocked";
	exitCodeSummary: string;
};

type RunSourceTruthWorkflowOptions = {
	repositoryRoot: string;
	state: LocalProjectState;
	credential: RunnerCredential;
	approvedWorkflowRun: ApprovedWorkflowRunPacket;
	confirmLocalWrites: boolean;
	now?: number;
	fetchRunnerEvent?: typeof fetch;
};

export async function runSourceTruthWorkflow({
	repositoryRoot,
	state,
	credential,
	approvedWorkflowRun,
	confirmLocalWrites,
	now = Date.now(),
	fetchRunnerEvent,
}: RunSourceTruthWorkflowOptions): Promise<SourceTruthWorkflowResult> {
	if (!confirmLocalWrites) {
		throw new Error(
			"source-truth-readiness requires --confirm-local-writes because it can update root AGENTS.md.",
		);
	}
	if (approvedWorkflowRun.workflowId !== SOURCE_TRUTH_WORKFLOW_ID) {
		throw new Error(
			"Approved workflow run is not source-truth-agent-readiness.",
		);
	}
	const {
		workflowRunId,
		branchName,
		profileName,
		writeLeaseId,
		writeLeaseExpiresAt,
	} = approvedWorkflowRun;
	assertSafeWorkflowRunId(workflowRunId);
	assertSafeBranchName(branchName);
	assertApprovedSourceTruthProfile(profileName);

	const localRunDirectoryRef = `.sbs/runs/${workflowRunId}`;
	const localRunDirectory = path.join(repositoryRoot, localRunDirectoryRef);
	if (now >= writeLeaseExpiresAt) {
		return await blockWorkflow({
			repositoryRoot,
			state,
			credential,
			workflowRunId,
			branchName,
			profileName,
			localRunDirectoryRef,
			localRunDirectory,
			blockedStage: "write-lease",
			blockedReason:
				"Approved write lease expired before local writes started.",
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
			localRunDirectoryRef,
			localRunDirectory,
			blockedStage: "dirty-state",
			blockedReason: dirtyState.succeeded
				? "Worktree is dirty before source-truth workflow writes."
				: "Unable to inspect Git dirty state before source-truth workflow writes.",
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
			localRunDirectoryRef,
			localRunDirectory,
			blockedStage: "branch",
			blockedReason: branchResult.blockedReason,
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
				workflowId: SOURCE_TRUTH_WORKFLOW_ID,
				branchName,
				profileName,
			},
		}),
		{ updateGitExclude: false },
	);

	const commandProofMapRef = ".sbs/source-truth/command-proof-map.json";
	const commandProofMap = await buildCommandProofMap(repositoryRoot);
	await writeJsonArtifact(repositoryRoot, commandProofMapRef, commandProofMap);

	const workflowPacketRef = `${localRunDirectoryRef}/workflow-packet.json`;
	const proofRef = `${localRunDirectoryRef}/proof.json`;
	const syncPreviewRef = `${localRunDirectoryRef}/sync-preview.json`;
	await writeJsonArtifact(repositoryRoot, workflowPacketRef, {
		schemaVersion: "source-truth-workflow-packet.v1",
		workflowId: SOURCE_TRUTH_WORKFLOW_ID,
		workflowVersion: SOURCE_TRUTH_WORKFLOW_VERSION,
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
		},
		localArtifacts: [
			workflowPacketRef,
			proofRef,
			syncPreviewRef,
			commandProofMapRef,
		],
		allowedTouchTargets: [
			"AGENTS.md",
			".sbs/runs/<workflow-run-id>/**",
			".sbs/source-truth/**",
			"README or setup docs tied to agent readiness",
		],
		disallowedTouchTargets: [
			"runtime app code",
			"environment files",
			"dependency manifests",
			"dependency locks",
			"database migrations",
			"provider configuration",
			"generated folders",
			"package scripts",
		],
		commandsToInspect: commandProofMap.commandsToInspect,
		proofCommands: [
			"git status --short",
			"git diff --name-only",
			"git diff --check",
		],
		syncPolicy:
			"Sync workflow metadata, proof status, command names, artifact names, and repo-relative refs only.",
		stopConditions: [
			"worktree dirty before writes",
			"write leaves docs and .sbs boundary",
			"proof command fails",
		],
		approvalRequired: true,
		expectedOutputs: [
			"source-truth workflow packet",
			"repo instruction update",
			"command and proof map artifact",
			"local proof summary",
			"next recommended workflow",
		],
		rollbackNotes:
			"Switch back to the base branch and delete the local source-truth branch after review if this diff should not be kept.",
		createdAt: now,
	});

	const agentsUpdated = await writeSourceTruthAgentsBlock({
		repositoryRoot,
		workflowRunId,
		branchName,
		profileName,
	});

	const proofCommandResults = await runProofCommands(repositoryRoot);
	const proofStatus = proofCommandResults.every(
		(result) => result.status === "passed",
	)
		? "passed"
		: "failed";
	const touchedFiles = agentsUpdated ? ["AGENTS.md"] : [];
	const createdArtifacts = [
		workflowPacketRef,
		proofRef,
		syncPreviewRef,
		commandProofMapRef,
	];
	const proofSummary =
		proofStatus === "passed"
			? "Source-truth workflow wrote approved local proof artifacts and repo instructions."
			: "Source-truth workflow wrote local artifacts, but one or more proof commands failed.";

	await writeJsonArtifact(repositoryRoot, proofRef, {
		schemaVersion: "source-truth-proof.v1",
		workflowId: SOURCE_TRUTH_WORKFLOW_ID,
		workflowVersion: SOURCE_TRUTH_WORKFLOW_VERSION,
		workflowRunId,
		branchName,
		profileName,
		diffSummary: await readGitDiffSummary(repositoryRoot),
		touchedFiles,
		createdArtifacts,
		proofCommandsRun: proofCommandResults.map((result) => result.commandName),
		proofCommandResults,
		blockedProof: null,
		rollbackInstructions:
			"Review the branch diff locally. To roll back, switch to the base branch and delete this local branch.",
		nextRecommendedWorkflow: NEXT_RECOMMENDED_WORKFLOW_ID,
		createdAt: now,
	});
	await writeJsonArtifact(repositoryRoot, syncPreviewRef, {
		schemaVersion: "source-truth-sync-preview.v1",
		workflowId: SOURCE_TRUTH_WORKFLOW_ID,
		workflowVersion: SOURCE_TRUTH_WORKFLOW_VERSION,
		branchName,
		profileName,
		touchedFileRefs: touchedFiles,
		createdArtifactRefs: createdArtifacts,
		proofCommandResults: proofCommandResults.map(({ commandName, status }) => ({
			commandName,
			status,
		})),
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
				workflowId: SOURCE_TRUTH_WORKFLOW_ID,
				proofStatus,
				proofSummary,
				touchedFileRefs: touchedFiles,
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
		workflowId: SOURCE_TRUTH_WORKFLOW_ID,
		status: "proof_completed",
		branchName,
		profileName,
		proofStatus,
		localRunDirectoryRef,
		touchedFiles,
		createdArtifacts,
		deliveredEvents: flushResult.delivered,
		remainingEvents: flushResult.remaining,
	};
}

async function blockWorkflow({
	repositoryRoot,
	state,
	credential,
	workflowRunId,
	branchName,
	profileName,
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
	localRunDirectoryRef: string;
	localRunDirectory: string;
	blockedStage: string;
	blockedReason: string;
	fetchRunnerEvent?: typeof fetch;
}): Promise<SourceTruthWorkflowResult> {
	const proofRef = `${localRunDirectoryRef}/proof.json`;
	const syncPreviewRef = `${localRunDirectoryRef}/sync-preview.json`;
	const createdArtifacts = [proofRef, syncPreviewRef];
	await mkdir(localRunDirectory, { recursive: true });
	await writeJsonArtifact(repositoryRoot, proofRef, {
		schemaVersion: "source-truth-proof.v1",
		workflowId: SOURCE_TRUTH_WORKFLOW_ID,
		workflowVersion: SOURCE_TRUTH_WORKFLOW_VERSION,
		workflowRunId,
		branchName,
		profileName,
		diffSummary: [],
		touchedFiles: [],
		createdArtifacts,
		proofCommandsRun: [],
		proofCommandResults: [],
		blockedProof: {
			stage: blockedStage,
			reason: blockedReason,
		},
		rollbackInstructions:
			"No source-truth writes were made. Fix the blocked condition and rerun the command.",
		nextRecommendedWorkflow: SOURCE_TRUTH_WORKFLOW_ID,
	});
	await writeJsonArtifact(repositoryRoot, syncPreviewRef, {
		schemaVersion: "source-truth-sync-preview.v1",
		workflowId: SOURCE_TRUTH_WORKFLOW_ID,
		workflowVersion: SOURCE_TRUTH_WORKFLOW_VERSION,
		branchName,
		profileName,
		touchedFileRefs: [],
		createdArtifactRefs: createdArtifacts,
		proofCommandResults: [],
		blockedReason,
		nextRecommendedWorkflowId: SOURCE_TRUTH_WORKFLOW_ID,
	});
	await queueRunnerEvent(
		repositoryRoot,
		createRunnerEvent({
			projectId: state.projectId,
			runnerId: state.runnerId,
			workflowRunId,
			payload: {
				eventType: "workflow.blocked",
				workflowId: SOURCE_TRUTH_WORKFLOW_ID,
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
		workflowId: SOURCE_TRUTH_WORKFLOW_ID,
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

async function runGit(repositoryRoot: string, args: string[]) {
	return await runBoundedProcess({
		command: "git",
		args,
		cwd: repositoryRoot,
		timeoutMs: 10_000,
	});
}

async function checkoutOrCreateBranch(
	repositoryRoot: string,
	branchName: string,
) {
	const branchExists = await runGit(repositoryRoot, [
		"rev-parse",
		"--verify",
		`refs/heads/${branchName}`,
	]);
	if (branchExists.succeeded) {
		const currentBranch = await runGit(repositoryRoot, [
			"rev-parse",
			"--abbrev-ref",
			"HEAD",
		]);
		if (currentBranch.stdout.trim() !== branchName) {
			return {
				succeeded: false,
				blockedReason:
					"Approved source-truth branch already exists. Switch to it manually or delete it after review before rerunning.",
			};
		}

		return {
			succeeded: true,
			blockedReason: "",
		};
	}

	const checkoutResult = await runGit(repositoryRoot, [
		"checkout",
		"-b",
		branchName,
	]);
	return {
		...checkoutResult,
		blockedReason: checkoutResult.succeeded
			? ""
			: "Unable to create or check out the source-truth branch.",
	};
}

async function runProofCommands(repositoryRoot: string) {
	const commands: Array<{ commandName: string; args: string[] }> = [
		{ commandName: "git status --short", args: ["status", "--short"] },
		{ commandName: "git diff --name-only", args: ["diff", "--name-only"] },
		{ commandName: "git diff --check", args: ["diff", "--check"] },
	];
	const results: ProofCommandResult[] = [];
	for (const command of commands) {
		const result = await runGit(repositoryRoot, command.args);
		results.push({
			commandName: command.commandName,
			status: result.succeeded ? "passed" : "failed",
			exitCodeSummary: result.timedOut
				? "timed out"
				: result.succeeded
					? "passed"
					: "failed",
		});
	}

	return results;
}

async function readGitDiffSummary(repositoryRoot: string) {
	const diffSummary = await runGit(repositoryRoot, ["diff", "--name-only"]);
	if (!diffSummary.succeeded) {
		return [];
	}

	return diffSummary.stdout
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
}

async function buildCommandProofMap(repositoryRoot: string) {
	const packageJsonPath = path.join(repositoryRoot, "package.json");
	if (!existsSync(packageJsonPath)) {
		return {
			schemaVersion: "source-truth-command-proof-map.v1",
			packageManager: "unknown",
			commandsToInspect: ["git status --short", "git diff --name-only"],
			packageScripts: [],
		};
	}

	const parsed = JSON.parse(await readFile(packageJsonPath, "utf8")) as {
		scripts?: Record<string, string>;
		packageManager?: string;
	};
	const packageScripts = Object.keys(parsed.scripts ?? {}).sort();
	return {
		schemaVersion: "source-truth-command-proof-map.v1",
		packageManager: parsed.packageManager ?? "unknown",
		commandsToInspect: [
			...packageScripts.map((scriptName) => `package script: ${scriptName}`),
			"git status --short",
			"git diff --name-only",
		],
		packageScripts,
	};
}

async function writeSourceTruthAgentsBlock({
	repositoryRoot,
	workflowRunId,
	branchName,
	profileName,
}: {
	repositoryRoot: string;
	workflowRunId: string;
	branchName: string;
	profileName: string;
}) {
	const agentsPath = path.join(repositoryRoot, "AGENTS.md");
	const existingContents = existsSync(agentsPath)
		? await readFile(agentsPath, "utf8")
		: "# AGENTS.md\n";

	if (existingContents.includes(SBS_SOURCE_TRUTH_BLOCK_START)) {
		return false;
	}

	const nextContents = [
		existingContents.trimEnd(),
		"",
		SBS_SOURCE_TRUTH_BLOCK_START,
		"## Ship by Sunday Source Truth",
		"",
		`- Approved workflow run: ${workflowRunId}`,
		`- Local branch: ${branchName}`,
		`- Codex profile: ${profileName}`,
		"- Keep this workflow inside docs and local `.sbs/` artifacts.",
		"- Do not edit runtime code, environment files, lockfiles, dependency manifests, migrations, provider configuration, generated folders, or package scripts for this workflow.",
		"- Use `.sbs/runs/<workflow-run-id>/workflow-packet.json` and `.sbs/runs/<workflow-run-id>/proof.json` as the local proof trail.",
		SBS_SOURCE_TRUTH_BLOCK_END,
		"",
	].join("\n");
	await writeFile(agentsPath, nextContents);
	return true;
}

async function writeJsonArtifact(
	repositoryRoot: string,
	repoRelativePath: string,
	value: unknown,
) {
	const artifactPath = path.join(repositoryRoot, repoRelativePath);
	await mkdir(path.dirname(artifactPath), { recursive: true });
	await writeFile(artifactPath, `${JSON.stringify(value, null, 2)}\n`);
}

function assertSafeWorkflowRunId(workflowRunId: string) {
	if (!/^[A-Za-z0-9_-]+$/.test(workflowRunId)) {
		throw new Error("workflowRunId must be an id, not a path.");
	}
}

function assertSafeBranchName(branchName: string) {
	if (
		branchName.startsWith("/") ||
		branchName.includes("..") ||
		/[\s~^:?*[\\]/.test(branchName)
	) {
		throw new Error("branchName is not a safe local branch name.");
	}
	if (!/^sbs\/source-truth-readiness-\d{8}-\d{4}$/.test(branchName)) {
		throw new Error(
			"branchName must match the approved source-truth readiness branch pattern.",
		);
	}
}

function assertApprovedSourceTruthProfile(profileName: string) {
	if (profileName !== DEFAULT_PROFILE_NAME) {
		throw new Error(
			"profileName must match the approved SBS workspace profile.",
		);
	}
}
