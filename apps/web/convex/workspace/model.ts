import { ConvexError, v } from "convex/values";

import { requireExistingCodebaseProductAccess } from "../access/model";
import {
	assertSyncSafeText,
	assertSyncSafeValue,
	assertWorkspaceRunnerEventPayload,
	getWorkspaceRunnerEventSchemaVersion,
} from "./events";
import type {
	CodebaseFindingInput,
	CodebaseFindingId,
	DoctorPassRunId,
	ManagedGithubExecutionConsentId,
	WorkflowRunDoc,
	WorkflowRunId,
	WorkspaceMutationCtx,
	WorkspaceProjectDoc,
	WorkspaceProjectId,
	WorkspaceQueryCtx,
	WorkspaceReadCtx,
	WorkspaceRepositoryBindingId,
	WorkspaceRunnerBindingDoc,
	WorkspaceRunnerBindingId,
	WorkspaceRunnerEventPayload,
	WorkspaceRunnerEventType,
} from "./types";
import {
	codebaseFindingDocumentValidator,
	codebaseFindingInputValidator,
	codebaseFindingStatusValidator,
	doctorPassRunDocumentValidator,
	managedGithubConsentAcknowledgementValidator,
	managedGithubExecutionStateValidator,
	packageManagerValidator,
	workspaceCreateOrLoadResultValidator,
	workspaceDefaultOpenDestinationValidator,
	workspaceDeleteMarkerResultValidator,
	workspaceFindingsSyncResultValidator,
	workspaceHeartbeatStateValidator,
	workspaceProjectStateValidator,
	workspaceRepositoryBindingDocumentValidator,
	workspaceRepositoryProviderValidator,
	workspaceRunHistoryValidator,
	workspaceRunnerBindingDocumentValidator,
	workspaceRunnerEventIngestResultValidator,
	workspaceRunnerEventPayloadValidator,
	workspaceRunnerEventSchemaVersionValidator,
	workspaceRunnerEventTypeValidator,
	workspaceRunnerModeValidator,
	workspaceRunnerWorkflowApprovalValidator,
	workspaceSetupStateValidator,
	workspaceSyncPreviewStateValidator,
	workspaceWorkerQueueStateValidator,
	workflowDirtyStatePolicyValidator,
	workflowRunDocumentValidator,
} from "./validators";

const DEFAULT_WORKSPACE_PROJECT_NAME = "Existing codebase workspace";
const MAX_SYNCED_FINDINGS_PER_RUN = 9;
const PAIRING_TOKEN_TTL_MS = 30 * 60 * 1000;
const SETUP_EVENT_READ_LIMIT = 30;
const DOCTOR_PASS_LOCAL_SCHEMA_VERSION = "doctor-pass-local.v1";
const SOURCE_TRUTH_WORKFLOW_ID = "source-truth-agent-readiness";
const OBSERVABILITY_WORKFLOW_ID = "observability-debuggability";
const BROKEN_APP_TRIAGE_WORKFLOW_ID = "broken-app-triage";
const MATURE_REPO_ADOPTION_WORKFLOW_ID = "mature-repo-adoption";
const OBSERVABILITY_PROFILE_NAME = "sbs-workspace-write";
const DEFAULT_WORKFLOW_VERSION = "v1";
const WORKFLOW_APPROVAL_SCHEMA_VERSION = "workspace.workflow-approval.v1";
const DEFAULT_WORKFLOW_WRITE_LEASE_MINUTES = 30;
const MAX_WORKFLOW_LIST_ENTRIES = 32;
const MANAGED_GITHUB_CONSENT_SCHEMA_VERSION =
	"managed-github-consent.v1" as const;
const APPROVED_WORKFLOW_HISTORY_STATUSES = [
	"approved",
	"paused",
	"running",
	"proof_completed",
	"blocked",
	"canceled",
] as const;
const OBSERVABILITY_EXPECTED_OUTPUTS = [
	"observability workflow packet",
	"sync-safe debuggability audit",
	"provider setup and dashboard access blocked-proof notes",
	"local proof or blocked-proof summary",
	"next recommended workflow",
] as const;
const OBSERVABILITY_ALLOWED_TOUCH_TARGETS = [
	".sbs/runs/<workflow-run-id> workflow artifacts",
	".sbs/observability debuggability audit artifacts",
	"repo-relative observability signal metadata only",
] as const;
const WORKFLOW_DISALLOWED_TOUCH_TARGETS = [
	"runtime app code",
	"environment files",
	"dependency manifests",
	"dependency locks",
	"database migrations",
	"provider configuration",
	"generated folders",
	"package scripts",
] as const;
const MATURE_REPO_ADOPTION_DISALLOWED_TOUCH_TARGETS = [
	...WORKFLOW_DISALLOWED_TOUCH_TARGETS,
	"root agent instructions",
	"CI configuration",
	"CI-affecting commands",
	"branch pushes",
	"pull requests",
	"raw logs",
	"raw source",
	"Codex transcripts",
] as const;
const OBSERVABILITY_PROOF_COMMANDS = [
	"git status --short",
	"git diff --name-only",
	"git diff --check",
] as const;
const WORKFLOW_SYNC_POLICY_SUMMARY =
	"Only approved structured workflow metadata, proof status, command names, artifact names, and repo-relative refs sync. Local code, command output, and Codex session history stay on the machine.";
const OBSERVABILITY_STOP_CONDITIONS = [
	"worktree is dirty before branch creation",
	"write lease expires before local audit starts",
	"requested work needs runtime code, provider setup, dependencies, package scripts, CI, PRs, source maps, dashboards, or deployment proof",
	"proof command fails",
] as const;
const OBSERVABILITY_ROLLBACK_NOTES =
	"Keep the branch local by default. Roll back with git switch back to the base branch and git branch -D the observability branch after reviewing local proof.";
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
const MATURE_REPO_ADOPTION_STOP_CONDITIONS = [
	"worktree is dirty before branch creation",
	"write lease expires before adoption audit starts",
	"requested work needs generated-starter rewrites, provider setup, package installs, migrations, CI, PRs, branch pushes, raw source, raw logs, or Codex transcripts",
	"proof command fails",
] as const;
const MATURE_REPO_ADOPTION_ROLLBACK_NOTES =
	"Keep the branch local by default. Roll back with git switch back to the base branch and git branch -D the mature adoption branch after reviewing local proof.";

export const getWorkspaceProjectStateArgs = {
	projectId: v.optional(v.id("workspaceProjects")),
};
export const getWorkspaceProjectStateReturns = workspaceProjectStateValidator;

export const getWorkspaceSetupStateArgs = {
	projectId: v.optional(v.id("workspaceProjects")),
};
export const getWorkspaceSetupStateReturns = workspaceSetupStateValidator;

export const createOrLoadWorkspaceProjectArgs = {
	displayName: v.optional(v.string()),
	defaultOpenDestination: v.optional(workspaceDefaultOpenDestinationValidator),
};
export const createOrLoadWorkspaceProjectReturns =
	workspaceCreateOrLoadResultValidator;

export const prepareWorkspaceSetupPairingArgs = {
	projectId: v.optional(v.id("workspaceProjects")),
	runnerMode: workspaceRunnerModeValidator,
	regenerate: v.optional(v.boolean()),
};
export const prepareWorkspaceSetupPairingReturns = workspaceSetupStateValidator;

export const cancelWorkspaceSetupPairingArgs = {
	projectId: v.id("workspaceProjects"),
	runnerId: v.id("workspaceRunnerBindings"),
};
export const cancelWorkspaceSetupPairingReturns = workspaceSetupStateValidator;

export const bindWorkspaceRunnerArgs = {
	projectId: v.id("workspaceProjects"),
	runnerMode: workspaceRunnerModeValidator,
	runnerLabel: v.optional(v.string()),
	machineDisplayName: v.optional(v.string()),
	runnerVersion: v.optional(v.string()),
};
export const bindWorkspaceRunnerReturns =
	workspaceRunnerBindingDocumentValidator;

export const bindWorkspaceRunnerByPairingTokenArgs = {
	pairingToken: v.string(),
	runnerCredentialHash: v.string(),
	runnerMode: workspaceRunnerModeValidator,
	runnerLabel: v.optional(v.string()),
	machineDisplayName: v.optional(v.string()),
	runnerVersion: v.optional(v.string()),
};
export const bindWorkspaceRunnerByPairingTokenReturns = v.object({
	projectId: v.id("workspaceProjects"),
	runnerId: v.id("workspaceRunnerBindings"),
	runnerMode: workspaceRunnerModeValidator,
	pairingStatus: v.literal("paired"),
});

export const bindWorkspaceRepositoryArgs = {
	projectId: v.id("workspaceProjects"),
	runnerId: v.optional(v.id("workspaceRunnerBindings")),
	displayName: v.string(),
	provider: workspaceRepositoryProviderValidator,
	remoteHost: v.optional(v.string()),
	remoteOwner: v.optional(v.string()),
	remoteName: v.optional(v.string()),
	defaultBranch: v.optional(v.string()),
	packageManager: v.optional(packageManagerValidator),
};
export const bindWorkspaceRepositoryReturns =
	workspaceRepositoryBindingDocumentValidator;

export const startWorkspaceDoctorPassRunArgs = {
	projectId: v.id("workspaceProjects"),
	runnerId: v.optional(v.id("workspaceRunnerBindings")),
	repositoryBindingId: v.optional(v.id("workspaceRepositoryBindings")),
	localRunId: v.optional(v.string()),
	runnerMode: workspaceRunnerModeValidator,
};
export const startWorkspaceDoctorPassRunReturns =
	doctorPassRunDocumentValidator;

export const startWorkspaceDoctorPassRunByCredentialArgs = {
	runnerCredentialHash: v.string(),
	projectId: v.id("workspaceProjects"),
	runnerId: v.id("workspaceRunnerBindings"),
	localRunId: v.string(),
	runnerMode: workspaceRunnerModeValidator,
};
export const startWorkspaceDoctorPassRunByCredentialReturns = v.object({
	doctorPassRunId: v.id("doctorPassRuns"),
	startedAt: v.number(),
});

export const requestWorkspaceWorkflowRunArgs = {
	projectId: v.id("workspaceProjects"),
	findingDocumentId: v.id("codebaseFindings"),
	runnerId: v.id("workspaceRunnerBindings"),
	workflowId: v.string(),
	workflowVersion: v.optional(v.string()),
	branchName: v.string(),
	profileName: v.string(),
	writeLeaseDurationMinutes: v.optional(v.number()),
	dirtyStatePolicy: v.optional(workflowDirtyStatePolicyValidator),
	expectedOutputs: v.array(v.string()),
	allowedTouchTargets: v.array(v.string()),
	disallowedTouchTargets: v.array(v.string()),
	proofCommands: v.array(v.string()),
	syncPolicySummary: v.string(),
	stopConditions: v.array(v.string()),
	rollbackNotes: v.string(),
};
export const requestWorkspaceWorkflowRunReturns = workflowRunDocumentValidator;

export const getWorkspaceWorkflowRunByCredentialArgs = {
	runnerCredentialHash: v.string(),
	projectId: v.id("workspaceProjects"),
	runnerId: v.id("workspaceRunnerBindings"),
	workflowRunId: v.id("workflowRuns"),
};
export const getWorkspaceWorkflowRunByCredentialReturns =
	workspaceRunnerWorkflowApprovalValidator;

export const claimWorkspaceWorkflowRunByCredentialArgs = {
	runnerCredentialHash: v.string(),
	projectId: v.id("workspaceProjects"),
	runnerId: v.id("workspaceRunnerBindings"),
};
export const claimWorkspaceWorkflowRunByCredentialReturns = v.union(
	workspaceRunnerWorkflowApprovalValidator,
	v.null(),
);

export const getWorkspaceWorkerQueueStateArgs = {
	projectId: v.optional(v.id("workspaceProjects")),
};
export const getWorkspaceWorkerQueueStateReturns =
	workspaceWorkerQueueStateValidator;

export const pauseWorkspaceWorkflowRunArgs = {
	projectId: v.id("workspaceProjects"),
	workflowRunId: v.id("workflowRuns"),
	reason: v.optional(v.string()),
};
export const pauseWorkspaceWorkflowRunReturns = workflowRunDocumentValidator;

export const resumeWorkspaceWorkflowRunArgs = {
	projectId: v.id("workspaceProjects"),
	workflowRunId: v.id("workflowRuns"),
};
export const resumeWorkspaceWorkflowRunReturns = workflowRunDocumentValidator;

export const stopWorkspaceWorkflowRunArgs = {
	projectId: v.id("workspaceProjects"),
	workflowRunId: v.id("workflowRuns"),
	reason: v.optional(v.string()),
};
export const stopWorkspaceWorkflowRunReturns = workflowRunDocumentValidator;

export const ingestWorkspaceRunnerEventArgs = {
	eventId: v.string(),
	projectId: v.id("workspaceProjects"),
	runnerId: v.id("workspaceRunnerBindings"),
	doctorPassRunId: v.optional(v.id("doctorPassRuns")),
	workflowRunId: v.optional(v.id("workflowRuns")),
	eventType: workspaceRunnerEventTypeValidator,
	schemaVersion: workspaceRunnerEventSchemaVersionValidator,
	createdAt: v.number(),
	payload: workspaceRunnerEventPayloadValidator,
};
export const ingestWorkspaceRunnerEventReturns =
	workspaceRunnerEventIngestResultValidator;

export const ingestWorkspaceRunnerEventByCredentialArgs = {
	runnerCredentialHash: v.string(),
	eventId: v.string(),
	projectId: v.id("workspaceProjects"),
	runnerId: v.id("workspaceRunnerBindings"),
	doctorPassRunId: v.optional(v.id("doctorPassRuns")),
	workflowRunId: v.optional(v.id("workflowRuns")),
	eventType: workspaceRunnerEventTypeValidator,
	schemaVersion: workspaceRunnerEventSchemaVersionValidator,
	createdAt: v.number(),
	payload: workspaceRunnerEventPayloadValidator,
};
export const ingestWorkspaceRunnerEventByCredentialReturns =
	workspaceRunnerEventIngestResultValidator;

