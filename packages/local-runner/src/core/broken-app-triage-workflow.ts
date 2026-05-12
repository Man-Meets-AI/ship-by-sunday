import path from "node:path";

import type { JsonValue } from "./json-value";
import { runBoundedProcess } from "./bounded-process";
import type { RunnerCredential } from "./local-runner-home";
import type { LocalProjectState } from "./local-project-state";
import { ensureLocalProjectStateDirectory } from "./local-project-state";
import {
	ensureRepositoryDirectory,
	writeRepositoryTextFile,
} from "./repository-boundary";
import {
	createRunnerEvent,
	flushRunnerEvents,
	queueRunnerEvent,
} from "./runner-events";
import type { ApprovedWorkflowRunPacket } from "./workflow-run-api";

const BROKEN_APP_TRIAGE_WORKFLOW_ID = "broken-app-triage";
const BROKEN_APP_TRIAGE_WORKFLOW_VERSION = "v1";
const NEXT_RECOMMENDED_WORKFLOW_ID = "broken-app-triage";

type ReproductionCommandResult = {
	commandName: string;
	status: "reproduced" | "not_reproduced" | "blocked" | "skipped";
	exitCodeSummary: string;
};

export type BrokenAppTriageWorkflowResult = {
	workflowRunId: string;
	workflowId: typeof BROKEN_APP_TRIAGE_WORKFLOW_ID;
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

type RunBrokenAppTriageWorkflowOptions = {
	repositoryRoot: string;
	state: LocalProjectState;
	credential: RunnerCredential;
	approvedWorkflowRun: ApprovedWorkflowRunPacket;
	confirmReadOnlyReproduction: boolean;
	now?: number;
	fetchRunnerEvent?: typeof fetch;
};

export async function runBrokenAppTriageWorkflow({
	repositoryRoot,
	state,
	credential,
	approvedWorkflowRun,
	confirmReadOnlyReproduction,
	now = Date.now(),
	fetchRunnerEvent,
}: RunBrokenAppTriageWorkflowOptions): Promise<BrokenAppTriageWorkflowResult> {
	if (!confirmReadOnlyReproduction) {
		throw new Error(
			"broken-app-triage requires --confirm-read-only-reproduction before it can run approved diagnostic commands.",
		);
	}
	if (approvedWorkflowRun.workflowId !== BROKEN_APP_TRIAGE_WORKFLOW_ID) {
		throw new Error("Approved workflow run is not broken-app-triage.");
	}

	const {
		workflowRunId,
		branchName,
		profileName,
		writeLeaseId,
		writeLeaseExpiresAt,
	} = approvedWorkflowRun;
	const localRunDirectoryRef = `.sbs/runs/${workflowRunId}`;
	const localRunDirectory = path.join(repositoryRoot, localRunDirectoryRef);
	assertSafeWorkflowRunId(workflowRunId);
	assertSafeBranchName(branchName);

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
				"Approved write lease expired before read-only diagnostics started.",
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
				? "Worktree is dirty before broken-app diagnostics."
				: "Unable to inspect Git dirty state before broken-app diagnostics.",
			fetchRunnerEvent,
		});
	}

	await ensureLocalProjectStateDirectory(repositoryRoot, {
		updateGitExclude: false,
	});
	await ensureRepositoryDirectory(repositoryRoot, localRunDirectoryRef);

	await queueRunnerEvent(
		repositoryRoot,
		createRunnerEvent({
			projectId: state.projectId,
			runnerId: state.runnerId,
			workflowRunId,
			payload: {
				eventType: "workflow.started",
				workflowId: BROKEN_APP_TRIAGE_WORKFLOW_ID,
				branchName,
				profileName,
			},
		}),
		{ updateGitExclude: false },
	);

	const workflowPacketRef = `${localRunDirectoryRef}/workflow-packet.json`;
	const proofRef = `${localRunDirectoryRef}/proof.json`;
	const syncPreviewRef = `${localRunDirectoryRef}/sync-preview.json`;
	const commandResults = await runApprovedDiagnosticCommands({
		repositoryRoot,
		proofCommands: approvedWorkflowRun.proofCommands,
	});
	const runnableResults = commandResults.filter(
		(result) => result.status !== "skipped",
	);
	if (runnableResults.length === 0) {
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
			blockedStage: "reproduction-command",
			blockedReason:
				"No approved read-only diagnostic command was available to run.",
			fetchRunnerEvent,
		});
	}
	const blockedCommand = runnableResults.find(
		(result) => result.status === "blocked",
	);
	if (blockedCommand) {
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
			blockedStage: "reproduction-command",
			blockedReason: `${blockedCommand.commandName} ${blockedCommand.exitCodeSummary}.`,
			fetchRunnerEvent,
		});
	}

	const reproductionStatus = commandResults.some(
		(result) => result.status === "reproduced",
	)
		? "reproduced"
		: "not_reproduced";
	const proofStatus = reproductionStatus === "reproduced" ? "passed" : "failed";
	const createdArtifacts = [workflowPacketRef, proofRef, syncPreviewRef];
	const proofSummary =
		reproductionStatus === "reproduced"
			? "Broken-app triage reproduced a failing command without patching source files."
			: "Broken-app triage ran approved commands but did not reproduce the reported failure.";

	await writeJsonArtifact(repositoryRoot, workflowPacketRef, {
		schemaVersion: "broken-app-triage-workflow-packet.v1",
		workflowId: BROKEN_APP_TRIAGE_WORKFLOW_ID,
		workflowVersion: BROKEN_APP_TRIAGE_WORKFLOW_VERSION,
		projectId: state.projectId,
		runnerId: state.runnerId,
		profileName,
		branchName,
		writeLeaseExpiresAt,
		dirtyStatePolicy: "require_clean_worktree",
		approvedWorkflowRunId: workflowRunId,
		proofCommands: approvedWorkflowRun.proofCommands,
		approvalRequiredForPatch: true,
		createdAt: now,
	});
	await writeJsonArtifact(repositoryRoot, proofRef, {
		schemaVersion: "broken-app-triage-proof.v1",
		workflowId: BROKEN_APP_TRIAGE_WORKFLOW_ID,
		workflowVersion: BROKEN_APP_TRIAGE_WORKFLOW_VERSION,
		workflowRunId,
		branchName,
		profileName,
		reproductionStatus,
		commandResults,
		touchedFiles: [],
		createdArtifacts,
		blockedProof: null,
		patchApprovalRequired: true,
		rollbackInstructions:
			"No source files were patched. Review the diagnostics proof before approving any repair workflow.",
		nextRecommendedWorkflow: NEXT_RECOMMENDED_WORKFLOW_ID,
		createdAt: now,
	});
	await writeJsonArtifact(repositoryRoot, syncPreviewRef, {
		schemaVersion: "broken-app-triage-sync-preview.v1",
		workflowId: BROKEN_APP_TRIAGE_WORKFLOW_ID,
		workflowVersion: BROKEN_APP_TRIAGE_WORKFLOW_VERSION,
		branchName,
		profileName,
		touchedFileRefs: [],
		createdArtifactRefs: createdArtifacts,
		proofCommandResults: commandResults.map(({ commandName, status }) => ({
			commandName,
			status: toWorkflowProofCommandStatus(status),
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
				workflowId: BROKEN_APP_TRIAGE_WORKFLOW_ID,
				writeLeaseId,
				proofStatus,
				proofSummary,
				touchedFileRefs: [],
				createdArtifactRefs: createdArtifacts,
				proofCommandResults: commandResults.map(({ commandName, status }) => ({
					commandName,
					status: toWorkflowProofCommandStatus(status),
				})),
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
		workflowId: BROKEN_APP_TRIAGE_WORKFLOW_ID,
		status: "proof_completed",
		branchName,
		profileName,
		proofStatus,
		localRunDirectoryRef,
		touchedFiles: [],
		createdArtifacts,
		deliveredEvents: flushResult.delivered,
		remainingEvents: flushResult.remaining,
	};
}

function toWorkflowProofCommandStatus(
	status: ReproductionCommandResult["status"],
) {
	if (status === "reproduced") {
		return "failed" as const;
	}
	if (status === "blocked" || status === "skipped") {
		return "blocked" as const;
	}
	return "passed" as const;
}

async function runApprovedDiagnosticCommands({
	repositoryRoot,
	proofCommands,
}: {
	repositoryRoot: string;
	proofCommands: string[];
}) {
	const results: ReproductionCommandResult[] = [];
	for (const proofCommand of proofCommands) {
		const command = resolveSafeDiagnosticCommand(proofCommand);
		if (!command) {
			results.push({
				commandName: proofCommand,
				status: "skipped",
				exitCodeSummary: "unsupported diagnostic command",
			});
			continue;
		}
		const result = await runBoundedProcess({
			command: command.command,
			args: command.args,
			cwd: repositoryRoot,
			timeoutMs: 30_000,
		});
		results.push({
			commandName: proofCommand,
			status: result.timedOut
				? "blocked"
				: result.succeeded
					? "not_reproduced"
					: "reproduced",
			exitCodeSummary: result.timedOut
				? "timed out"
				: result.succeeded
					? "passed"
					: `failed with exit ${result.exitCode ?? "unknown"}`,
		});
	}
	return results;
}

function resolveSafeDiagnosticCommand(proofCommand: string) {
	if (proofCommand === "git status --short") {
		return { command: "git", args: ["status", "--short"] };
	}
	if (proofCommand === "git diff --name-only") {
		return { command: "git", args: ["diff", "--name-only"] };
	}
	return null;
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
}): Promise<BrokenAppTriageWorkflowResult> {
	const proofRef = `${localRunDirectoryRef}/proof.json`;
	const syncPreviewRef = `${localRunDirectoryRef}/sync-preview.json`;
	const createdArtifacts = [proofRef, syncPreviewRef];
	void localRunDirectory;
	await ensureRepositoryDirectory(repositoryRoot, localRunDirectoryRef);
	await writeJsonArtifact(repositoryRoot, proofRef, {
		schemaVersion: "broken-app-triage-proof.v1",
		workflowId: BROKEN_APP_TRIAGE_WORKFLOW_ID,
		workflowVersion: BROKEN_APP_TRIAGE_WORKFLOW_VERSION,
		workflowRunId,
		branchName,
		profileName,
		reproductionStatus: "blocked",
		commandResults: [],
		touchedFiles: [],
		createdArtifacts,
		blockedProof: {
			stage: blockedStage,
			reason: blockedReason,
		},
		patchApprovalRequired: true,
		rollbackInstructions:
			"No source files were patched. Fix the blocked condition and rerun read-only diagnostics.",
		nextRecommendedWorkflow: BROKEN_APP_TRIAGE_WORKFLOW_ID,
	});
	await writeJsonArtifact(repositoryRoot, syncPreviewRef, {
		schemaVersion: "broken-app-triage-sync-preview.v1",
		workflowId: BROKEN_APP_TRIAGE_WORKFLOW_ID,
		workflowVersion: BROKEN_APP_TRIAGE_WORKFLOW_VERSION,
		branchName,
		profileName,
		touchedFileRefs: [],
		createdArtifactRefs: createdArtifacts,
		proofCommandResults: [],
		blockedReason,
		nextRecommendedWorkflowId: BROKEN_APP_TRIAGE_WORKFLOW_ID,
	});
	await queueRunnerEvent(
		repositoryRoot,
		createRunnerEvent({
			projectId: state.projectId,
			runnerId: state.runnerId,
			workflowRunId,
			payload: {
				eventType: "workflow.blocked",
				workflowId: BROKEN_APP_TRIAGE_WORKFLOW_ID,
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
		workflowId: BROKEN_APP_TRIAGE_WORKFLOW_ID,
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

async function writeJsonArtifact(
	repositoryRoot: string,
	repoRelativePath: string,
	value: JsonValue,
) {
	await writeRepositoryTextFile(
		repositoryRoot,
		repoRelativePath,
		`${JSON.stringify(value, null, 2)}\n`,
	);
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
		!/^[A-Za-z0-9/_-]+$/.test(branchName)
	) {
		throw new Error("Approved branch name is not safe.");
	}
}
