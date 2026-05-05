import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

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

const OBSERVABILITY_WORKFLOW_ID = "observability-debuggability";
const OBSERVABILITY_WORKFLOW_VERSION = "v1";
const DEFAULT_PROFILE_NAME = "sbs-workspace-write";
const NEXT_RECOMMENDED_WORKFLOW_ID = "proof-harness";
const MAX_SCAN_FILES = 600;
const MAX_SCAN_FILE_BYTES = 256_000;

type ProofCommandResult = {
	commandName: string;
	status: "passed" | "failed" | "blocked";
	exitCodeSummary: string;
};

type ObservabilitySignal = {
	kind: "file" | "package_dependency" | "package_script" | "provider_reference";
	label: string;
	repoRelativePath?: string;
	status: "detected";
};

type ObservabilityCapability = {
	capabilityId:
		| "client_error_capture"
		| "server_error_capture"
		| "runtime_intake"
		| "request_correlation"
		| "source_map_release_link"
		| "dashboard_access";
	label: string;
	status: "detected" | "missing" | "blocked";
	evidenceRefs: string[];
	blockedReason?: string;
};

export type ObservabilityDebuggabilityWorkflowResult = {
	workflowRunId: string;
	workflowId: typeof OBSERVABILITY_WORKFLOW_ID;
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

type RunObservabilityDebuggabilityWorkflowOptions = {
	repositoryRoot: string;
	state: LocalProjectState;
	credential: RunnerCredential;
	approvedWorkflowRun: ApprovedWorkflowRunPacket;
	confirmObservabilityAudit: boolean;
	now?: number;
	fetchRunnerEvent?: typeof fetch;
};

export async function runObservabilityDebuggabilityWorkflow({
	repositoryRoot,
	state,
	credential,
	approvedWorkflowRun,
	confirmObservabilityAudit,
	now = Date.now(),
	fetchRunnerEvent,
}: RunObservabilityDebuggabilityWorkflowOptions): Promise<ObservabilityDebuggabilityWorkflowResult> {
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

	if (!confirmObservabilityAudit) {
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
				"observability-debuggability requires --confirm-observability-audit because it creates a local branch and .sbs audit proof.",
			fetchRunnerEvent,
		});
	}
	if (approvedWorkflowRun.workflowId !== OBSERVABILITY_WORKFLOW_ID) {
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
			blockedReason:
				"Approved workflow run is not observability-debuggability.",
			fetchRunnerEvent,
		});
	}

	try {
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
				"Approved write lease expired before the observability audit started.",
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
				? "Worktree is dirty before observability audit writes."
				: "Unable to inspect Git dirty state before observability audit writes.",
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
				workflowId: OBSERVABILITY_WORKFLOW_ID,
				branchName,
				profileName,
			},
		}),
		{ updateGitExclude: false },
	);

	const workflowPacketRef = `${localRunDirectoryRef}/workflow-packet.json`;
	const auditRef = ".sbs/observability/debuggability-audit.json";
	const proofRef = `${localRunDirectoryRef}/proof.json`;
	const syncPreviewRef = `${localRunDirectoryRef}/sync-preview.json`;
	let audit: Awaited<ReturnType<typeof buildObservabilityAudit>>;
	try {
		audit = await buildObservabilityAudit(repositoryRoot, now);
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
			blockedStage: "audit-scan",
			blockedReason: error instanceof Error ? error.message : String(error),
			fetchRunnerEvent,
		});
	}
	const { proofCommandResults, unexpectedTouchedFiles } =
		await runProofCommands(repositoryRoot);
	const proofStatus = proofCommandResults.every(
		(result) => result.status === "passed",
	)
		? "passed"
		: "failed";
	const createdArtifacts = [
		workflowPacketRef,
		auditRef,
		proofRef,
		syncPreviewRef,
	];
	const blockedProof = audit.capabilities
		.filter((capability) => capability.status !== "detected")
		.map((capability) => ({
			capabilityId: capability.capabilityId,
			stage:
				capability.status === "blocked"
					? "provider-or-deployment-proof"
					: "observability-signal",
			reason:
				capability.blockedReason ??
				`${capability.label} was not detected from repo-local metadata.`,
			nextApprovalRequired: true,
		}));

	await writeJsonArtifact(repositoryRoot, workflowPacketRef, {
		schemaVersion: "observability-debuggability-workflow-packet.v1",
		workflowId: OBSERVABILITY_WORKFLOW_ID,
		workflowVersion: OBSERVABILITY_WORKFLOW_VERSION,
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
		localArtifacts: createdArtifacts,
		allowedTouchTargets: [
			".sbs/runs/<workflow-run-id>/**",
			".sbs/observability/**",
			"repo-relative observability signal metadata only",
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
			"branch pushes",
			"pull requests",
			"CI-affecting commands",
			"raw logs",
			"raw source",
			"Codex transcripts",
		],
		providerValues: {
			policy:
				"Provider values are not requested, read, stored, or verified by this workflow.",
			laterApprovalMustName: [
				"provider project",
				"environment variable names",
				"dashboard or alert destination",
				"source-map or release identifier policy",
				"deployment proof command",
			],
		},
		proofCommands: [
			"git status --short",
			"git diff --name-only",
			"git diff --check",
		],
		syncSafeOutputSchema: {
			signals:
				"capability labels, provider names, package names, script names, and repo-relative paths only",
			blockedProof:
				"capability id, stage, reason, and whether later approval is required",
			excluded:
				"source excerpts, full command output, raw logs, secrets, screenshots, transcripts, and local absolute paths",
		},
		stopConditions: [
			"worktree dirty before branch creation",
			"write lease expires before local audit starts",
			"requested work needs runtime code, provider setup, dependencies, package scripts, CI, PRs, source maps, dashboards, or deployment proof",
			"proof command fails",
		],
		rollbackNotes:
			"Switch back to the base branch and delete the local observability branch after review if this audit should not be kept.",
		approvalRequired: true,
		expectedOutputs: [
			"observability workflow packet",
			"sync-safe debuggability audit",
			"provider setup and dashboard access blocked-proof notes",
			"local proof or blocked-proof summary",
			"next recommended workflow",
		],
		createdAt: now,
	});
	await writeJsonArtifact(repositoryRoot, auditRef, audit);
	await writeJsonArtifact(repositoryRoot, proofRef, {
		schemaVersion: "observability-debuggability-proof.v1",
		workflowId: OBSERVABILITY_WORKFLOW_ID,
		workflowVersion: OBSERVABILITY_WORKFLOW_VERSION,
		workflowRunId,
		branchName,
		profileName,
		auditRef,
		signalsCount: audit.signals.length,
		capabilities: audit.capabilities,
		diffSummary: await readGitDiffSummary(repositoryRoot),
		touchedFiles: unexpectedTouchedFiles,
		createdArtifacts,
		proofCommandsRun: proofCommandResults.map((result) => result.commandName),
		proofCommandResults,
		blockedProof,
		rollbackInstructions:
			"Review the local audit branch and .sbs artifacts. To roll back, switch to the base branch and delete this local branch.",
		nextRecommendedWorkflow: NEXT_RECOMMENDED_WORKFLOW_ID,
		createdAt: now,
	});
	await writeJsonArtifact(repositoryRoot, syncPreviewRef, {
		schemaVersion: "observability-debuggability-sync-preview.v1",
		workflowId: OBSERVABILITY_WORKFLOW_ID,
		workflowVersion: OBSERVABILITY_WORKFLOW_VERSION,
		branchName,
		profileName,
		touchedFileRefs: unexpectedTouchedFiles,
		createdArtifactRefs: createdArtifacts,
		signalSummaries: audit.signals.map(({ kind, label, repoRelativePath }) => ({
			kind,
			label,
			repoRelativePath,
		})),
		capabilityStatuses: audit.capabilities.map(
			({ capabilityId, status, evidenceRefs, blockedReason }) => ({
				capabilityId,
				status,
				evidenceRefs,
				blockedReason,
			}),
		),
		proofCommandResults: proofCommandResults.map(({ commandName, status }) => ({
			commandName,
			status,
		})),
		blockedProof,
		nextRecommendedWorkflowId: NEXT_RECOMMENDED_WORKFLOW_ID,
	});

	const proofSummary =
		proofStatus === "passed"
			? "Observability workflow wrote sync-safe local audit proof and kept runtime/provider work behind later approval."
			: "Observability workflow wrote local audit artifacts, but one or more proof commands failed.";

	await queueRunnerEvent(
		repositoryRoot,
		createRunnerEvent({
			projectId: state.projectId,
			runnerId: state.runnerId,
			workflowRunId,
			payload: {
				eventType: "workflow.proof.completed",
				workflowId: OBSERVABILITY_WORKFLOW_ID,
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
		workflowId: OBSERVABILITY_WORKFLOW_ID,
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

async function buildObservabilityAudit(repositoryRoot: string, now: number) {
	const signals = await collectObservabilitySignals(repositoryRoot);
	const capabilities = buildCapabilities(signals);
	return {
		schemaVersion: "observability-debuggability-audit.v1",
		workflowId: OBSERVABILITY_WORKFLOW_ID,
		generatedAt: now,
		scanPolicy: {
			maxScanFiles: MAX_SCAN_FILES,
			maxScanFileBytes: MAX_SCAN_FILE_BYTES,
			storesSourceExcerpts: false,
			storesCommandOutput: false,
			storesLocalAbsolutePaths: false,
		},
		signals,
		capabilities,
		providerSetupRequired: capabilities.some(
			(capability) => capability.status !== "detected",
		),
		nextApprovalBoundary:
			"Runtime instrumentation, provider setup, dependencies, source maps, dashboards, deployment proof, pushes, and PRs require a separate approved workflow.",
	};
}

async function collectObservabilitySignals(repositoryRoot: string) {
	const signals: ObservabilitySignal[] = [];
	await collectPackageSignals(repositoryRoot, signals);

	const candidateFiles = await collectCandidateFiles(repositoryRoot);
	for (const repoRelativePath of candidateFiles) {
		const lowerPath = repoRelativePath.toLowerCase();
		const filePath = path.join(repositoryRoot, repoRelativePath);
		const fileStat = await stat(filePath).catch(() => null);
		if (!fileStat || fileStat.size > MAX_SCAN_FILE_BYTES) {
			continue;
		}

		if (isObservabilityPath(lowerPath)) {
			signals.push({
				kind: "file",
				label: "observability file",
				repoRelativePath,
				status: "detected",
			});
		}

		if (!isTextScanCandidate(lowerPath)) {
			continue;
		}
		const contents = (
			await readFile(filePath, "utf8").catch(() => "")
		).toLowerCase();
		for (const provider of detectProviders(contents)) {
			signals.push({
				kind: "provider_reference",
				label: provider,
				repoRelativePath,
				status: "detected",
			});
		}
	}

	return dedupeSignals(signals);
}

async function collectPackageSignals(
	repositoryRoot: string,
	signals: ObservabilitySignal[],
) {
	const packageJsonPath = path.join(repositoryRoot, "package.json");
	if (!existsSync(packageJsonPath)) {
		return;
	}

	const packageJsonContents = await readFile(packageJsonPath, "utf8");
	const parsed = JSON.parse(packageJsonContents) as {
		dependencies?: Record<string, string>;
		devDependencies?: Record<string, string>;
		scripts?: Record<string, string>;
	};
	for (const dependencyName of [
		...Object.keys(parsed.dependencies ?? {}),
		...Object.keys(parsed.devDependencies ?? {}),
	].sort()) {
		const provider = normalizeProviderName(dependencyName);
		if (!provider) {
			continue;
		}
		signals.push({
			kind: "package_dependency",
			label: provider,
			repoRelativePath: "package.json",
			status: "detected",
		});
	}

	for (const scriptName of Object.keys(parsed.scripts ?? {}).sort()) {
		if (
			!/(observ|telemetry|sentry|posthog|datadog|newrelic|source.?map|trace|log)/i.test(
				scriptName,
			)
		) {
			continue;
		}
		signals.push({
			kind: "package_script",
			label: `package script: ${scriptName}`,
			repoRelativePath: "package.json",
			status: "detected",
		});
	}
}

async function collectCandidateFiles(repositoryRoot: string) {
	const candidates: string[] = [];
	async function visit(directory: string) {
		if (candidates.length >= MAX_SCAN_FILES) {
			return;
		}
		const entries = await readdir(directory, { withFileTypes: true }).catch(
			() => [],
		);
		for (const entry of entries) {
			if (candidates.length >= MAX_SCAN_FILES) {
				return;
			}
			if (entry.name.startsWith(".") && entry.name !== ".sbs") {
				continue;
			}
			if (entry.isDirectory()) {
				if (shouldSkipDirectory(entry.name)) {
					continue;
				}
				await visit(path.join(directory, entry.name));
			} else if (entry.isFile()) {
				const repoRelativePath = toRepoRelativePath(
					repositoryRoot,
					path.join(directory, entry.name),
				);
				if (isTextScanCandidate(repoRelativePath.toLowerCase())) {
					candidates.push(repoRelativePath);
				}
			}
		}
	}
	await visit(repositoryRoot);
	return candidates;
}

function buildCapabilities(signals: ObservabilitySignal[]) {
	const hasClientSignal = signals.some((signal) =>
		/client|posthog|sentry|error-boundary|instrumentation-client/i.test(
			`${signal.label} ${signal.repoRelativePath ?? ""}`,
		),
	);
	const hasServerSignal = signals.some((signal) =>
		/server|logger|logging|opentelemetry|instrumentation|sentry|datadog|new relic/i.test(
			`${signal.label} ${signal.repoRelativePath ?? ""}`,
		),
	);
	const hasRuntimeIntake = signals.some((signal) =>
		/api\/observability|runtime.?intake|client-error|webhook|export-runtime/i.test(
			signal.repoRelativePath ?? signal.label,
		),
	);
	const hasRequestCorrelation = signals.some((signal) =>
		/request.?id|correlation|trace|logger|middleware/i.test(
			`${signal.label} ${signal.repoRelativePath ?? ""}`,
		),
	);
	const hasSourceMapLink = signals.some((signal) =>
		/source.?map|sourcemap|release/i.test(
			`${signal.label} ${signal.repoRelativePath ?? ""}`,
		),
	);
	const hasProvider = signals.some(
		(signal) =>
			signal.kind === "provider_reference" ||
			signal.kind === "package_dependency",
	);

	return [
		createCapability({
			capabilityId: "client_error_capture",
			label: "Client error capture",
			detected: hasClientSignal,
			signals,
		}),
		createCapability({
			capabilityId: "server_error_capture",
			label: "Server error capture",
			detected: hasServerSignal,
			signals,
		}),
		createCapability({
			capabilityId: "runtime_intake",
			label: "Runtime intake or export path",
			detected: hasRuntimeIntake,
			signals,
		}),
		createCapability({
			capabilityId: "request_correlation",
			label: "Request or trace correlation",
			detected: hasRequestCorrelation,
			signals,
		}),
		createCapability({
			capabilityId: "source_map_release_link",
			label: "Source-map or release link",
			detected: hasSourceMapLink,
			signals,
		}),
		{
			capabilityId: "dashboard_access",
			label: "Provider dashboard access",
			status: hasProvider ? "blocked" : "missing",
			evidenceRefs: hasProvider
				? signals
						.filter(
							(signal) =>
								signal.kind === "provider_reference" ||
								signal.kind === "package_dependency",
						)
						.slice(0, 8)
						.map(formatSignalRef)
				: [],
			blockedReason: hasProvider
				? "Provider references exist, but dashboard access and provider project values require a separate approval."
				: "No provider reference was detected from repo-local metadata.",
		} satisfies ObservabilityCapability,
	];
}

function createCapability({
	capabilityId,
	label,
	detected,
	signals,
}: {
	capabilityId: ObservabilityCapability["capabilityId"];
	label: string;
	detected: boolean;
	signals: ObservabilitySignal[];
}): ObservabilityCapability {
	return {
		capabilityId,
		label,
		status: detected ? "detected" : "missing",
		evidenceRefs: detected ? signals.slice(0, 8).map(formatSignalRef) : [],
	};
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
}): Promise<ObservabilityDebuggabilityWorkflowResult> {
	const proofRef = `${localRunDirectoryRef}/proof.json`;
	const syncPreviewRef = `${localRunDirectoryRef}/sync-preview.json`;
	const createdArtifacts = [proofRef, syncPreviewRef];
	await mkdir(localRunDirectory, { recursive: true });
	await writeJsonArtifact(repositoryRoot, proofRef, {
		schemaVersion: "observability-debuggability-proof.v1",
		workflowId: OBSERVABILITY_WORKFLOW_ID,
		workflowVersion: OBSERVABILITY_WORKFLOW_VERSION,
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
				nextApprovalRequired: false,
			},
		],
		rollbackInstructions:
			"No observability audit writes were made. Fix the blocked condition and rerun the command.",
		nextRecommendedWorkflow: OBSERVABILITY_WORKFLOW_ID,
	});
	await writeJsonArtifact(repositoryRoot, syncPreviewRef, {
		schemaVersion: "observability-debuggability-sync-preview.v1",
		workflowId: OBSERVABILITY_WORKFLOW_ID,
		workflowVersion: OBSERVABILITY_WORKFLOW_VERSION,
		branchName,
		profileName,
		touchedFileRefs: [],
		createdArtifactRefs: createdArtifacts,
		proofCommandResults: [],
		blockedReason,
		nextRecommendedWorkflowId: OBSERVABILITY_WORKFLOW_ID,
	});
	await queueRunnerEvent(
		repositoryRoot,
		createRunnerEvent({
			projectId: state.projectId,
			runnerId: state.runnerId,
			workflowRunId,
			payload: {
				eventType: "workflow.blocked",
				workflowId: OBSERVABILITY_WORKFLOW_ID,
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
		workflowId: OBSERVABILITY_WORKFLOW_ID,
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
					"Approved observability branch already exists. Switch to it manually or delete it after review before rerunning.",
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
			: "Unable to create or check out the observability branch.",
	};
}

async function runProofCommands(repositoryRoot: string) {
	const commands: Array<{ commandName: string; args: string[] }> = [
		{ commandName: "git status --short", args: ["status", "--short"] },
		{ commandName: "git diff --name-only", args: ["diff", "--name-only"] },
		{ commandName: "git diff --check", args: ["diff", "--check"] },
	];
	const results: ProofCommandResult[] = [];
	const unexpectedTouchedFiles = new Set<string>();
	for (const command of commands) {
		const result = await runGit(repositoryRoot, command.args);
		const commandTouchedFiles =
			command.commandName === "git status --short"
				? parseGitStatusPaths(result.stdout)
				: command.commandName === "git diff --name-only"
					? parseGitNameOnlyPaths(result.stdout)
					: [];
		const unexpectedCommandTouchedFiles = commandTouchedFiles.filter(
			(repoRelativePath) => !isAllowedObservabilityTouch(repoRelativePath),
		);
		for (const repoRelativePath of unexpectedCommandTouchedFiles) {
			unexpectedTouchedFiles.add(repoRelativePath);
		}
		const succeeded =
			result.succeeded && unexpectedCommandTouchedFiles.length === 0;
		results.push({
			commandName: command.commandName,
			status: succeeded ? "passed" : "failed",
			exitCodeSummary: result.timedOut
				? "timed out"
				: !result.succeeded
					? "failed"
					: unexpectedCommandTouchedFiles.length > 0
						? "unexpected changed files"
						: "passed",
		});
	}

	return {
		proofCommandResults: results,
		unexpectedTouchedFiles: Array.from(unexpectedTouchedFiles).sort(),
	};
}

function parseGitStatusPaths(stdout: string) {
	return stdout
		.split(/\r?\n/)
		.flatMap((line) => {
			if (!line.trim()) {
				return [];
			}
			const pathText = line.slice(3).trim();
			if (pathText.includes(" -> ")) {
				return pathText.split(" -> ").map(cleanGitPath);
			}
			return [cleanGitPath(pathText)];
		})
		.filter(Boolean);
}

function parseGitNameOnlyPaths(stdout: string) {
	return stdout
		.split(/\r?\n/)
		.map((line) => cleanGitPath(line.trim()))
		.filter(Boolean);
}

function cleanGitPath(repoRelativePath: string) {
	if (
		(repoRelativePath.startsWith('"') && repoRelativePath.endsWith('"')) ||
		(repoRelativePath.startsWith("'") && repoRelativePath.endsWith("'"))
	) {
		return repoRelativePath.slice(1, -1);
	}
	return repoRelativePath;
}

function isAllowedObservabilityTouch(repoRelativePath: string) {
	return (
		repoRelativePath === ".sbs" ||
		repoRelativePath.startsWith(".sbs/") ||
		repoRelativePath === ".sbs/.gitignore"
	);
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

async function runGit(repositoryRoot: string, args: string[]) {
	return await runBoundedProcess({
		command: "git",
		args,
		cwd: repositoryRoot,
		timeoutMs: 10_000,
	});
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

function shouldSkipDirectory(directoryName: string) {
	return [
		".git",
		".next",
		".sbs",
		"node_modules",
		"dist",
		"build",
		"coverage",
		".turbo",
	].includes(directoryName);
}

function isTextScanCandidate(lowerPath: string) {
	return /\.(cjs|cts|js|jsx|json|mjs|mts|ts|tsx|md|mdx|toml|yaml|yml)$/.test(
		lowerPath,
	);
}

function isObservabilityPath(lowerPath: string) {
	return /observability|telemetry|instrumentation|logger|logging|error-boundary|client-error|runtime-intake|sentry|posthog|opentelemetry|datadog|newrelic/.test(
		lowerPath,
	);
}

function detectProviders(contents: string) {
	const providers = new Set<string>();
	for (const provider of [
		"posthog",
		"sentry",
		"opentelemetry",
		"datadog",
		"new relic",
		"newrelic",
	]) {
		if (contents.includes(provider)) {
			providers.add(provider === "newrelic" ? "new relic" : provider);
		}
	}
	return Array.from(providers).sort();
}

function normalizeProviderName(packageName: string) {
	const lowerName = packageName.toLowerCase();
	if (lowerName.includes("posthog")) {
		return "posthog";
	}
	if (lowerName.includes("sentry")) {
		return "sentry";
	}
	if (lowerName.includes("opentelemetry") || lowerName.includes("otel")) {
		return "opentelemetry";
	}
	if (lowerName.includes("datadog")) {
		return "datadog";
	}
	if (lowerName.includes("newrelic") || lowerName.includes("new-relic")) {
		return "new relic";
	}
	return null;
}

function dedupeSignals(signals: ObservabilitySignal[]) {
	const seen = new Set<string>();
	const deduped: ObservabilitySignal[] = [];
	for (const signal of signals) {
		const key = `${signal.kind}:${signal.label}:${signal.repoRelativePath ?? ""}`;
		if (seen.has(key)) {
			continue;
		}
		seen.add(key);
		deduped.push(signal);
	}
	return deduped;
}

function formatSignalRef(signal: ObservabilitySignal) {
	return signal.repoRelativePath
		? `${signal.label} at ${signal.repoRelativePath}`
		: signal.label;
}

function toRepoRelativePath(repositoryRoot: string, absolutePath: string) {
	return path.relative(repositoryRoot, absolutePath).split(path.sep).join("/");
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
	if (!/^sbs\/observability-debuggability-\d{8}-\d{4}$/.test(branchName)) {
		throw new Error(
			"branchName must match the approved observability branch pattern.",
		);
	}
}

function assertApprovedProfile(profileName: string) {
	if (profileName !== DEFAULT_PROFILE_NAME) {
		throw new Error(
			"profileName must match the approved SBS workspace profile.",
		);
	}
}