export const approveWorkspaceSyncPreviewArgs = {
	projectId: v.id("workspaceProjects"),
	doctorPassRunId: v.id("doctorPassRuns"),
	previewDigest: v.string(),
};
export const approveWorkspaceSyncPreviewReturns =
	doctorPassRunDocumentValidator;

export const syncApprovedCodebaseFindingsArgs = {
	projectId: v.id("workspaceProjects"),
	doctorPassRunId: v.id("doctorPassRuns"),
	previewDigest: v.string(),
	findings: v.array(codebaseFindingInputValidator),
};
export const syncApprovedCodebaseFindingsReturns =
	workspaceFindingsSyncResultValidator;

export const syncApprovedCodebaseFindingsByCredentialArgs = {
	runnerCredentialHash: v.string(),
	projectId: v.id("workspaceProjects"),
	runnerId: v.id("workspaceRunnerBindings"),
	doctorPassRunId: v.id("doctorPassRuns"),
	previewDigest: v.string(),
	findings: v.array(codebaseFindingInputValidator),
};
export const syncApprovedCodebaseFindingsByCredentialReturns =
	workspaceFindingsSyncResultValidator;

export const listWorkspaceFindingsArgs = {
	projectId: v.optional(v.id("workspaceProjects")),
	status: v.optional(codebaseFindingStatusValidator),
};
export const listWorkspaceFindingsReturns = v.array(
	codebaseFindingDocumentValidator,
);

export const getWorkspaceRunHistoryArgs = {
	projectId: v.optional(v.id("workspaceProjects")),
};
export const getWorkspaceRunHistoryReturns = workspaceRunHistoryValidator;

export const getWorkspaceHeartbeatStateArgs = {
	projectId: v.optional(v.id("workspaceProjects")),
};
export const getWorkspaceHeartbeatStateReturns =
	workspaceHeartbeatStateValidator;

export const getWorkspaceSyncPreviewStateArgs = {
	projectId: v.optional(v.id("workspaceProjects")),
};
export const getWorkspaceSyncPreviewStateReturns =
	workspaceSyncPreviewStateValidator;

export const revokeWorkspaceRunnerArgs = {
	projectId: v.id("workspaceProjects"),
	runnerId: v.id("workspaceRunnerBindings"),
	reason: v.optional(v.string()),
};
export const revokeWorkspaceRunnerReturns =
	workspaceRunnerBindingDocumentValidator;

export const getManagedGithubExecutionStateArgs = {
	projectId: v.optional(v.id("workspaceProjects")),
};
export const getManagedGithubExecutionStateReturns =
	managedGithubExecutionStateValidator;

export const requestManagedGithubExecutionConsentArgs = {
	projectId: v.id("workspaceProjects"),
	repositoryBindingId: v.id("workspaceRepositoryBindings"),
	acknowledgement: managedGithubConsentAcknowledgementValidator,
};
export const requestManagedGithubExecutionConsentReturns =
	managedGithubExecutionStateValidator;

export const revokeManagedGithubExecutionConsentArgs = {
	projectId: v.id("workspaceProjects"),
	consentId: v.id("managedGithubExecutionConsents"),
	reason: v.optional(v.string()),
};
export const revokeManagedGithubExecutionConsentReturns =
	managedGithubExecutionStateValidator;

export const markWorkspaceFindingsDeletedArgs = {
	projectId: v.id("workspaceProjects"),
	findingDocumentIds: v.array(v.id("codebaseFindings")),
};
export const markWorkspaceFindingsDeletedReturns =
	workspaceDeleteMarkerResultValidator;

export const markWorkspaceProjectDeletedArgs = {
	projectId: v.id("workspaceProjects"),
};
export const markWorkspaceProjectDeletedReturns =
	workspaceDeleteMarkerResultValidator;

function normalizeProjectName(displayName?: string) {
	const projectName = displayName?.trim() || DEFAULT_WORKSPACE_PROJECT_NAME;
	assertSyncSafeText(projectName, "workspace project displayName");
	return projectName;
}

function assertBoundedText(value: string | undefined, context: string) {
	if (value === undefined) {
		return;
	}

	assertSyncSafeText(value, context);
}

function assertBoundedTextList(
	values: string[],
	context: string,
	maxEntries = MAX_WORKFLOW_LIST_ENTRIES,
) {
	if (values.length > maxEntries) {
		throw new ConvexError(`${context} has too many entries`);
	}

	values.forEach((value, index) => {
		assertSyncSafeText(value, `${context}[${index}]`);
	});
}

function assertExactTextList(
	values: string[],
	expectedValues: readonly string[],
	context: string,
) {
	const matches =
		values.length === expectedValues.length &&
		values.every((value, index) => value === expectedValues[index]);
	if (!matches) {
		throw new ConvexError(
			`${context} does not match the approved workflow packet`,
		);
	}
}

function assertObservabilityWorkflowApprovalPacket(args: {
	profileName: string;
	dirtyStatePolicy?: "require_clean_worktree" | "checkpoint_required";
	expectedOutputs: string[];
	allowedTouchTargets: string[];
	disallowedTouchTargets: string[];
	proofCommands: string[];
	syncPolicySummary: string;
	stopConditions: string[];
	rollbackNotes: string;
}) {
	if (args.profileName !== OBSERVABILITY_PROFILE_NAME) {
		throw new ConvexError("Observability profile name is not approved");
	}
	if (
		args.dirtyStatePolicy !== undefined &&
		args.dirtyStatePolicy !== "require_clean_worktree"
	) {
		throw new ConvexError("Observability requires a clean-worktree policy");
	}
	assertExactTextList(
		args.expectedOutputs,
		OBSERVABILITY_EXPECTED_OUTPUTS,
		"Observability expectedOutputs",
	);
	assertExactTextList(
		args.allowedTouchTargets,
		OBSERVABILITY_ALLOWED_TOUCH_TARGETS,
		"Observability allowedTouchTargets",
	);
	assertExactTextList(
		args.disallowedTouchTargets,
		WORKFLOW_DISALLOWED_TOUCH_TARGETS,
		"Observability disallowedTouchTargets",
	);
	assertExactTextList(
		args.proofCommands,
		OBSERVABILITY_PROOF_COMMANDS,
		"Observability proofCommands",
	);
	if (args.syncPolicySummary !== WORKFLOW_SYNC_POLICY_SUMMARY) {
		throw new ConvexError(
			"Observability syncPolicySummary does not match the approved workflow packet",
		);
	}
	assertExactTextList(
		args.stopConditions,
		OBSERVABILITY_STOP_CONDITIONS,
		"Observability stopConditions",
	);
	if (args.rollbackNotes !== OBSERVABILITY_ROLLBACK_NOTES) {
		throw new ConvexError(
			"Observability rollbackNotes does not match the approved workflow packet",
		);
	}
}

function assertMatureRepoAdoptionWorkflowApprovalPacket(args: {
	workflowVersion?: string;
	profileName: string;
	writeLeaseDurationMinutes?: number;
	dirtyStatePolicy?: "require_clean_worktree" | "checkpoint_required";
	expectedOutputs: string[];
	allowedTouchTargets: string[];
	disallowedTouchTargets: string[];
	proofCommands: string[];
	syncPolicySummary: string;
	stopConditions: string[];
	rollbackNotes: string;
}) {
	if (args.profileName !== OBSERVABILITY_PROFILE_NAME) {
		throw new ConvexError("Mature repo adoption profile name is not approved");
	}
	if (
		args.workflowVersion !== undefined &&
		args.workflowVersion !== DEFAULT_WORKFLOW_VERSION
	) {
		throw new ConvexError(
			"Mature repo adoption workflow version is not approved",
		);
	}
	if (
		args.writeLeaseDurationMinutes !== undefined &&
		args.writeLeaseDurationMinutes !== DEFAULT_WORKFLOW_WRITE_LEASE_MINUTES
	) {
		throw new ConvexError(
			"Mature repo adoption write lease duration is not approved",
		);
	}
	if (
		args.dirtyStatePolicy !== undefined &&
		args.dirtyStatePolicy !== "require_clean_worktree"
	) {
		throw new ConvexError(
			"Mature repo adoption requires a clean-worktree policy",
		);
	}
	assertExactTextList(
		args.expectedOutputs,
		MATURE_REPO_ADOPTION_EXPECTED_OUTPUTS,
		"Mature repo adoption expectedOutputs",
	);
	assertExactTextList(
		args.allowedTouchTargets,
		MATURE_REPO_ADOPTION_ALLOWED_TOUCH_TARGETS,
		"Mature repo adoption allowedTouchTargets",
	);
	assertExactTextList(
		args.disallowedTouchTargets,
		MATURE_REPO_ADOPTION_DISALLOWED_TOUCH_TARGETS,
		"Mature repo adoption disallowedTouchTargets",
	);
	assertExactTextList(
		args.proofCommands,
		OBSERVABILITY_PROOF_COMMANDS,
		"Mature repo adoption proofCommands",
	);
	if (args.syncPolicySummary !== WORKFLOW_SYNC_POLICY_SUMMARY) {
		throw new ConvexError(
			"Mature repo adoption syncPolicySummary does not match the approved workflow packet",
		);
	}
	assertExactTextList(
		args.stopConditions,
		MATURE_REPO_ADOPTION_STOP_CONDITIONS,
		"Mature repo adoption stopConditions",
	);
	if (args.rollbackNotes !== MATURE_REPO_ADOPTION_ROLLBACK_NOTES) {
		throw new ConvexError(
			"Mature repo adoption rollbackNotes does not match the approved workflow packet",
		);
	}
}

function normalizeWriteLeaseDurationMinutes(durationMinutes?: number) {
	const duration = durationMinutes ?? DEFAULT_WORKFLOW_WRITE_LEASE_MINUTES;
	if (!Number.isFinite(duration) || duration <= 0 || duration > 60) {
		throw new ConvexError(
			"Write lease duration must be between 1 and 60 minutes",
		);
	}

	return duration;
}

async function getActiveWorkspaceProjectByViewer(
	ctx: WorkspaceReadCtx,
	clerkUserId: string,
) {
	const projects = await ctx.db
		.query("workspaceProjects")
		.withIndex("by_clerk_user_id_and_status_and_updated_at", (query) =>
			query.eq("clerkUserId", clerkUserId).eq("status", "active"),
		)
		.order("desc")
		.take(1);

	return projects[0] ?? null;
}

async function loadViewerWorkspaceProject(
	ctx: WorkspaceReadCtx,
	clerkUserId: string,
	projectId?: WorkspaceProjectId,
) {
	if (!projectId) {
		return getActiveWorkspaceProjectByViewer(ctx, clerkUserId);
	}

	const project = await ctx.db.get(projectId);
	if (!project || project.clerkUserId !== clerkUserId) {
		throw new ConvexError("Workspace project not found");
	}

	if (project.status === "deleted") {
		throw new ConvexError("Workspace project is deleted");
	}

	return project;
}

async function requireViewerWorkspaceProject(
	ctx: WorkspaceReadCtx,
	clerkUserId: string,
	projectId: WorkspaceProjectId,
) {
	const project = await loadViewerWorkspaceProject(ctx, clerkUserId, projectId);
	if (!project) {
		throw new ConvexError("Workspace project not found");
	}

	return project;
}

async function requireRunnerBinding(
	ctx: WorkspaceReadCtx,
	projectId: WorkspaceProjectId,
	runnerId: WorkspaceRunnerBindingId,
) {
	const runnerBinding = await ctx.db.get(runnerId);
	if (!runnerBinding || runnerBinding.projectId !== projectId) {
		throw new ConvexError("Workspace runner not found");
	}

	if (runnerBinding.status === "revoked") {
		throw new ConvexError("Workspace runner is revoked");
	}

	return runnerBinding;
}

async function requireRunnerBindingByPairingToken(
	ctx: WorkspaceReadCtx,
	pairingToken: string,
) {
	const runnerBinding = await ctx.db
		.query("workspaceRunnerBindings")
		.withIndex("by_pairing_token", (query) =>
			query.eq("pairingToken", pairingToken),
		)
		.unique();

	if (!runnerBinding) {
		throw new ConvexError("Pairing token not found");
	}

	if (
		runnerBinding.status === "revoked" ||
		runnerBinding.pairingTokenCanceledAt
	) {
		throw new ConvexError("Pairing token is revoked");
	}

	if (
		runnerBinding.status !== "pairing" ||
		runnerBinding.pairingStatus !== "waiting" ||
		runnerBinding.runnerCredentialHash
	) {
		throw new ConvexError("Pairing token has already been used");
	}

	if ((runnerBinding.pairingTokenExpiresAt ?? 0) <= Date.now()) {
		throw new ConvexError("Pairing token has expired");
	}

	return runnerBinding;
}

async function requireRunnerBindingByCredentialHash(
	ctx: WorkspaceReadCtx,
	runnerCredentialHash: string,
) {
	const runnerBinding = await ctx.db
		.query("workspaceRunnerBindings")
		.withIndex("by_runner_credential_hash", (query) =>
			query.eq("runnerCredentialHash", runnerCredentialHash),
		)
		.unique();

	if (!runnerBinding) {
		throw new ConvexError("Workspace runner credential not found");
	}

	if (runnerBinding.status === "revoked") {
		throw new ConvexError("Workspace runner is revoked");
	}

	return runnerBinding;
}

async function requireRunnerProject(
	ctx: WorkspaceReadCtx,
	runnerBinding: WorkspaceRunnerBindingDoc,
) {
	const project = await ctx.db.get(runnerBinding.projectId);
	if (!project) {
		throw new ConvexError("Workspace project not found");
	}

	if (project.status === "deleted") {
		throw new ConvexError("Workspace project is deleted");
	}

	return project;
}

async function requireRunnerBindingForRevocation(
	ctx: WorkspaceReadCtx,
	projectId: WorkspaceProjectId,
	runnerId: WorkspaceRunnerBindingId,
) {
	const runnerBinding = await ctx.db.get(runnerId);
	if (!runnerBinding || runnerBinding.projectId !== projectId) {
		throw new ConvexError("Workspace runner not found");
	}

	return runnerBinding;
}

