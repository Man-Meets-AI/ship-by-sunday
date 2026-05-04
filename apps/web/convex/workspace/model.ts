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
	workspaceSetupStateValidator,
	workspaceSyncPreviewStateValidator,
	workflowRunDocumentValidator,
} from "./validators";

const DEFAULT_WORKSPACE_PROJECT_NAME = "Existing codebase workspace";
const MAX_SYNCED_FINDINGS_PER_RUN = 9;
const PAIRING_TOKEN_TTL_MS = 30 * 60 * 1000;
const SETUP_EVENT_READ_LIMIT = 30;

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
	runnerMode: workspaceRunnerModeValidator,
};
export const startWorkspaceDoctorPassRunReturns =
	doctorPassRunDocumentValidator;

export const requestWorkspaceWorkflowRunArgs = {
	projectId: v.id("workspaceProjects"),
	findingDocumentId: v.optional(v.id("codebaseFindings")),
	runnerId: v.optional(v.id("workspaceRunnerBindings")),
	workflowId: v.string(),
	workflowVersion: v.optional(v.string()),
};
export const requestWorkspaceWorkflowRunReturns = workflowRunDocumentValidator;

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
	findings: v.array(codebaseFindingInputValidator),
};
export const syncApprovedCodebaseFindingsReturns =
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

	const now = Date.now();
	const doctorPassRun = {
		projectId: args.projectId,
		runnerId: args.runnerId,
		repositoryBindingId: args.repositoryBindingId,
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

export async function requestWorkspaceWorkflowRunHandler(
	ctx: WorkspaceMutationCtx,
	args: {
		projectId: WorkspaceProjectId;
		findingDocumentId?: CodebaseFindingId;
		runnerId?: WorkspaceRunnerBindingId;
		workflowId: string;
		workflowVersion?: string;
	},
) {
	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	await requireViewerWorkspaceProject(ctx, clerkUserId, args.projectId);
	if (args.runnerId) {
		await requireRunnerBinding(ctx, args.projectId, args.runnerId);
	}
	if (args.findingDocumentId) {
		const finding = await ctx.db.get(args.findingDocumentId);
		if (!finding || finding.projectId !== args.projectId) {
			throw new ConvexError("Finding not found");
		}
	}

	assertSyncSafeText(args.workflowId, "workflowId");
	assertBoundedText(args.workflowVersion, "workflowVersion");

	const now = Date.now();
	const workflowRun = {
		projectId: args.projectId,
		findingDocumentId: args.findingDocumentId,
		runnerId: args.runnerId,
		workflowId: args.workflowId,
		workflowVersion: args.workflowVersion ?? "v1",
		status: "approval_requested" as const,
		proofStatus: "not_started" as const,
		deliveryStatus: "not_started" as const,
		createdAt: now,
		updatedAt: now,
	};
	const workflowRunId = await ctx.db.insert("workflowRuns", workflowRun);

	return {
		_id: workflowRunId,
		_creationTime: now,
		...workflowRun,
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
			await ctx.db.patch(args.runnerBinding._id, {
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
			});
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
		case "workflow.started": {
			const workflowRun = await requireWorkflowRunForEvent(
				ctx,
				args.project._id,
				args.workflowRunId,
			);
			await ctx.db.patch(workflowRun._id, {
				status: "running" as const,
				branchName: args.payload.branchName,
				profileName: args.payload.profileName,
				startedAt: args.createdAt,
				updatedAt: now,
			});
			return;
		}
		case "workflow.proof.completed": {
			const workflowRun = await requireWorkflowRunForEvent(
				ctx,
				args.project._id,
				args.workflowRunId,
			);
			await ctx.db.patch(workflowRun._id, {
				status: "proof_completed" as const,
				proofStatus: args.payload.proofStatus,
				completedAt: args.createdAt,
				updatedAt: now,
			});
			return;
		}
		case "workflow.blocked": {
			const workflowRun = await requireWorkflowRunForEvent(
				ctx,
				args.project._id,
				args.workflowRunId,
			);
			await ctx.db.patch(workflowRun._id, {
				status: "blocked" as const,
				proofStatus: "blocked" as const,
				deliveryStatus: "blocked" as const,
				blockedReason: args.payload.blockedReason,
				completedAt: args.createdAt,
				updatedAt: now,
			});
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
		await requireWorkflowRun(ctx, args.project._id, args.workflowRunId);
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
		updatedAt: now,
	});

	return {
		...doctorPassRun,
		status: "sync_approved" as const,
		syncPreviewStatus: "approved" as const,
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
		findings: CodebaseFindingInput[];
	},
) {
	if (args.findings.length > MAX_SYNCED_FINDINGS_PER_RUN) {
		throw new ConvexError("Only Top 9 findings can be synced");
	}

	const clerkUserId = await requireExistingCodebaseProductAccess(ctx);
	await requireViewerWorkspaceProject(ctx, clerkUserId, args.projectId);
	const doctorPassRun = await requireDoctorPassRun(
		ctx,
		args.projectId,
		args.doctorPassRunId,
	);
	if (doctorPassRun.syncPreviewStatus !== "approved") {
		throw new ConvexError("Sync preview must be approved before findings sync");
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

	const [doctorPassRuns, workflowRuns] = await Promise.all([
		ctx.db
			.query("doctorPassRuns")
			.withIndex("by_project_id_and_started_at", (query) =>
				query.eq("projectId", project._id),
			)
			.order("desc")
			.take(20),
		ctx.db
			.query("workflowRuns")
			.withIndex("by_project_id_and_created_at", (query) =>
				query.eq("projectId", project._id),
			)
			.order("desc")
			.take(20),
	]);

	return {
		doctorPassRuns,
		workflowRuns,
	};
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