async function requireRepositoryBinding(
	ctx: WorkspaceReadCtx,
	projectId: WorkspaceProjectId,
	repositoryBindingId: WorkspaceRepositoryBindingId,
) {
	const repositoryBinding = await ctx.db.get(repositoryBindingId);
	if (!repositoryBinding || repositoryBinding.projectId !== projectId) {
		throw new ConvexError("Workspace repository binding not found");
	}

	if (repositoryBinding.status === "deleted") {
		throw new ConvexError("Workspace repository binding is deleted");
	}

	return repositoryBinding;
}

function requireManagedGithubRepositoryBinding(
	repositoryBinding: Awaited<ReturnType<typeof requireRepositoryBinding>>,
) {
	if (repositoryBinding.provider !== "github") {
		throw new ConvexError("Managed GitHub requires a GitHub repository");
	}

	if (!repositoryBinding.remoteOwner || !repositoryBinding.remoteName) {
		throw new ConvexError(
			"Managed GitHub requires a selected repository owner and name",
		);
	}

	return repositoryBinding;
}

function buildManagedGithubRepositoryLabel(repositoryBinding: {
	remoteOwner?: string;
	remoteName?: string;
	displayName: string;
}) {
	const remoteLabel = [
		repositoryBinding.remoteOwner,
		repositoryBinding.remoteName,
	]
		.filter(Boolean)
		.join("/");
	const repositoryLabel = remoteLabel || repositoryBinding.displayName;
	assertSyncSafeText(repositoryLabel, "managed GitHub repository label");
	return repositoryLabel;
}

function buildManagedGithubConsentPacket(
	repositoryBinding: Awaited<ReturnType<typeof requireRepositoryBinding>>,
) {
	const githubRepository =
		requireManagedGithubRepositoryBinding(repositoryBinding);
	const remoteOwner = githubRepository.remoteOwner;
	const remoteName = githubRepository.remoteName;
	if (!remoteOwner || !remoteName) {
		throw new ConvexError(
			"Managed GitHub requires a selected repository owner and name",
		);
	}
	assertSyncSafeText(remoteOwner, "managed GitHub remote owner");
	assertSyncSafeText(remoteName, "managed GitHub remote name");
	assertBoundedText(
		githubRepository.defaultBranch,
		"managed GitHub default branch",
	);

	return {
		consentSchemaVersion: MANAGED_GITHUB_CONSENT_SCHEMA_VERSION,
		repositoryAccess: {
			provider: "github" as const,
			remoteOwner,
			remoteName,
			defaultBranch: githubRepository.defaultBranch,
			accessMode: "selected_repository_only" as const,
		},
		installationScope: {
			repositorySelection: "selected_repository_only" as const,
			permissions: [
				"metadata:read",
				"contents:read",
				"pull_requests:write",
				"checks:read",
				"actions:read",
				"statuses:read",
			],
		},
		storagePolicy: {
			sourceCloneRetention: "ephemeral_until_delivery_or_revocation" as const,
			proofArtifactRetention: "structured_metadata_only" as const,
			secretStorage: "never_store_customer_secrets" as const,
		},
		prAuthority: {
			branchCreation: "customer_approval_required" as const,
			pullRequestCreation: "customer_approval_required" as const,
			mergeAuthority: "never" as const,
			ciRerunAuthority: "customer_approval_required" as const,
		},
		rawSourceVisibility: {
			operatorVisibility: "assigned_concierge_only_after_consent" as const,
			rawSourceSharing: "disabled_until_explicit_share" as const,
			transcriptStorage: "disabled" as const,
		},
		proofBoundary: {
			proofCommands: "customer_approved_only" as const,
			ciCommands: "customer_approved_only" as const,
			syncedArtifacts: "proof_metadata_and_pr_refs_only" as const,
		},
	};
}

async function insertManagedGithubAuditEvent(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		consentId: ManagedGithubExecutionConsentId;
		eventType: "managed_github.requested" | "managed_github.revoked";
		actorClerkUserId: string;
		repositoryLabel: string;
		summary: string;
		createdAt: number;
	},
) {
	assertSyncSafeText(args.repositoryLabel, "managed GitHub audit repository");
	assertSyncSafeText(args.summary, "managed GitHub audit summary");
	await ctx.db.insert("managedGithubAuditEvents", {
		projectId: args.projectId,
		consentId: args.consentId,
		eventType: args.eventType,
		actorClerkUserId: args.actorClerkUserId,
		repositoryLabel: args.repositoryLabel,
		summary: args.summary,
		createdAt: args.createdAt,
	});
}

async function requireDoctorPassRun(
	ctx: WorkspaceReadCtx,
	projectId: WorkspaceProjectId,
	doctorPassRunId: DoctorPassRunId,
) {
	const doctorPassRun = await ctx.db.get(doctorPassRunId);
	if (!doctorPassRun || doctorPassRun.projectId !== projectId) {
		throw new ConvexError("Doctor pass run not found");
	}

	if (doctorPassRun.status === "deleted") {
		throw new ConvexError("Doctor pass run is deleted");
	}

	return doctorPassRun;
}

async function requireWorkflowRun(
	ctx: WorkspaceReadCtx,
	projectId: WorkspaceProjectId,
	workflowRunId: WorkflowRunId,
) {
	const workflowRun = await ctx.db.get(workflowRunId);
	if (!workflowRun || workflowRun.projectId !== projectId) {
		throw new ConvexError("Workflow run not found");
	}

	if (workflowRun.status === "deleted") {
		throw new ConvexError("Workflow run is deleted");
	}

	return workflowRun;
}

function requireWorkflowRunOwnedByRunner(
	workflowRun: Awaited<ReturnType<typeof requireWorkflowRun>>,
	runnerBinding: WorkspaceRunnerBindingDoc,
) {
	if (workflowRun.runnerId !== runnerBinding._id) {
		throw new ConvexError("Workspace runner does not own this workflow run");
	}

	return workflowRun;
}

function requireWorkflowRunActiveLeaseForEvent(
	workflowRun: Awaited<ReturnType<typeof requireWorkflowRun>>,
	payload: WorkspaceRunnerEventPayload,
) {
	if (
		payload.eventType !== "workflow.proof.completed" &&
		payload.eventType !== "workflow.blocked"
	) {
		return;
	}

	if (
		!workflowRun.writeLeaseId ||
		payload.writeLeaseId !== workflowRun.writeLeaseId
	) {
		throw new ConvexError(
			"Runner event write lease does not match workflow run",
		);
	}

	if (
		typeof workflowRun.writeLeaseExpiresAt !== "number" ||
		Date.now() >= workflowRun.writeLeaseExpiresAt
	) {
		throw new ConvexError("Workflow write lease has expired");
	}
}

function requireSupportedWorkflowRun(
	workflowRun: Awaited<ReturnType<typeof requireWorkflowRun>>,
) {
	if (
		workflowRun.workflowId !== SOURCE_TRUTH_WORKFLOW_ID &&
		workflowRun.workflowId !== OBSERVABILITY_WORKFLOW_ID &&
		workflowRun.workflowId !== BROKEN_APP_TRIAGE_WORKFLOW_ID &&
		workflowRun.workflowId !== MATURE_REPO_ADOPTION_WORKFLOW_ID
	) {
		throw new ConvexError("Workflow is not supported by the local runner");
	}
	if (!workflowRun.branchName || !workflowRun.profileName) {
		throw new ConvexError("Workflow run is missing approved branch or profile");
	}
	if (
		!workflowRun.writeLeaseId ||
		workflowRun.writeLeaseExpiresAt === undefined ||
		workflowRun.writeLeaseDurationMinutes === undefined
	) {
		throw new ConvexError("Workflow run is missing approved write lease");
	}
	if (!workflowRun.dirtyStatePolicy) {
		throw new ConvexError("Workflow run is missing dirty state policy");
	}
	if (
		!workflowRun.expectedOutputs ||
		!workflowRun.allowedTouchTargets ||
		!workflowRun.disallowedTouchTargets ||
		!workflowRun.proofCommands ||
		!workflowRun.syncPolicySummary ||
		!workflowRun.stopConditions ||
		!workflowRun.rollbackNotes ||
		!workflowRun.localWorkflowPacketRef ||
		!workflowRun.localProofRef
	) {
		throw new ConvexError("Workflow run is missing approved packet metadata");
	}

	return {
		workflowRunId: workflowRun._id,
		workflowId: workflowRun.workflowId,
		workflowVersion: workflowRun.workflowVersion,
		branchName: workflowRun.branchName,
		profileName: workflowRun.profileName,
		writeLeaseId: workflowRun.writeLeaseId,
		writeLeaseExpiresAt: workflowRun.writeLeaseExpiresAt,
		writeLeaseDurationMinutes: workflowRun.writeLeaseDurationMinutes,
		dirtyStatePolicy: workflowRun.dirtyStatePolicy,
		expectedOutputs: workflowRun.expectedOutputs,
		allowedTouchTargets: workflowRun.allowedTouchTargets,
		disallowedTouchTargets: workflowRun.disallowedTouchTargets,
		proofCommands: workflowRun.proofCommands,
		syncPolicySummary: workflowRun.syncPolicySummary,
		stopConditions: workflowRun.stopConditions,
		rollbackNotes: workflowRun.rollbackNotes,
		localWorkflowPacketRef: workflowRun.localWorkflowPacketRef,
		localProofRef: workflowRun.localProofRef,
	};
}

function isTerminalWorkflowRunStatus(status: string) {
	return (
		status === "proof_completed" ||
		status === "blocked" ||
		status === "canceled" ||
		status === "deleted"
	);
}

function isClaimableWorkflowRunStatus(status: string) {
	return status === "approved";
}

function isDirectlyRunnableWorkflowRunStatus(status: string) {
	return status === "approved" || status === "running";
}

async function getLatestRunnerBindings(
	ctx: WorkspaceReadCtx,
	projectId: WorkspaceProjectId,
) {
	return await ctx.db
		.query("workspaceRunnerBindings")
		.withIndex("by_project_id_and_updated_at", (query) =>
			query.eq("projectId", projectId),
		)
		.order("desc")
		.take(10);
}

function getActiveRunnerBinding(
	runnerBindings: WorkspaceRunnerBindingDoc[],
	now: number,
) {
	return (
		runnerBindings.find((runnerBinding) => runnerBinding.status === "paired") ??
		runnerBindings.find(
			(runnerBinding) =>
				runnerBinding.status === "pairing" &&
				runnerBinding.pairingToken &&
				!runnerBinding.pairingTokenCanceledAt &&
				(runnerBinding.pairingTokenExpiresAt ?? 0) > now,
		) ??
		null
	);
}

function redactRunnerCredentialHash(runnerBinding: WorkspaceRunnerBindingDoc) {
	const {
		runnerCredentialHash: _runnerCredentialHash,
		...redactedRunnerBinding
	} = runnerBinding;
	return redactedRunnerBinding;
}

function redactRunnerCredentialHashes(
	runnerBindings: WorkspaceRunnerBindingDoc[],
) {
	return runnerBindings.map(redactRunnerCredentialHash);
}

function buildPairingCommand(
	runnerBinding: WorkspaceRunnerBindingDoc | null,
	now: number,
) {
	const tokenExpiresAt = runnerBinding?.pairingTokenExpiresAt;
	if (
		!runnerBinding?.pairingToken ||
		!tokenExpiresAt ||
		runnerBinding.pairingTokenCanceledAt ||
		tokenExpiresAt <= now
	) {
		return null;
	}

	return {
		runnerId: runnerBinding._id,
		token: runnerBinding.pairingToken,
		tokenExpiresAt,
		primaryCommand: `bunx ship-by-sunday setup pair ${runnerBinding.pairingToken}`,
		fallbackCommand: `npx ship-by-sunday setup pair ${runnerBinding.pairingToken}`,
	};
}

async function getLatestSetupEvents(
	ctx: WorkspaceReadCtx,
	projectId: WorkspaceProjectId,
) {
	const startedEvents = await ctx.db
		.query("workspaceRunnerEvents")
		.withIndex("by_project_id_and_event_type_and_created_at", (query) =>
			query.eq("projectId", projectId).eq("eventType", "setup.check.started"),
		)
		.order("desc")
		.take(SETUP_EVENT_READ_LIMIT);
	const completedEvents = await ctx.db
		.query("workspaceRunnerEvents")
		.withIndex("by_project_id_and_event_type_and_created_at", (query) =>
			query.eq("projectId", projectId).eq("eventType", "setup.check.completed"),
		)
		.order("desc")
		.take(SETUP_EVENT_READ_LIMIT);

	return [...startedEvents, ...completedEvents]
		.sort((left, right) => right.createdAt - left.createdAt)
		.slice(0, SETUP_EVENT_READ_LIMIT);
}

async function getLatestRepositoryBinding(
	ctx: WorkspaceReadCtx,
	projectId: WorkspaceProjectId,
) {
	const repositoryBindings = await ctx.db
		.query("workspaceRepositoryBindings")
		.withIndex("by_project_id_and_status_and_updated_at", (query) =>
			query.eq("projectId", projectId).eq("status", "active"),
		)
		.order("desc")
		.take(1);

	return repositoryBindings[0] ?? null;
}

async function upsertRepositoryBindingFromRunnerPairing(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		runnerId: WorkspaceRunnerBindingId;
		repositoryDisplayName?: string;
		now: number;
	},
) {
	const displayName = args.repositoryDisplayName?.trim();
	if (!displayName) {
		return;
	}

	assertBoundedText(displayName, "repository displayName");

	const existingRepositoryBinding = await getLatestRepositoryBinding(
		ctx,
		args.projectId,
	);
	const repositoryBindingPatch = {
		runnerId: args.runnerId,
		displayName,
		updatedAt: args.now,
	};

	if (existingRepositoryBinding) {
		await ctx.db.patch(existingRepositoryBinding._id, repositoryBindingPatch);
		return;
	}

	await ctx.db.insert("workspaceRepositoryBindings", {
		projectId: args.projectId,
		status: "active" as const,
		provider: "unknown" as const,
		...repositoryBindingPatch,
		createdAt: args.now,
	});
}

async function getLatestDoctorPassRun(
	ctx: WorkspaceReadCtx,
	projectId: WorkspaceProjectId,
) {
	const doctorPassRuns = await ctx.db
		.query("doctorPassRuns")
		.withIndex("by_project_id_and_started_at", (query) =>
			query.eq("projectId", projectId),
		)
		.order("desc")
		.take(1);

	return doctorPassRuns[0] ?? null;
}

async function getLatestWorkflowRun(
	ctx: WorkspaceReadCtx,
	projectId: WorkspaceProjectId,
) {
	const workflowRuns = await ctx.db
		.query("workflowRuns")
		.withIndex("by_project_id_and_created_at", (query) =>
			query.eq("projectId", projectId),
		)
		.order("desc")
		.take(1);

	return workflowRuns[0] ?? null;
}

async function buildWorkspaceProjectState(
	ctx: WorkspaceReadCtx,
	project: WorkspaceProjectDoc | null,
) {
	if (!project) {
		return {
			project: null,
			runnerBindings: [],
			repositoryBinding: null,
			latestDoctorPassRun: null,
			latestWorkflowRun: null,
		};
	}

	const [
		runnerBindings,
		repositoryBinding,
		latestDoctorPassRun,
		latestWorkflowRun,
	] = await Promise.all([
		getLatestRunnerBindings(ctx, project._id),
		getLatestRepositoryBinding(ctx, project._id),
		getLatestDoctorPassRun(ctx, project._id),
		getLatestWorkflowRun(ctx, project._id),
	]);

	return {
		project,
		runnerBindings: redactRunnerCredentialHashes(runnerBindings),
		repositoryBinding,
		latestDoctorPassRun,
		latestWorkflowRun,
	};
}

async function buildWorkspaceSetupState(
	ctx: WorkspaceReadCtx,
	project: WorkspaceProjectDoc | null,
) {
	if (!project) {
		return {
			project: null,
			runnerBindings: [],
			activeRunner: null,
			repositoryBinding: null,
			latestDoctorPassRun: null,
			setupEvents: [],
			pairingCommand: null,
		};
	}

	const [runnerBindings, repositoryBinding, latestDoctorPassRun, setupEvents] =
		await Promise.all([
			getLatestRunnerBindings(ctx, project._id),
			getLatestRepositoryBinding(ctx, project._id),
			getLatestDoctorPassRun(ctx, project._id),
			getLatestSetupEvents(ctx, project._id),
		]);
	const now = Date.now();
	const activeRunner = getActiveRunnerBinding(runnerBindings, now);
	const pairingRunner =
		runnerBindings.find(
			(runnerBinding) => runnerBinding.status === "pairing",
		) ?? activeRunner;

	return {
		project,
		runnerBindings: redactRunnerCredentialHashes(runnerBindings),
		activeRunner: activeRunner
			? redactRunnerCredentialHash(activeRunner)
			: null,
		repositoryBinding,
		latestDoctorPassRun,
		setupEvents,
		pairingCommand: buildPairingCommand(pairingRunner, now),
	};
}

export async function getWorkspaceProjectStateHandler(
	ctx: WorkspaceQueryCtx,
	args: { projectId?: WorkspaceProjectId },
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	const project = await loadViewerWorkspaceProject(
		ctx,
		clerkUserId,
		args.projectId,
	);

	return buildWorkspaceProjectState(ctx, project);
}

export async function getWorkspaceSetupStateHandler(
	ctx: WorkspaceQueryCtx,
	args: { projectId?: WorkspaceProjectId },
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	const project = await loadViewerWorkspaceProject(
		ctx,
		clerkUserId,
		args.projectId,
	);

	return buildWorkspaceSetupState(ctx, project);
}

export async function createOrLoadWorkspaceProjectHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		displayName?: string;
		defaultOpenDestination?: "cursor" | "vscode" | "terminal" | "none";
	},
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	const existingProject = await getActiveWorkspaceProjectByViewer(
		ctx,
		clerkUserId,
	);
	const now = Date.now();
	const displayName = normalizeProjectName(args.displayName);

	if (existingProject) {
		const patch: Partial<WorkspaceProjectDoc> = {
			updatedAt: now,
		};

		if (args.displayName !== undefined) {
			patch.displayName = displayName;
		}

		if (args.defaultOpenDestination !== undefined) {
			patch.defaultOpenDestination = args.defaultOpenDestination;
		}

		await ctx.db.patch(existingProject._id, patch);
		return {
			project: {
				...existingProject,
				...patch,
			},
			created: false,
		};
	}

	const project = {
		clerkUserId,
		displayName,
		fulfillmentTrack: "existing_codebase_doctor" as const,
		status: "active" as const,
		defaultOpenDestination: args.defaultOpenDestination ?? ("cursor" as const),
		syncPolicy: {
			rawSource: "disabled" as const,
			rawTerminalLogs: "disabled" as const,
			codexTranscripts: "disabled" as const,
			screenshots: "disabled" as const,
			structuredFindings: "approval_required" as const,
		},
		machineSetupStatus: "unknown" as const,
		projectSetupStatus: "unknown" as const,
		createdAt: now,
		updatedAt: now,
	};
	const projectId = await ctx.db.insert("workspaceProjects", project);

	return {
		project: {
			_id: projectId,
			_creationTime: now,
			...project,
		},
		created: true,
	};
}

function createPairingToken() {
	const entropy = crypto.randomUUID().replaceAll("-", "");
	return `sbs_pair_${entropy.slice(0, 12)}_${entropy.slice(12, 28)}`;
}

async function createWorkspaceProject(
	ctx: WorkspaceMutationCtx,
	clerkUserId: string,
) {
	const now = Date.now();
	const project = {
		clerkUserId,
		displayName: DEFAULT_WORKSPACE_PROJECT_NAME,
		fulfillmentTrack: "existing_codebase_doctor" as const,
		status: "active" as const,
		defaultOpenDestination: "cursor" as const,
		syncPolicy: {
			rawSource: "disabled" as const,
			rawTerminalLogs: "disabled" as const,
			codexTranscripts: "disabled" as const,
			screenshots: "disabled" as const,
			structuredFindings: "approval_required" as const,
		},
		machineSetupStatus: "unknown" as const,
		projectSetupStatus: "unknown" as const,
		createdAt: now,
		updatedAt: now,
	};
	const projectId = await ctx.db.insert("workspaceProjects", project);

	return {
		_id: projectId,
		_creationTime: now,
		...project,
	};
}

async function getOrCreateWorkspaceProjectForSetup(
	ctx: WorkspaceMutationCtx,
	clerkUserId: string,
	projectId?: WorkspaceProjectId,
) {
	if (projectId) {
		return requireViewerWorkspaceProject(ctx, clerkUserId, projectId);
	}

	const existingProject = await getActiveWorkspaceProjectByViewer(
		ctx,
		clerkUserId,
	);
	if (existingProject) {
		return existingProject;
	}

	return createWorkspaceProject(ctx, clerkUserId);
}

async function cancelActivePairingRunners(
	ctx: WorkspaceMutationCtx,
	projectId: WorkspaceProjectId,
	now: number,
) {
	const runnerBindings = await getLatestRunnerBindings(ctx, projectId);
	for (const runnerBinding of runnerBindings) {
		if (runnerBinding.status !== "pairing") {
			continue;
		}

		await ctx.db.patch(runnerBinding._id, {
			status: "revoked" as const,
			pairingStatus: "revoked" as const,
			pairingTokenCanceledAt: now,
			revokedAt: now,
			updatedAt: now,
		});
	}
}

export async function prepareWorkspaceSetupPairingHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId?: WorkspaceProjectId;
		runnerMode: "daemon" | "one_shot";
		regenerate?: boolean;
	},
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	const project = await getOrCreateWorkspaceProjectForSetup(
		ctx,
		clerkUserId,
		args.projectId,
	);
	const now = Date.now();
	const runnerBindings = await getLatestRunnerBindings(ctx, project._id);
	const reusablePairingRunner = runnerBindings.find(
		(runnerBinding) =>
			runnerBinding.status === "pairing" &&
			runnerBinding.runnerMode === args.runnerMode &&
			runnerBinding.pairingToken &&
			!runnerBinding.pairingTokenCanceledAt &&
			(runnerBinding.pairingTokenExpiresAt ?? 0) > now,
	);

	if (reusablePairingRunner && !args.regenerate) {
		return buildWorkspaceSetupState(ctx, project);
	}

	if (args.regenerate) {
		await cancelActivePairingRunners(ctx, project._id, now);
	}

	const pairingToken = createPairingToken();
	const runnerBinding = {
		projectId: project._id,
		status: "pairing" as const,
		pairingStatus: "waiting" as const,
		runnerMode: args.runnerMode,
		runnerLabel:
			args.runnerMode === "one_shot" ? "One-shot runner" : "Local daemon",
		pairingToken,
		pairingTokenIssuedAt: now,
		pairingTokenExpiresAt: now + PAIRING_TOKEN_TTL_MS,
		machineHealthStatus: "unknown" as const,
		projectHealthStatus: "unknown" as const,
		createdAt: now,
		updatedAt: now,
	};
	await ctx.db.insert("workspaceRunnerBindings", runnerBinding);
	await ctx.db.patch(project._id, { updatedAt: now });

	return buildWorkspaceSetupState(ctx, {
		...project,
		updatedAt: now,
	});
}

export async function cancelWorkspaceSetupPairingHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		runnerId: WorkspaceRunnerBindingId;
	},
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	const project = await requireViewerWorkspaceProject(
		ctx,
		clerkUserId,
		args.projectId,
	);
	const runnerBinding = await requireRunnerBindingForRevocation(
		ctx,
		project._id,
		args.runnerId,
	);
	const now = Date.now();

	await ctx.db.patch(runnerBinding._id, {
		status: "revoked" as const,
		pairingStatus: "revoked" as const,
		pairingTokenCanceledAt: now,
		revokedAt: now,
		updatedAt: now,
	});

	return buildWorkspaceSetupState(ctx, project);
}

export async function bindWorkspaceRunnerHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		runnerMode: "daemon" | "one_shot";
		runnerLabel?: string;
		machineDisplayName?: string;
		runnerVersion?: string;
	},
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	await requireViewerWorkspaceProject(ctx, clerkUserId, args.projectId);
	const now = Date.now();
	const runnerLabel = args.runnerLabel?.trim() || "Local runner";
	assertSyncSafeText(runnerLabel, "runnerLabel");
	assertBoundedText(args.machineDisplayName, "machineDisplayName");
	assertBoundedText(args.runnerVersion, "runnerVersion");

	const runnerBinding = {
		projectId: args.projectId,
		status: "paired" as const,
		pairingStatus: "paired" as const,
		runnerMode: args.runnerMode,
		runnerLabel,
		machineDisplayName: args.machineDisplayName,
		runnerVersion: args.runnerVersion,
		machineHealthStatus: "unknown" as const,
		projectHealthStatus: "unknown" as const,
		pairedAt: now,
		lastEventAt: now,
		createdAt: now,
		updatedAt: now,
	};
	const runnerId = await ctx.db.insert(
		"workspaceRunnerBindings",
		runnerBinding,
	);

	return {
		_id: runnerId,
		_creationTime: now,
		...runnerBinding,
	};
}

export async function bindWorkspaceRunnerByPairingTokenHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		pairingToken: string;
		runnerCredentialHash: string;
		runnerMode: "daemon" | "one_shot";
		runnerLabel?: string;
		machineDisplayName?: string;
		runnerVersion?: string;
	},
) {
	assertSyncSafeText(args.pairingToken, "pairingToken");
	assertSyncSafeText(args.runnerCredentialHash, "runnerCredentialHash");
	const runnerLabel = args.runnerLabel?.trim() || "Local runner";
	assertSyncSafeText(runnerLabel, "runnerLabel");
	assertBoundedText(args.machineDisplayName, "machineDisplayName");
	assertBoundedText(args.runnerVersion, "runnerVersion");

	const runnerBinding = await requireRunnerBindingByPairingToken(
		ctx,
		args.pairingToken,
	);
	if (runnerBinding.runnerMode !== args.runnerMode) {
		throw new ConvexError("Pairing token runner mode does not match");
	}
	await requireRunnerProject(ctx, runnerBinding);
	const now = Date.now();

	await ctx.db.patch(runnerBinding._id, {
		status: "paired" as const,
		pairingStatus: "paired" as const,
		runnerMode: args.runnerMode,
		runnerLabel,
		pairingToken: undefined,
		pairingTokenCanceledAt: now,
		runnerCredentialHash: args.runnerCredentialHash,
		machineDisplayName: args.machineDisplayName,
		runnerVersion: args.runnerVersion,
		pairedAt: runnerBinding.pairedAt ?? now,
		lastEventAt: now,
		updatedAt: now,
	});

	return {
		projectId: runnerBinding.projectId,
		runnerId: runnerBinding._id,
		runnerMode: args.runnerMode,
		pairingStatus: "paired" as const,
	};
}

export async function bindWorkspaceRepositoryHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		runnerId?: WorkspaceRunnerBindingId;
		displayName: string;
		provider: "github" | "gitlab" | "bitbucket" | "other" | "unknown";
		remoteHost?: string;
		remoteOwner?: string;
		remoteName?: string;
		defaultBranch?: string;
		packageManager?: "bun" | "npm" | "pnpm" | "yarn" | "unknown";
	},
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	await requireViewerWorkspaceProject(ctx, clerkUserId, args.projectId);
	if (args.runnerId) {
		await requireRunnerBinding(ctx, args.projectId, args.runnerId);
	}

	const safeTextFields = [
		["repository displayName", args.displayName],
		["repository remoteHost", args.remoteHost],
		["repository remoteOwner", args.remoteOwner],
		["repository remoteName", args.remoteName],
		["repository defaultBranch", args.defaultBranch],
	] as const;
	for (const [context, value] of safeTextFields) {
		assertBoundedText(value, context);
	}

	const now = Date.now();
	const existingRepositoryBinding = await getLatestRepositoryBinding(
		ctx,
		args.projectId,
	);
	const repositoryBindingPatch = {
		runnerId: args.runnerId,
		displayName: args.displayName.trim(),
		provider: args.provider,
		remoteHost: args.remoteHost,
		remoteOwner: args.remoteOwner,
		remoteName: args.remoteName,
		defaultBranch: args.defaultBranch,
		packageManager: args.packageManager,
		updatedAt: now,
	};

	if (existingRepositoryBinding) {
		await ctx.db.patch(existingRepositoryBinding._id, repositoryBindingPatch);
		return {
			...existingRepositoryBinding,
			...repositoryBindingPatch,
		};
	}

	const repositoryBinding = {
		projectId: args.projectId,
		status: "active" as const,
		...repositoryBindingPatch,
		createdAt: now,
	};
	const repositoryBindingId = await ctx.db.insert(
		"workspaceRepositoryBindings",
		repositoryBinding,
	);

	return {
		_id: repositoryBindingId,
		_creationTime: now,
		...repositoryBinding,
	};
}

export async function startWorkspaceDoctorPassRunHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		runnerId?: WorkspaceRunnerBindingId;
		repositoryBindingId?: WorkspaceRepositoryBindingId;
		localRunId?: string;
		runnerMode: "daemon" | "one_shot";
	},
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	await requireViewerWorkspaceProject(ctx, clerkUserId, args.projectId);
	if (args.runnerId) {
		await requireRunnerBinding(ctx, args.projectId, args.runnerId);
	}
	if (args.repositoryBindingId) {
		await requireRepositoryBinding(
			ctx,
			args.projectId,
			args.repositoryBindingId,
		);
	}
	if (args.localRunId) {
		assertSyncSafeText(args.localRunId, "localRunId");
	}

	return await createDoctorPassRun(ctx, {
		projectId: args.projectId,
		runnerId: args.runnerId,
		repositoryBindingId: args.repositoryBindingId,
		localRunId: args.localRunId,
		runnerMode: args.runnerMode,
	});
}

export async function startWorkspaceDoctorPassRunByCredentialHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		runnerCredentialHash: string;
		projectId: WorkspaceProjectId;
		runnerId: WorkspaceRunnerBindingId;
		localRunId: string;
		runnerMode: "daemon" | "one_shot";
	},
) {
	assertSyncSafeText(args.runnerCredentialHash, "runnerCredentialHash");
	assertSyncSafeText(args.localRunId, "localRunId");
	const runnerBinding = await requireRunnerBindingByCredentialHash(
		ctx,
		args.runnerCredentialHash,
	);
	if (
		runnerBinding._id !== args.runnerId ||
		runnerBinding.projectId !== args.projectId
	) {
		throw new ConvexError("Workspace runner credential does not match run");
	}
	if (runnerBinding.runnerMode !== args.runnerMode) {
		throw new ConvexError("Workspace runner mode does not match run");
	}
	await requireRunnerProject(ctx, runnerBinding);

	const existingRun = await findDoctorPassRunByRunnerLocalRunId(ctx, {
		runnerId: args.runnerId,
		localRunId: args.localRunId,
	});
	if (existingRun) {
		if (
			existingRun.projectId !== args.projectId ||
			existingRun.runnerMode !== args.runnerMode
		) {
			throw new ConvexError("Local doctor pass run id belongs elsewhere");
		}
		return {
			doctorPassRunId: existingRun._id,
			startedAt: existingRun.startedAt,
		};
	}

	const doctorPassRun = await createDoctorPassRun(ctx, {
		projectId: args.projectId,
		runnerId: args.runnerId,
		localRunId: args.localRunId,
		runnerMode: args.runnerMode,
	});
	return {
		doctorPassRunId: doctorPassRun._id,
		startedAt: doctorPassRun.startedAt,
	};
}

async function createDoctorPassRun(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		runnerId?: WorkspaceRunnerBindingId;
		repositoryBindingId?: WorkspaceRepositoryBindingId;
		localRunId?: string;
		runnerMode: "daemon" | "one_shot";
	},
) {
	const now = Date.now();
	const doctorPassRun = {
		projectId: args.projectId,
		runnerId: args.runnerId,
		repositoryBindingId: args.repositoryBindingId,
		localRunId: args.localRunId,
		status: "running" as const,
		runnerMode: args.runnerMode,
		syncPreviewStatus: "not_ready" as const,
		startedAt: now,
		createdAt: now,
		updatedAt: now,
	};
	const doctorPassRunId = await ctx.db.insert("doctorPassRuns", doctorPassRun);

	return {
		_id: doctorPassRunId,
		_creationTime: now,
		...doctorPassRun,
	};
}

async function findDoctorPassRunByRunnerLocalRunId(
	ctx: WorkspaceReadCtx,
	args: {
		runnerId: WorkspaceRunnerBindingId;
		localRunId: string;
	},
) {
	const runs = await ctx.db
		.query("doctorPassRuns")
		.withIndex("by_runner_id_and_local_run_id", (query) =>
			query.eq("runnerId", args.runnerId).eq("localRunId", args.localRunId),
		)
		.take(1);

	return runs[0] ?? null;
}

async function findActiveWorkflowRunByFinding(
	ctx: WorkspaceReadCtx,
	args: {
		projectId: WorkspaceProjectId;
		findingDocumentId: CodebaseFindingId;
		workflowId: string;
	},
) {
	const activeStatuses = [
		"approval_requested",
		"approved",
		"paused",
		"running",
	] as const;
	for (const status of activeStatuses) {
		const workflowRun = await ctx.db
			.query("workflowRuns")
			.withIndex("by_project_finding_workflow_status_created_at", (query) =>
				query
					.eq("projectId", args.projectId)
					.eq("findingDocumentId", args.findingDocumentId)
					.eq("workflowId", args.workflowId)
					.eq("status", status),
			)
			.order("desc")
			.take(1);
		if (workflowRun[0]) {
			return workflowRun[0];
		}
	}

	return null;
}

export async function requestWorkspaceWorkflowRunHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		findingDocumentId: CodebaseFindingId;
		runnerId: WorkspaceRunnerBindingId;
		workflowId: string;
		workflowVersion?: string;
		branchName: string;
		profileName: string;
		writeLeaseDurationMinutes?: number;
		dirtyStatePolicy?: "require_clean_worktree" | "checkpoint_required";
		expectedOutputs: string[];
		allowedTouchTargets: string[];
		disallowedTouchTargets: string[];
		proofCommands: string[];
		syncPolicySummary: string;
		stopConditions: string[];
		rollbackNotes: string;
	},
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	await requireViewerWorkspaceProject(ctx, clerkUserId, args.projectId);
	const runnerBinding = await requireRunnerBinding(
		ctx,
		args.projectId,
		args.runnerId,
	);
	if (
		runnerBinding.status !== "paired" ||
		runnerBinding.pairingStatus !== "paired"
	) {
		throw new ConvexError("A paired workspace runner is required");
	}

	const finding = await ctx.db.get(args.findingDocumentId);
	if (!finding || finding.projectId !== args.projectId) {
		throw new ConvexError("Finding not found");
	}
	if (finding.status === "deleted") {
		throw new ConvexError("Finding is deleted");
	}
	if (finding.status === "blocked") {
		throw new ConvexError("Blocked findings cannot start workflows");
	}
	if (
		args.workflowId !== SOURCE_TRUTH_WORKFLOW_ID &&
		args.workflowId !== OBSERVABILITY_WORKFLOW_ID &&
		args.workflowId !== BROKEN_APP_TRIAGE_WORKFLOW_ID &&
		args.workflowId !== MATURE_REPO_ADOPTION_WORKFLOW_ID
	) {
		throw new ConvexError("Workflow is not supported by the local runner");
	}
	if (finding.recommendedWorkflowId !== args.workflowId) {
		throw new ConvexError("Workflow must match the selected finding");
	}

	assertSyncSafeText(args.workflowId, "workflowId");
	assertBoundedText(args.workflowVersion, "workflowVersion");
	assertSyncSafeText(args.branchName, "branchName");
	assertSyncSafeText(args.profileName, "profileName");
	assertSyncSafeText(args.syncPolicySummary, "syncPolicySummary");
	assertSyncSafeText(args.rollbackNotes, "rollbackNotes");
	assertBoundedTextList(args.expectedOutputs, "expectedOutputs");
	assertBoundedTextList(args.allowedTouchTargets, "allowedTouchTargets");
	assertBoundedTextList(args.disallowedTouchTargets, "disallowedTouchTargets");
	assertBoundedTextList(args.proofCommands, "proofCommands");
	assertBoundedTextList(args.stopConditions, "stopConditions");
	if (
		args.workflowId === BROKEN_APP_TRIAGE_WORKFLOW_ID &&
		args.proofCommands.some(
			(command) =>
				command !== "git status --short" && command !== "git diff --name-only",
		)
	) {
		throw new ConvexError(
			"Broken-app triage only supports read-only Git diagnostics",
		);
	}
	if (
		args.workflowId === OBSERVABILITY_WORKFLOW_ID &&
		args.proofCommands.some(
			(command) =>
				command !== "git status --short" &&
				command !== "git diff --name-only" &&
				command !== "git diff --check",
		)
	) {
		throw new ConvexError(
			"Observability debuggability only supports local Git proof commands",
		);
	}
	if (
		args.workflowId === OBSERVABILITY_WORKFLOW_ID &&
		!/^sbs\/observability-debuggability-\d{8}-\d{4}$/.test(args.branchName)
	) {
		throw new ConvexError("Observability branch name is not approved");
	}
	if (args.workflowId === OBSERVABILITY_WORKFLOW_ID) {
		assertObservabilityWorkflowApprovalPacket(args);
	}
	if (
		args.workflowId === MATURE_REPO_ADOPTION_WORKFLOW_ID &&
		!/^sbs\/mature-repo-adoption-\d{8}-\d{4}$/.test(args.branchName)
	) {
		throw new ConvexError("Mature repo adoption branch name is not approved");
	}
	if (args.workflowId === MATURE_REPO_ADOPTION_WORKFLOW_ID) {
		assertMatureRepoAdoptionWorkflowApprovalPacket(args);
	}

	const existingWorkflowRun = await findActiveWorkflowRunByFinding(ctx, {
		projectId: args.projectId,
		findingDocumentId: args.findingDocumentId,
		workflowId: args.workflowId,
	});
	if (existingWorkflowRun) {
		return existingWorkflowRun;
	}

	const now = Date.now();
	const writeLeaseDurationMinutes = normalizeWriteLeaseDurationMinutes(
		args.writeLeaseDurationMinutes,
	);
	const workflowRun = {
		projectId: args.projectId,
		findingDocumentId: args.findingDocumentId,
		runnerId: args.runnerId,
		workflowId: args.workflowId,
		workflowVersion: args.workflowVersion ?? DEFAULT_WORKFLOW_VERSION,
		status: "approved" as const,
		proofStatus: "not_started" as const,
		deliveryStatus: "not_started" as const,
		branchName: args.branchName,
		targetBranch: args.branchName,
		profileName: args.profileName,
		approvalSchemaVersion: WORKFLOW_APPROVAL_SCHEMA_VERSION,
		approvedAt: now,
		approvedByClerkUserId: clerkUserId,
		approvalSource: "finding_detail" as const,
		writeLeaseExpiresAt: now + writeLeaseDurationMinutes * 60 * 1000,
		writeLeaseDurationMinutes,
		writeLeaseRenewalCount: 0,
		dirtyStatePolicy: args.dirtyStatePolicy ?? "require_clean_worktree",
		expectedOutputs: args.expectedOutputs,
		allowedTouchTargets: args.allowedTouchTargets,
		disallowedTouchTargets: args.disallowedTouchTargets,
		proofCommands: args.proofCommands,
		syncPolicySummary: args.syncPolicySummary,
		stopConditions: args.stopConditions,
		rollbackNotes: args.rollbackNotes,
		createdAt: now,
		updatedAt: now,
	};
	const workflowRunId = await ctx.db.insert("workflowRuns", workflowRun);
	const localWorkflowPacketRef = `.sbs/runs/${workflowRunId}/workflow-packet.json`;
	const localProofRef = `.sbs/runs/${workflowRunId}/proof.json`;
	const writeLeaseId = `lease_${workflowRunId}`;
	await ctx.db.patch(workflowRunId, {
		writeLeaseId,
		localWorkflowPacketRef,
		localProofRef,
	});

	return {
		_id: workflowRunId,
		_creationTime: now,
		...workflowRun,
		writeLeaseId,
		localWorkflowPacketRef,
		localProofRef,
	};
}

export async function getWorkspaceWorkflowRunByCredentialHandler(
	ctx: WorkspaceQueryCtx,
	args: {
		runnerCredentialHash: string;
		projectId: WorkspaceProjectId;
		runnerId: WorkspaceRunnerBindingId;
		workflowRunId: WorkflowRunId;
	},
) {
	assertSyncSafeText(args.runnerCredentialHash, "runnerCredentialHash");
	const runnerBinding = await requireRunnerBindingByCredentialHash(
		ctx,
		args.runnerCredentialHash,
	);
	if (
		runnerBinding._id !== args.runnerId ||
		runnerBinding.projectId !== args.projectId
	) {
		throw new ConvexError(
			"Workspace runner credential does not match workflow",
		);
	}
	await requireRunnerProject(ctx, runnerBinding);
	const workflowRun = await requireWorkflowRun(
		ctx,
		args.projectId,
		args.workflowRunId,
	);
	requireWorkflowRunOwnedByRunner(workflowRun, runnerBinding);
	if (!isDirectlyRunnableWorkflowRunStatus(workflowRun.status)) {
		throw new ConvexError("Workflow run is not runnable");
	}
	return requireSupportedWorkflowRun(workflowRun);
}

async function findRunningWorkflowRunForProject(
	ctx: WorkspaceReadCtx,
	projectId: WorkspaceProjectId,
) {
	const runningWorkflowRuns = await ctx.db
		.query("workflowRuns")
		.withIndex("by_project_id_and_status_and_created_at", (query) =>
			query.eq("projectId", projectId).eq("status", "running"),
		)
		.order("asc")
		.take(1);

	return runningWorkflowRuns[0] ?? null;
}

async function findOldestClaimableWorkflowRunForRunner(
	ctx: WorkspaceReadCtx,
	args: {
		projectId: WorkspaceProjectId;
		runnerId: WorkspaceRunnerBindingId;
	},
) {
	const approvedWorkflowRuns = await ctx.db
		.query("workflowRuns")
		.withIndex("by_runner_id_and_status_and_created_at", (query) =>
			query.eq("runnerId", args.runnerId).eq("status", "approved"),
		)
		.order("asc")
		.take(1);

	return (
		approvedWorkflowRuns.find(
			(workflowRun) =>
				workflowRun.projectId === args.projectId &&
				workflowRun.runnerId === args.runnerId &&
				isClaimableWorkflowRunStatus(workflowRun.status),
		) ?? null
	);
}

export async function claimWorkspaceWorkflowRunByCredentialHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		runnerCredentialHash: string;
		projectId: WorkspaceProjectId;
		runnerId: WorkspaceRunnerBindingId;
	},
) {
	assertSyncSafeText(args.runnerCredentialHash, "runnerCredentialHash");
	const runnerBinding = await requireRunnerBindingByCredentialHash(
		ctx,
		args.runnerCredentialHash,
	);
	if (
		runnerBinding._id !== args.runnerId ||
		runnerBinding.projectId !== args.projectId
	) {
		throw new ConvexError("Workspace runner credential does not match queue");
	}
	if (runnerBinding.runnerMode !== "daemon") {
		throw new ConvexError("Only daemon runners can claim workflow queue jobs");
	}
	await requireRunnerProject(ctx, runnerBinding);

	const runningWorkflowRun = await findRunningWorkflowRunForProject(
		ctx,
		args.projectId,
	);
	if (runningWorkflowRun) {
		return null;
	}

	const workflowRun = await findOldestClaimableWorkflowRunForRunner(ctx, args);
	if (!workflowRun) {
		return null;
	}
	const approvedWorkflowRun = requireSupportedWorkflowRun(workflowRun);
	const now = Date.now();
	const writeLeaseDurationMinutes =
		workflowRun.writeLeaseDurationMinutes ??
		DEFAULT_WORKFLOW_WRITE_LEASE_MINUTES;
	const writeLeaseExpiresAt = now + writeLeaseDurationMinutes * 60 * 1000;

	await ctx.db.patch(workflowRun._id, {
		status: "running" as const,
		startedAt: workflowRun.startedAt ?? now,
		writeLeaseExpiresAt,
		updatedAt: now,
	});

	const eventDocument = {
		eventId: `workflow-claimed:${workflowRun._id}:${now}`,
		projectId: args.projectId,
		runnerId: runnerBinding._id,
		workflowRunId: workflowRun._id,
		eventType: "workflow.claimed" as const,
		schemaVersion: getWorkspaceRunnerEventSchemaVersion(),
		createdAt: now,
		receivedAt: now,
		payload: {
			eventType: "workflow.claimed" as const,
			workflowId: workflowRun.workflowId,
			writeLeaseId: approvedWorkflowRun.writeLeaseId,
			writeLeaseExpiresAt,
		},
	};
	await ctx.db.insert("workspaceRunnerEvents", eventDocument);

	return {
		...approvedWorkflowRun,
		writeLeaseExpiresAt,
		writeLeaseDurationMinutes,
	};
}

export async function getWorkspaceWorkerQueueStateHandler(
	ctx: WorkspaceQueryCtx,
	args: { projectId?: WorkspaceProjectId },
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	const project = await loadViewerWorkspaceProject(
		ctx,
		clerkUserId,
		args.projectId,
	);
	if (!project) {
		return {
			project: null,
			activeRunner: null,
			workflowRuns: [],
		};
	}

	const [runnerBindings, workflowRuns] = await Promise.all([
		getLatestRunnerBindings(ctx, project._id),
		ctx.db
			.query("workflowRuns")
			.withIndex("by_project_id_and_created_at", (query) =>
				query.eq("projectId", project._id),
			)
			.order("desc")
			.take(50),
	]);
	const activeRunner = getActiveRunnerBinding(runnerBindings, Date.now());

	return {
		project,
		activeRunner: activeRunner
			? redactRunnerCredentialHash(activeRunner)
			: null,
		workflowRuns: workflowRuns.filter(
			(workflowRun) => workflowRun.status !== "deleted",
		),
	};
}

export async function pauseWorkspaceWorkflowRunHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		workflowRunId: WorkflowRunId;
		reason?: string;
	},
) {
	assertBoundedText(args.reason, "pause reason");
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	await requireViewerWorkspaceProject(ctx, clerkUserId, args.projectId);
	const workflowRun = await requireWorkflowRun(
		ctx,
		args.projectId,
		args.workflowRunId,
	);
	if (isTerminalWorkflowRunStatus(workflowRun.status)) {
		throw new ConvexError("Terminal workflow runs cannot be paused");
	}
	if (workflowRun.status === "paused") {
		return workflowRun;
	}

	const now = Date.now();
	await ctx.db.patch(workflowRun._id, {
		status: "paused" as const,
		blockedReason: args.reason,
		updatedAt: now,
	});

	return {
		...workflowRun,
		status: "paused" as const,
		blockedReason: args.reason,
		updatedAt: now,
	};
}

export async function resumeWorkspaceWorkflowRunHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		workflowRunId: WorkflowRunId;
	},
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	await requireViewerWorkspaceProject(ctx, clerkUserId, args.projectId);
	const workflowRun = await requireWorkflowRun(
		ctx,
		args.projectId,
		args.workflowRunId,
	);
	if (workflowRun.status !== "paused") {
		throw new ConvexError("Only paused workflow runs can be resumed");
	}

	const now = Date.now();
	await ctx.db.patch(workflowRun._id, {
		status: "approved" as const,
		blockedReason: undefined,
		updatedAt: now,
	});

	return {
		...workflowRun,
		status: "approved" as const,
		blockedReason: undefined,
		updatedAt: now,
	};
}

export async function stopWorkspaceWorkflowRunHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		workflowRunId: WorkflowRunId;
		reason?: string;
	},
) {
	assertBoundedText(args.reason, "stop reason");
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	await requireViewerWorkspaceProject(ctx, clerkUserId, args.projectId);
	const workflowRun = await requireWorkflowRun(
		ctx,
		args.projectId,
		args.workflowRunId,
	);
	if (isTerminalWorkflowRunStatus(workflowRun.status)) {
		return workflowRun;
	}

	const now = Date.now();
	const stoppedReason = args.reason ?? "Stopped from workspace run controls";
	await ctx.db.patch(workflowRun._id, {
		status: "canceled" as const,
		deliveryStatus: "blocked" as const,
		blockedReason: stoppedReason,
		completedAt: now,
		updatedAt: now,
	});
	if (workflowRun.findingDocumentId) {
		await ctx.db.patch(workflowRun.findingDocumentId, {
			status: "needs_approval" as const,
			blockedReason: stoppedReason,
			updatedAt: now,
		});
	}

	return {
		...workflowRun,
		status: "canceled" as const,
		deliveryStatus: "blocked" as const,
		blockedReason: stoppedReason,
		completedAt: now,
		updatedAt: now,
	};
}

async function requireDoctorPassRunForEvent(
	ctx: WorkspaceMutationCtx,
	projectId: WorkspaceProjectId,
	doctorPassRunId: DoctorPassRunId | undefined,
) {
	if (!doctorPassRunId) {
		throw new ConvexError("Doctor pass event requires doctorPassRunId");
	}

	return requireDoctorPassRun(ctx, projectId, doctorPassRunId);
}

async function requireWorkflowRunForEvent(
	ctx: WorkspaceMutationCtx,
	projectId: WorkspaceProjectId,
	workflowRunId: WorkflowRunId | undefined,
) {
	if (!workflowRunId) {
		throw new ConvexError("Workflow event requires workflowRunId");
	}

	return requireWorkflowRun(ctx, projectId, workflowRunId);
}

async function applyEventDerivedState(
	ctx: WorkspaceMutationCtx,
	args: {
		project: WorkspaceProjectDoc;
		runnerBinding: WorkspaceRunnerBindingDoc;
		doctorPassRunId?: DoctorPassRunId;
		workflowRunId?: WorkflowRunId;
		createdAt: number;
		payload: WorkspaceRunnerEventPayload;
	},
) {
	const now = Date.now();

	switch (args.payload.eventType) {
		case "runner.paired": {
			await Promise.all([
				ctx.db.patch(args.runnerBinding._id, {
					status:
						args.payload.pairingStatus === "revoked"
							? ("revoked" as const)
							: ("paired" as const),
					pairingStatus: args.payload.pairingStatus,
					runnerMode: args.payload.runnerMode,
					machineDisplayName: args.payload.machineDisplayName,
					runnerVersion: args.payload.runnerVersion,
					pairedAt: args.runnerBinding.pairedAt ?? args.createdAt,
					lastEventAt: args.createdAt,
					updatedAt: now,
				}),
				upsertRepositoryBindingFromRunnerPairing(ctx, {
					projectId: args.project._id,
					runnerId: args.runnerBinding._id,
					repositoryDisplayName: args.payload.repositoryDisplayName,
					now,
				}),
			]);
			return;
		}
		case "runner.heartbeat": {
			await ctx.db.patch(args.runnerBinding._id, {
				status: "paired" as const,
				runnerMode: args.payload.runnerMode,
				machineHealthStatus: args.payload.machineHealthStatus,
				projectHealthStatus: args.payload.projectHealthStatus,
				lastHeartbeatAt: args.createdAt,
				lastEventAt: args.createdAt,
				updatedAt: now,
			});
			return;
		}
		case "setup.check.started": {
			await ctx.db.patch(args.runnerBinding._id, {
				lastEventAt: args.createdAt,
				updatedAt: now,
			});
			return;
		}
		case "setup.check.completed": {
			await Promise.all([
				ctx.db.patch(args.project._id, {
					updatedAt: now,
				}),
				ctx.db.patch(args.runnerBinding._id, {
					...(args.payload.scope === "machine"
						? { machineHealthStatus: args.payload.status }
						: { projectHealthStatus: args.payload.status }),
					lastEventAt: args.createdAt,
					updatedAt: now,
				}),
			]);
			return;
		}
		case "doctor.stage.started": {
			const doctorPassRun = await requireDoctorPassRunForEvent(
				ctx,
				args.project._id,
				args.doctorPassRunId,
			);
			await ctx.db.patch(doctorPassRun._id, {
				status:
					args.payload.stage === "sync_preview_ready"
						? ("sync_preview_ready" as const)
						: ("running" as const),
				currentStage: args.payload.stage,
				updatedAt: now,
			});
			return;
		}
		case "doctor.probe.completed": {
			const doctorPassRun = await requireDoctorPassRunForEvent(
				ctx,
				args.project._id,
				args.doctorPassRunId,
			);
			if (
				args.payload.status === "blocked" ||
				args.payload.status === "failed"
			) {
				await ctx.db.patch(doctorPassRun._id, {
					status:
						args.payload.status === "blocked"
							? ("blocked" as const)
							: ("failed" as const),
					blockedReason: args.payload.blockedReason ?? args.payload.summary,
					updatedAt: now,
				});
			} else {
				await ctx.db.patch(doctorPassRun._id, {
					updatedAt: now,
				});
			}
			return;
		}
		case "doctor.sync_preview.ready": {
			const doctorPassRun = await requireDoctorPassRunForEvent(
				ctx,
				args.project._id,
				args.doctorPassRunId,
			);
			await ctx.db.patch(doctorPassRun._id, {
				status: "sync_preview_ready" as const,
				currentStage: "sync_preview_ready" as const,
				syncPreviewStatus: "ready" as const,
				syncPreviewDigest: args.payload.previewDigest,
				syncPreviewFindingsCount: args.payload.findingsCount,
				excludedArtifactCount: args.payload.excludedArtifactCount,
				localReportRef: args.payload.localReportRef,
				updatedAt: now,
			});
			return;
		}
		case "doctor.findings.approved": {
			throw new ConvexError(
				"Sync preview approval must use approveWorkspaceSyncPreview",
			);
		}
		case "workflow.approval.requested": {
			const workflowRun = await requireWorkflowRunForEvent(
				ctx,
				args.project._id,
				args.workflowRunId,
			);
			await ctx.db.patch(workflowRun._id, {
				status: "approval_requested" as const,
				updatedAt: now,
			});
			return;
		}
		case "workflow.claimed": {
			const workflowRun = await requireWorkflowRunForEvent(
				ctx,
				args.project._id,
				args.workflowRunId,
			);
			if (isTerminalWorkflowRunStatus(workflowRun.status)) {
				return;
			}
			await ctx.db.patch(workflowRun._id, {
				status: "running" as const,
				startedAt: workflowRun.startedAt ?? args.createdAt,
				writeLeaseExpiresAt: args.payload.writeLeaseExpiresAt,
				updatedAt: now,
			});
			return;
		}
		case "workflow.started": {
			const workflowRun = await requireWorkflowRunForEvent(
				ctx,
				args.project._id,
				args.workflowRunId,
			);
			if (isTerminalWorkflowRunStatus(workflowRun.status)) {
				return;
			}
			await ctx.db.patch(workflowRun._id, {
				status: "running" as const,
				startedAt: args.createdAt,
				updatedAt: now,
			});
			if (workflowRun.findingDocumentId) {
				await ctx.db.patch(workflowRun.findingDocumentId, {
					status: "running" as const,
					updatedAt: now,
				});
			}
			return;
		}
		case "workflow.proof.completed": {
			const workflowRun = await requireWorkflowRunForEvent(
				ctx,
				args.project._id,
				args.workflowRunId,
			);
			if (isTerminalWorkflowRunStatus(workflowRun.status)) {
				return;
			}
			await ctx.db.patch(workflowRun._id, {
				status: "proof_completed" as const,
				proofStatus: args.payload.proofStatus,
				deliveryStatus: "local_only" as const,
				proofSummary: args.payload.proofSummary,
				touchedFileRefs: args.payload.touchedFileRefs,
				createdArtifactRefs: args.payload.createdArtifactRefs,
				proofCommandResults: args.payload.proofCommandResults,
				nextRecommendedWorkflowId: args.payload.nextRecommendedWorkflowId,
				completedAt: args.createdAt,
				updatedAt: now,
			});
			if (workflowRun.findingDocumentId) {
				await ctx.db.patch(workflowRun.findingDocumentId, {
					status:
						args.payload.proofStatus === "passed"
							? ("done" as const)
							: ("blocked" as const),
					blockedReason:
						args.payload.proofStatus === "passed"
							? undefined
							: args.payload.proofSummary,
					updatedAt: now,
				});
			}
			return;
		}
		case "workflow.blocked": {
			const workflowRun = await requireWorkflowRunForEvent(
				ctx,
				args.project._id,
				args.workflowRunId,
			);
			if (isTerminalWorkflowRunStatus(workflowRun.status)) {
				return;
			}
			await ctx.db.patch(workflowRun._id, {
				status: "blocked" as const,
				proofStatus: "blocked" as const,
				deliveryStatus: "blocked" as const,
				blockedReason: args.payload.blockedReason,
				completedAt: args.createdAt,
				updatedAt: now,
			});
			if (workflowRun.findingDocumentId) {
				await ctx.db.patch(workflowRun.findingDocumentId, {
					status: "blocked" as const,
					blockedReason: args.payload.blockedReason,
					updatedAt: now,
				});
			}
			return;
		}
		case "runner.revoked": {
			await ctx.db.patch(args.runnerBinding._id, {
				status: "revoked" as const,
				pairingStatus: "revoked" as const,
				revokedAt: args.createdAt,
				lastEventAt: args.createdAt,
				updatedAt: now,
			});
			return;
		}
	}
}

async function insertWorkspaceRunnerEvent(
	ctx: WorkspaceMutationCtx,
	args: {
		project: WorkspaceProjectDoc;
		runnerBinding: WorkspaceRunnerBindingDoc;
		eventId: string;
		doctorPassRunId?: DoctorPassRunId;
		workflowRunId?: WorkflowRunId;
		eventType: WorkspaceRunnerEventType;
		createdAt: number;
		payload: WorkspaceRunnerEventPayload;
	},
) {
	const existingEvent = await ctx.db
		.query("workspaceRunnerEvents")
		.withIndex("by_event_id", (query) => query.eq("eventId", args.eventId))
		.unique();

	if (existingEvent) {
		if (
			existingEvent.projectId !== args.project._id ||
			existingEvent.runnerId !== args.runnerBinding._id
		) {
			throw new ConvexError("Runner event id already belongs elsewhere");
		}

		return {
			eventId: existingEvent.eventId,
			inserted: false,
			eventDocumentId: existingEvent._id,
		};
	}

	if (args.doctorPassRunId) {
		await requireDoctorPassRun(ctx, args.project._id, args.doctorPassRunId);
	}
	if (args.workflowRunId) {
		const workflowRun = await requireWorkflowRun(
			ctx,
			args.project._id,
			args.workflowRunId,
		);
		requireWorkflowRunOwnedByRunner(workflowRun, args.runnerBinding);
		requireWorkflowRunActiveLeaseForEvent(workflowRun, args.payload);
		if ("workflowId" in args.payload) {
			if (args.payload.workflowId !== workflowRun.workflowId) {
				throw new ConvexError("Runner event workflow id does not match run");
			}
			if (
				args.payload.eventType === "workflow.started" &&
				(args.payload.branchName !== workflowRun.branchName ||
					args.payload.profileName !== workflowRun.profileName)
			) {
				throw new ConvexError(
					"Runner event branch and profile must match approved workflow run",
				);
			}
		}
	}

	const receivedAt = Date.now();
	const eventDocument = {
		eventId: args.eventId,
		projectId: args.project._id,
		runnerId: args.runnerBinding._id,
		doctorPassRunId: args.doctorPassRunId,
		workflowRunId: args.workflowRunId,
		eventType: args.eventType,
		schemaVersion: getWorkspaceRunnerEventSchemaVersion(),
		createdAt: args.createdAt,
		receivedAt,
		payload: args.payload,
	};
	const eventDocumentId = await ctx.db.insert(
		"workspaceRunnerEvents",
		eventDocument,
	);

	await applyEventDerivedState(ctx, {
		project: args.project,
		runnerBinding: args.runnerBinding,
		doctorPassRunId: args.doctorPassRunId,
		workflowRunId: args.workflowRunId,
		createdAt: args.createdAt,
		payload: args.payload,
	});

	return {
		eventId: args.eventId,
		inserted: true,
		eventDocumentId,
	};
}

export async function ingestWorkspaceRunnerEventHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		eventId: string;
		projectId: WorkspaceProjectId;
		runnerId: WorkspaceRunnerBindingId;
		doctorPassRunId?: DoctorPassRunId;
		workflowRunId?: WorkflowRunId;
		eventType: WorkspaceRunnerEventType;
		schemaVersion: string;
		createdAt: number;
		payload: WorkspaceRunnerEventPayload;
	},
) {
	if (args.schemaVersion !== getWorkspaceRunnerEventSchemaVersion()) {
		throw new ConvexError("Unsupported runner event schema version");
	}

	assertSyncSafeText(args.eventId, "eventId");
	assertWorkspaceRunnerEventPayload(args.eventType, args.payload);
	if (args.eventType === "doctor.findings.approved") {
		throw new ConvexError(
			"Sync preview approval must use approveWorkspaceSyncPreview",
		);
	}

	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	const project = await requireViewerWorkspaceProject(
		ctx,
		clerkUserId,
		args.projectId,
	);
	const runnerBinding = await requireRunnerBinding(
		ctx,
		project._id,
		args.runnerId,
	);

	return await insertWorkspaceRunnerEvent(ctx, {
		project,
		runnerBinding,
		doctorPassRunId: args.doctorPassRunId,
		workflowRunId: args.workflowRunId,
		eventId: args.eventId,
		eventType: args.eventType,
		createdAt: args.createdAt,
		payload: args.payload,
	});
}

export async function ingestWorkspaceRunnerEventByCredentialHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		runnerCredentialHash: string;
		eventId: string;
		projectId: WorkspaceProjectId;
		runnerId: WorkspaceRunnerBindingId;
		doctorPassRunId?: DoctorPassRunId;
		workflowRunId?: WorkflowRunId;
		eventType: WorkspaceRunnerEventType;
		schemaVersion: string;
		createdAt: number;
		payload: WorkspaceRunnerEventPayload;
	},
) {
	if (args.schemaVersion !== getWorkspaceRunnerEventSchemaVersion()) {
		throw new ConvexError("Unsupported runner event schema version");
	}

	assertSyncSafeText(args.runnerCredentialHash, "runnerCredentialHash");
	assertSyncSafeText(args.eventId, "eventId");
	assertWorkspaceRunnerEventPayload(args.eventType, args.payload);
	if (args.eventType === "doctor.findings.approved") {
		throw new ConvexError(
			"Sync preview approval must use approveWorkspaceSyncPreview",
		);
	}

	const runnerBinding = await requireRunnerBindingByCredentialHash(
		ctx,
		args.runnerCredentialHash,
	);
	if (
		runnerBinding._id !== args.runnerId ||
		runnerBinding.projectId !== args.projectId
	) {
		throw new ConvexError("Workspace runner credential does not match event");
	}
	const project = await requireRunnerProject(ctx, runnerBinding);

	return await insertWorkspaceRunnerEvent(ctx, {
		project,
		runnerBinding,
		doctorPassRunId: args.doctorPassRunId,
		workflowRunId: args.workflowRunId,
		eventId: args.eventId,
		eventType: args.eventType,
		createdAt: args.createdAt,
		payload: args.payload,
	});
}

export async function approveWorkspaceSyncPreviewHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		doctorPassRunId: DoctorPassRunId;
		previewDigest: string;
	},
) {
	assertSyncSafeText(args.previewDigest, "previewDigest");
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	await requireViewerWorkspaceProject(ctx, clerkUserId, args.projectId);
	const doctorPassRun = await requireDoctorPassRun(
		ctx,
		args.projectId,
		args.doctorPassRunId,
	);

	if (doctorPassRun.syncPreviewDigest !== args.previewDigest) {
		throw new ConvexError("Sync preview digest does not match run");
	}

	if (doctorPassRun.syncPreviewStatus !== "ready") {
		throw new ConvexError("Sync preview is not ready for approval");
	}

	const now = Date.now();
	await ctx.db.patch(doctorPassRun._id, {
		status: "sync_approved" as const,
		syncPreviewStatus: "approved" as const,
		syncPreviewApprovedAt: now,
		syncPreviewApprovedByClerkUserId: clerkUserId,
		syncPreviewApprovedDigest: args.previewDigest,
		syncPreviewApprovedSchemaVersion: DOCTOR_PASS_LOCAL_SCHEMA_VERSION,
		syncPreviewApprovalSource: "workspace",
		updatedAt: now,
	});

	return {
		...doctorPassRun,
		status: "sync_approved" as const,
		syncPreviewStatus: "approved" as const,
		syncPreviewApprovedAt: now,
		syncPreviewApprovedByClerkUserId: clerkUserId,
		syncPreviewApprovedDigest: args.previewDigest,
		syncPreviewApprovedSchemaVersion: DOCTOR_PASS_LOCAL_SCHEMA_VERSION,
		syncPreviewApprovalSource: "workspace",
		updatedAt: now,
	};
}

function normalizeCodebaseFindingInput(finding: CodebaseFindingInput) {
	assertSyncSafeValue(finding, `finding ${finding.findingId}`);
	if (finding.evidenceRefs.length > 20) {
		throw new ConvexError("Finding has too many evidence refs");
	}
	if (finding.confidence < 0 || finding.confidence > 1) {
		throw new ConvexError("Finding confidence must be between 0 and 1");
	}
	if (finding.rank < 1 || finding.rank > MAX_SYNCED_FINDINGS_PER_RUN) {
		throw new ConvexError("Finding rank is outside the Top 9 range");
	}

	return finding;
}

export async function syncApprovedCodebaseFindingsHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		doctorPassRunId: DoctorPassRunId;
		previewDigest: string;
		findings: CodebaseFindingInput[];
	},
) {
	assertSyncSafeText(args.previewDigest, "previewDigest");
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	await requireViewerWorkspaceProject(ctx, clerkUserId, args.projectId);
	return await syncFindingsForApprovedDoctorPassRun(ctx, args);
}

export async function syncApprovedCodebaseFindingsByCredentialHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		runnerCredentialHash: string;
		projectId: WorkspaceProjectId;
		runnerId: WorkspaceRunnerBindingId;
		doctorPassRunId: DoctorPassRunId;
		previewDigest: string;
		findings: CodebaseFindingInput[];
	},
) {
	assertSyncSafeText(args.runnerCredentialHash, "runnerCredentialHash");
	assertSyncSafeText(args.previewDigest, "previewDigest");
	const runnerBinding = await requireRunnerBindingByCredentialHash(
		ctx,
		args.runnerCredentialHash,
	);
	if (
		runnerBinding._id !== args.runnerId ||
		runnerBinding.projectId !== args.projectId
	) {
		throw new ConvexError("Workspace runner credential does not match sync");
	}
	const doctorPassRun = await requireDoctorPassRun(
		ctx,
		args.projectId,
		args.doctorPassRunId,
	);
	if (doctorPassRun.runnerId && doctorPassRun.runnerId !== args.runnerId) {
		throw new ConvexError("Workspace runner does not own this doctor pass run");
	}
	return await syncFindingsForApprovedDoctorPassRun(ctx, args, doctorPassRun);
}

async function syncFindingsForApprovedDoctorPassRun(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		doctorPassRunId: DoctorPassRunId;
		previewDigest: string;
		findings: CodebaseFindingInput[];
	},
	existingDoctorPassRun?: Awaited<ReturnType<typeof requireDoctorPassRun>>,
) {
	assertSyncSafeText(args.previewDigest, "previewDigest");
	if (args.findings.length > MAX_SYNCED_FINDINGS_PER_RUN) {
		throw new ConvexError("Only Top 9 findings can be synced");
	}

	const doctorPassRun =
		existingDoctorPassRun ??
		(await requireDoctorPassRun(ctx, args.projectId, args.doctorPassRunId));
	if (
		doctorPassRun.syncPreviewStatus !== "approved" &&
		doctorPassRun.syncPreviewStatus !== "uploaded"
	) {
		throw new ConvexError("Sync preview must be approved before findings sync");
	}
	if (doctorPassRun.syncPreviewDigest !== args.previewDigest) {
		throw new ConvexError("Sync preview digest does not match run");
	}
	if (
		doctorPassRun.syncPreviewApprovedDigest &&
		doctorPassRun.syncPreviewApprovedDigest !== args.previewDigest
	) {
		throw new ConvexError("Approved sync preview digest does not match upload");
	}
	const uploadDigest = await createApprovedFindingsDigest({
		doctorPassRun,
		findings: args.findings,
	});
	if (uploadDigest !== args.previewDigest) {
		throw new ConvexError("Uploaded findings do not match approved preview");
	}

	const now = Date.now();
	let insertedCount = 0;
	let patchedCount = 0;

	for (const finding of args.findings.map(normalizeCodebaseFindingInput)) {
		const existingFinding = await ctx.db
			.query("codebaseFindings")
			.withIndex("by_project_id_and_finding_id", (query) =>
				query
					.eq("projectId", args.projectId)
					.eq("findingId", finding.findingId),
			)
			.unique();
		const findingDocumentPatch = {
			projectId: args.projectId,
			doctorPassRunId: args.doctorPassRunId,
			findingId: finding.findingId,
			rank: finding.rank,
			status: finding.status,
			title: finding.title,
			category: finding.category,
			severity: finding.severity,
			confidence: finding.confidence,
			buyerImpact: finding.buyerImpact,
			blastRadius: finding.blastRadius,
			proofPath: finding.proofPath,
			proofability: finding.proofability,
			permissionRequired: finding.permissionRequired,
			recommendedWorkflowId: finding.recommendedWorkflowId,
			whyThisNow: finding.whyThisNow,
			evidenceRefs: finding.evidenceRefs,
			blockedReason: finding.blockedReason,
			syncSensitivity: finding.syncSensitivity,
			localReportRef: finding.localReportRef,
			updatedAt: now,
			deletedAt: undefined,
		};

		if (existingFinding) {
			await ctx.db.patch(existingFinding._id, findingDocumentPatch);
			patchedCount += 1;
			continue;
		}

		await ctx.db.insert("codebaseFindings", {
			...findingDocumentPatch,
			createdAt: now,
		});
		insertedCount += 1;
	}

	await ctx.db.patch(doctorPassRun._id, {
		status: "findings_uploaded" as const,
		syncPreviewStatus: "uploaded" as const,
		findingsCount: args.findings.length,
		updatedAt: now,
	});

	return {
		syncedAt: now,
		insertedCount,
		patchedCount,
	};
}

async function createApprovedFindingsDigest({
	doctorPassRun,
	findings,
}: {
	doctorPassRun: Awaited<ReturnType<typeof requireDoctorPassRun>>;
	findings: CodebaseFindingInput[];
}) {
	if (!doctorPassRun.localRunId) {
		throw new ConvexError("Doctor pass run is missing its local run id");
	}

	const payload = {
		schemaVersion: DOCTOR_PASS_LOCAL_SCHEMA_VERSION,
		runId: doctorPassRun.localRunId,
		doctorPassRunId: doctorPassRun._id,
		findings: findings.map(normalizeFindingForPreviewDigest),
	};
	const encodedPayload = new TextEncoder().encode(JSON.stringify(payload));
	const digest = await crypto.subtle.digest("SHA-256", encodedPayload);
	return `sha256:${Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("")}`;
}

function normalizeFindingForPreviewDigest(finding: CodebaseFindingInput) {
	return {
		findingId: finding.findingId,
		rank: finding.rank,
		status: finding.status,
		title: finding.title,
		category: finding.category,
		severity: finding.severity,
		confidence: finding.confidence,
		buyerImpact: finding.buyerImpact,
		blastRadius: finding.blastRadius,
		proofPath: finding.proofPath,
		proofability: finding.proofability,
		permissionRequired: finding.permissionRequired,
		recommendedWorkflowId: finding.recommendedWorkflowId,
		whyThisNow: finding.whyThisNow,
		evidenceRefs: finding.evidenceRefs,
		blockedReason: finding.blockedReason,
		syncSensitivity: finding.syncSensitivity,
		localReportRef: finding.localReportRef,
	};
}

export async function listWorkspaceFindingsHandler(
	ctx: WorkspaceQueryCtx,
	args: {
		projectId?: WorkspaceProjectId;
		status?:
			| "ready"
			| "blocked"
			| "needs_approval"
			| "running"
			| "done"
			| "deleted";
	},
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	const project = await loadViewerWorkspaceProject(
		ctx,
		clerkUserId,
		args.projectId,
	);
	if (!project) {
		return [];
	}

	if (args.status) {
		return await ctx.db
			.query("codebaseFindings")
			.withIndex("by_project_id_and_status_and_rank", (query) =>
				query.eq("projectId", project._id).eq("status", args.status!),
			)
			.take(MAX_SYNCED_FINDINGS_PER_RUN);
	}

	const findings = await ctx.db
		.query("codebaseFindings")
		.withIndex("by_project_id_and_rank", (query) =>
			query.eq("projectId", project._id),
		)
		.collect();

	return findings
		.filter((finding) => finding.status !== "deleted")
		.slice(0, MAX_SYNCED_FINDINGS_PER_RUN);
}

export async function getWorkspaceRunHistoryHandler(
	ctx: WorkspaceQueryCtx,
	args: { projectId?: WorkspaceProjectId },
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	const project = await loadViewerWorkspaceProject(
		ctx,
		clerkUserId,
		args.projectId,
	);
	if (!project) {
		return {
			doctorPassRuns: [],
			workflowRuns: [],
		};
	}

	const [doctorPassRuns, workflowRunsByStatus] = await Promise.all([
		ctx.db
			.query("doctorPassRuns")
			.withIndex("by_project_id_and_started_at", (query) =>
				query.eq("projectId", project._id),
			)
			.order("desc")
			.take(20),
		Promise.all(
			APPROVED_WORKFLOW_HISTORY_STATUSES.map((status) =>
				ctx.db
					.query("workflowRuns")
					.withIndex("by_project_id_and_status_and_created_at", (query) =>
						query.eq("projectId", project._id).eq("status", status),
					)
					.order("desc")
					.take(20),
			),
		),
	]);
	const workflowRuns = workflowRunsByStatus
		.flat()
		.sort(compareWorkflowRunsByCreatedAtDesc)
		.slice(0, 20);

	return {
		doctorPassRuns,
		workflowRuns,
	};
}

function compareWorkflowRunsByCreatedAtDesc(
	left: WorkflowRunDoc,
	right: WorkflowRunDoc,
) {
	return right.createdAt - left.createdAt;
}

export async function getWorkspaceHeartbeatStateHandler(
	ctx: WorkspaceQueryCtx,
	args: { projectId?: WorkspaceProjectId },
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	const project = await loadViewerWorkspaceProject(
		ctx,
		clerkUserId,
		args.projectId,
	);
	if (!project) {
		return {
			project: null,
			activeRunner: null,
		};
	}

	const activeRunners = await ctx.db
		.query("workspaceRunnerBindings")
		.withIndex("by_project_id_and_status_and_updated_at", (query) =>
			query.eq("projectId", project._id).eq("status", "paired"),
		)
		.order("desc")
		.take(1);

	return {
		project,
		activeRunner: activeRunners[0]
			? redactRunnerCredentialHash(activeRunners[0])
			: null,
	};
}

export async function getWorkspaceSyncPreviewStateHandler(
	ctx: WorkspaceQueryCtx,
	args: { projectId?: WorkspaceProjectId },
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	const project = await loadViewerWorkspaceProject(
		ctx,
		clerkUserId,
		args.projectId,
	);
	if (!project) {
		return {
			doctorPassRun: null,
		};
	}

	const syncPreviewRuns = await ctx.db
		.query("doctorPassRuns")
		.withIndex("by_project_id_and_started_at", (query) =>
			query.eq("projectId", project._id),
		)
		.order("desc")
		.take(20);

	return {
		doctorPassRun:
			syncPreviewRuns.find(
				(run) =>
					run.syncPreviewStatus === "ready" ||
					run.syncPreviewStatus === "approved" ||
					run.syncPreviewStatus === "uploaded",
			) ?? null,
	};
}

async function buildManagedGithubExecutionStateForProject(
	ctx: WorkspaceReadCtx,
	project: WorkspaceProjectDoc | null,
) {
	if (!project) {
		return {
			consent: null,
			auditEvents: [],
		};
	}

	const [requestedConsents, approvedConsents, auditEvents] = await Promise.all([
		ctx.db
			.query("managedGithubExecutionConsents")
			.withIndex("by_project_id_and_status_and_updated_at", (query) =>
				query.eq("projectId", project._id).eq("status", "requested"),
			)
			.order("desc")
			.take(1),
		ctx.db
			.query("managedGithubExecutionConsents")
			.withIndex("by_project_id_and_status_and_updated_at", (query) =>
				query.eq("projectId", project._id).eq("status", "approved"),
			)
			.order("desc")
			.take(1),
		ctx.db
			.query("managedGithubAuditEvents")
			.withIndex("by_project_id_and_created_at", (query) =>
				query.eq("projectId", project._id),
			)
			.order("desc")
			.take(12),
	]);

	return {
		consent: approvedConsents[0] ?? requestedConsents[0] ?? null,
		auditEvents,
	};
}

export async function getManagedGithubExecutionStateHandler(
	ctx: WorkspaceQueryCtx,
	args: { projectId?: WorkspaceProjectId },
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	const project = await loadViewerWorkspaceProject(
		ctx,
		clerkUserId,
		args.projectId,
	);
	return buildManagedGithubExecutionStateForProject(ctx, project);
}

export async function requestManagedGithubExecutionConsentHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		repositoryBindingId: WorkspaceRepositoryBindingId;
		acknowledgement: {
			repoAccess: true;
			installationScope: true;
			storagePolicy: true;
			prAuthority: true;
			auditLog: true;
			revocation: true;
			rawSourceVisibility: true;
			proofBoundaries: true;
		};
	},
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	await requireViewerWorkspaceProject(ctx, clerkUserId, args.projectId);
	const repositoryBinding = requireManagedGithubRepositoryBinding(
		await requireRepositoryBinding(
			ctx,
			args.projectId,
			args.repositoryBindingId,
		),
	);
	const existingConsent = await findActiveManagedGithubConsent(
		ctx,
		args.projectId,
	);
	if (existingConsent) {
		const project = await ctx.db.get(args.projectId);
		return buildManagedGithubExecutionStateForProject(ctx, project);
	}

	const now = Date.now();
	const consentPacket = buildManagedGithubConsentPacket(repositoryBinding);
	const consent = {
		projectId: args.projectId,
		repositoryBindingId: args.repositoryBindingId,
		status: "requested" as const,
		...consentPacket,
		requestedByClerkUserId: clerkUserId,
		requestedAt: now,
		createdAt: now,
		updatedAt: now,
	};
	const consentId = await ctx.db.insert(
		"managedGithubExecutionConsents",
		consent,
	);
	await insertManagedGithubAuditEvent(ctx, {
		projectId: args.projectId,
		consentId,
		eventType: "managed_github.requested",
		actorClerkUserId: clerkUserId,
		repositoryLabel: buildManagedGithubRepositoryLabel(repositoryBinding),
		summary:
			"Customer requested concierge managed GitHub review after accepting repository, storage, PR, audit, raw-source, revocation, and proof boundaries.",
		createdAt: now,
	});

	const project = await ctx.db.get(args.projectId);
	return buildManagedGithubExecutionStateForProject(ctx, project);
}

async function findActiveManagedGithubConsent(
	ctx: WorkspaceReadCtx,
	projectId: WorkspaceProjectId,
) {
	const [approvedConsents, requestedConsents] = await Promise.all([
		ctx.db
			.query("managedGithubExecutionConsents")
			.withIndex("by_project_id_and_status_and_updated_at", (query) =>
				query.eq("projectId", projectId).eq("status", "approved"),
			)
			.order("desc")
			.take(1),
		ctx.db
			.query("managedGithubExecutionConsents")
			.withIndex("by_project_id_and_status_and_updated_at", (query) =>
				query.eq("projectId", projectId).eq("status", "requested"),
			)
			.order("desc")
			.take(1),
	]);

	return approvedConsents[0] ?? requestedConsents[0] ?? null;
}

export async function revokeManagedGithubExecutionConsentHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		consentId: ManagedGithubExecutionConsentId;
		reason?: string;
	},
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	await requireViewerWorkspaceProject(ctx, clerkUserId, args.projectId);
	const consent = await ctx.db.get(args.consentId);
	if (!consent || consent.projectId !== args.projectId) {
		throw new ConvexError("Managed GitHub consent not found");
	}
	assertBoundedText(args.reason, "managed GitHub revocation reason");

	if (consent.status === "revoked") {
		const project = await ctx.db.get(args.projectId);
		return buildManagedGithubExecutionStateForProject(ctx, project);
	}

	const now = Date.now();
	const repositoryBinding = await requireRepositoryBinding(
		ctx,
		args.projectId,
		consent.repositoryBindingId,
	);
	await ctx.db.patch(consent._id, {
		status: "revoked" as const,
		revokedByClerkUserId: clerkUserId,
		revokedAt: now,
		revokeReason: args.reason,
		updatedAt: now,
	});
	await insertManagedGithubAuditEvent(ctx, {
		projectId: args.projectId,
		consentId: consent._id,
		eventType: "managed_github.revoked",
		actorClerkUserId: clerkUserId,
		repositoryLabel: buildManagedGithubRepositoryLabel(repositoryBinding),
		summary:
			args.reason ??
			"Customer revoked managed GitHub concierge request from workspace privacy controls.",
		createdAt: now,
	});

	const project = await ctx.db.get(args.projectId);
	return buildManagedGithubExecutionStateForProject(ctx, project);
}

export async function revokeWorkspaceRunnerHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		runnerId: WorkspaceRunnerBindingId;
		reason?: string;
	},
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	await requireViewerWorkspaceProject(ctx, clerkUserId, args.projectId);
	const runnerBinding = await requireRunnerBindingForRevocation(
		ctx,
		args.projectId,
		args.runnerId,
	);
	assertBoundedText(args.reason, "revocation reason");

	const now = Date.now();
	await ctx.db.patch(runnerBinding._id, {
		status: "revoked" as const,
		pairingStatus: "revoked" as const,
		revokedAt: now,
		updatedAt: now,
	});

	return {
		...runnerBinding,
		status: "revoked" as const,
		pairingStatus: "revoked" as const,
		revokedAt: now,
		updatedAt: now,
	};
}

export async function markWorkspaceFindingsDeletedHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		findingDocumentIds: CodebaseFindingId[];
	},
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	await requireViewerWorkspaceProject(ctx, clerkUserId, args.projectId);
	const now = Date.now();
	let markedCount = 0;

	for (const findingDocumentId of args.findingDocumentIds) {
		const finding = await ctx.db.get(findingDocumentId);
		if (!finding || finding.projectId !== args.projectId) {
			throw new ConvexError("Finding not found");
		}

		await ctx.db.patch(finding._id, {
			status: "deleted" as const,
			deletedAt: now,
			updatedAt: now,
		});
		markedCount += 1;
	}

	return {
		markedAt: now,
		markedCount,
	};
}

export async function markWorkspaceProjectDeletedHandler(
	ctx: WorkspaceMutationCtx,
	args: { projectId: WorkspaceProjectId },
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	const project = await requireViewerWorkspaceProject(
		ctx,
		clerkUserId,
		args.projectId,
	);
	const now = Date.now();

	await ctx.db.patch(project._id, {
		status: "deleted" as const,
		deletedAt: now,
		updatedAt: now,
	});

	return {
		markedAt: now,
		markedCount: 1,
	};
}
