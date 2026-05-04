import { v } from "convex/values";

export const workspaceFulfillmentTrackValidator = v.literal(
	"existing_codebase_doctor",
);

export const workspaceProjectStatusValidator = v.union(
	v.literal("active"),
	v.literal("deleted"),
);

export const workspaceDefaultOpenDestinationValidator = v.union(
	v.literal("cursor"),
	v.literal("vscode"),
	v.literal("terminal"),
	v.literal("none"),
);

export const workspaceSyncPolicyValidator = v.object({
	rawSource: v.literal("disabled"),
	rawTerminalLogs: v.literal("disabled"),
	codexTranscripts: v.literal("disabled"),
	screenshots: v.literal("disabled"),
	structuredFindings: v.literal("approval_required"),
});

export const setupCheckStatusValidator = v.union(
	v.literal("unknown"),
	v.literal("blocked"),
	v.literal("warning"),
	v.literal("ready"),
);

export const workspaceRunnerBindingStatusValidator = v.union(
	v.literal("pairing"),
	v.literal("paired"),
	v.literal("revoked"),
);

export const workspaceRunnerPairingStatusValidator = v.union(
	v.literal("waiting"),
	v.literal("runner_detected"),
	v.literal("verifying_machine"),
	v.literal("verifying_project"),
	v.literal("paired"),
	v.literal("revoked"),
);

export const workspaceRunnerModeValidator = v.union(
	v.literal("daemon"),
	v.literal("one_shot"),
);

export const workspaceRepositoryBindingStatusValidator = v.union(
	v.literal("active"),
	v.literal("deleted"),
);

export const workspaceRepositoryProviderValidator = v.union(
	v.literal("github"),
	v.literal("gitlab"),
	v.literal("bitbucket"),
	v.literal("other"),
	v.literal("unknown"),
);

export const packageManagerValidator = v.union(
	v.literal("bun"),
	v.literal("npm"),
	v.literal("pnpm"),
	v.literal("yarn"),
	v.literal("unknown"),
);

export const doctorPassRunStatusValidator = v.union(
	v.literal("queued"),
	v.literal("running"),
	v.literal("sync_preview_ready"),
	v.literal("sync_approved"),
	v.literal("findings_uploaded"),
	v.literal("blocked"),
	v.literal("failed"),
	v.literal("canceled"),
	v.literal("deleted"),
);

export const syncPreviewStatusValidator = v.union(
	v.literal("not_ready"),
	v.literal("ready"),
	v.literal("approved"),
	v.literal("rejected"),
	v.literal("expired"),
	v.literal("uploaded"),
);

export const doctorPassStageValidator = v.union(
	v.literal("runner_connected"),
	v.literal("machine_setup_checked"),
	v.literal("project_setup_checked"),
	v.literal("passive_probes_running"),
	v.literal("codex_interpretation_running"),
	v.literal("sync_preview_ready"),
	v.literal("findings_ready"),
);

export const codebaseFindingStatusValidator = v.union(
	v.literal("ready"),
	v.literal("blocked"),
	v.literal("needs_approval"),
	v.literal("running"),
	v.literal("done"),
	v.literal("deleted"),
);

export const codebaseFindingCategoryValidator = v.union(
	v.literal("source_truth"),
	v.literal("setup"),
	v.literal("proof"),
	v.literal("revenue_path"),
	v.literal("observability"),
	v.literal("ux_conversion"),
	v.literal("broken_app"),
	v.literal("performance"),
	v.literal("security"),
	v.literal("testing"),
	v.literal("other"),
);

export const codebaseFindingSeverityValidator = v.union(
	v.literal("critical"),
	v.literal("high"),
	v.literal("medium"),
	v.literal("low"),
);

export const blastRadiusValidator = v.union(
	v.literal("none"),
	v.literal("low"),
	v.literal("medium"),
	v.literal("high"),
);

export const permissionRequiredValidator = v.union(
	v.literal("read_only"),
	v.literal("docs_write"),
	v.literal("workspace_write"),
	v.literal("network"),
	v.literal("provider_access"),
	v.literal("managed_github"),
);

export const proofabilityValidator = v.union(
	v.literal("clear"),
	v.literal("partial"),
	v.literal("blocked"),
);

export const syncSensitivityValidator = v.union(
	v.literal("low"),
	v.literal("medium"),
	v.literal("high"),
);

export const evidenceRefValidator = v.union(
	v.object({
		kind: v.literal("file"),
		repoRelativePath: v.string(),
		lineStart: v.optional(v.number()),
		lineEnd: v.optional(v.number()),
		summary: v.optional(v.string()),
	}),
	v.object({
		kind: v.literal("command"),
		commandName: v.string(),
		summary: v.optional(v.string()),
	}),
	v.object({
		kind: v.literal("artifact"),
		artifactId: v.string(),
		localReportRef: v.optional(v.string()),
		summary: v.optional(v.string()),
	}),
	v.object({
		kind: v.literal("package"),
		packageName: v.string(),
		summary: v.optional(v.string()),
	}),
);

export const workflowRunStatusValidator = v.union(
	v.literal("approval_requested"),
	v.literal("approved"),
	v.literal("running"),
	v.literal("proof_completed"),
	v.literal("blocked"),
	v.literal("canceled"),
	v.literal("deleted"),
);

export const workflowProofStatusValidator = v.union(
	v.literal("not_started"),
	v.literal("passed"),
	v.literal("failed"),
	v.literal("blocked"),
);

export const workflowDeliveryStatusValidator = v.union(
	v.literal("not_started"),
	v.literal("local_only"),
	v.literal("pr_requested"),
	v.literal("pr_opened"),
	v.literal("blocked"),
);

export const workspaceRunnerEventSchemaVersionValidator = v.literal(
	"workspace.runner-event.v1",
);

export const workspaceRunnerEventTypeValidator = v.union(
	v.literal("runner.paired"),
	v.literal("runner.heartbeat"),
	v.literal("setup.check.started"),
	v.literal("setup.check.completed"),
	v.literal("doctor.stage.started"),
	v.literal("doctor.probe.completed"),
	v.literal("doctor.sync_preview.ready"),
	v.literal("doctor.findings.approved"),
	v.literal("workflow.approval.requested"),
	v.literal("workflow.started"),
	v.literal("workflow.proof.completed"),
	v.literal("workflow.blocked"),
	v.literal("runner.revoked"),
);

export const setupCheckScopeValidator = v.union(
	v.literal("machine"),
	v.literal("project"),
);

export const probeSensitivityValidator = v.union(
	v.literal("local_only"),
	v.literal("sync_safe"),
);

export const probeStatusValidator = v.union(
	v.literal("completed"),
	v.literal("blocked"),
	v.literal("failed"),
);

export const workspaceRunnerEventPayloadValidator = v.union(
	v.object({
		eventType: v.literal("runner.paired"),
		pairingStatus: workspaceRunnerPairingStatusValidator,
		runnerMode: workspaceRunnerModeValidator,
		machineDisplayName: v.optional(v.string()),
		runnerVersion: v.optional(v.string()),
	}),
	v.object({
		eventType: v.literal("runner.heartbeat"),
		runnerMode: workspaceRunnerModeValidator,
		status: v.union(v.literal("online"), v.literal("degraded")),
		machineHealthStatus: setupCheckStatusValidator,
		projectHealthStatus: setupCheckStatusValidator,
	}),
	v.object({
		eventType: v.literal("setup.check.started"),
		scope: setupCheckScopeValidator,
		checkKey: v.string(),
		summary: v.optional(v.string()),
	}),
	v.object({
		eventType: v.literal("setup.check.completed"),
		scope: setupCheckScopeValidator,
		checkKey: v.string(),
		status: setupCheckStatusValidator,
		summary: v.string(),
		remediationAction: v.optional(v.string()),
	}),
	v.object({
		eventType: v.literal("doctor.stage.started"),
		stage: doctorPassStageValidator,
	}),
	v.object({
		eventType: v.literal("doctor.probe.completed"),
		probeId: v.string(),
		status: probeStatusValidator,
		durationMs: v.number(),
		sensitivity: probeSensitivityValidator,
		summary: v.string(),
		blockedReason: v.optional(v.string()),
	}),
	v.object({
		eventType: v.literal("doctor.sync_preview.ready"),
		previewDigest: v.string(),
		findingsCount: v.number(),
		excludedArtifactCount: v.number(),
		localReportRef: v.string(),
		expiresAt: v.optional(v.number()),
	}),
	v.object({
		eventType: v.literal("doctor.findings.approved"),
		previewDigest: v.string(),
		approvedFindingsCount: v.number(),
	}),
	v.object({
		eventType: v.literal("workflow.approval.requested"),
		workflowId: v.string(),
		findingId: v.optional(v.string()),
		requiredPermission: permissionRequiredValidator,
		summary: v.string(),
	}),
	v.object({
		eventType: v.literal("workflow.started"),
		workflowId: v.string(),
		branchName: v.optional(v.string()),
		profileName: v.optional(v.string()),
	}),
	v.object({
		eventType: v.literal("workflow.proof.completed"),
		workflowId: v.string(),
		proofStatus: workflowProofStatusValidator,
		proofSummary: v.string(),
	}),
	v.object({
		eventType: v.literal("workflow.blocked"),
		workflowId: v.string(),
		blockedStage: v.string(),
		blockedReason: v.string(),
	}),
	v.object({
		eventType: v.literal("runner.revoked"),
		reason: v.optional(v.string()),
	}),
);

export const workspaceProjectFields = {
	clerkUserId: v.string(),
	displayName: v.string(),
	fulfillmentTrack: workspaceFulfillmentTrackValidator,
	status: workspaceProjectStatusValidator,
	defaultOpenDestination: workspaceDefaultOpenDestinationValidator,
	syncPolicy: workspaceSyncPolicyValidator,
	machineSetupStatus: setupCheckStatusValidator,
	projectSetupStatus: setupCheckStatusValidator,
	createdAt: v.number(),
	updatedAt: v.number(),
	deletedAt: v.optional(v.number()),
};

export const workspaceRunnerBindingFields = {
	projectId: v.id("workspaceProjects"),
	status: workspaceRunnerBindingStatusValidator,
	pairingStatus: workspaceRunnerPairingStatusValidator,
	runnerMode: workspaceRunnerModeValidator,
	runnerLabel: v.string(),
	pairingToken: v.optional(v.string()),
	pairingTokenIssuedAt: v.optional(v.number()),
	pairingTokenExpiresAt: v.optional(v.number()),
	pairingTokenCanceledAt: v.optional(v.number()),
	runnerCredentialHash: v.optional(v.string()),
	machineDisplayName: v.optional(v.string()),
	runnerVersion: v.optional(v.string()),
	machineHealthStatus: setupCheckStatusValidator,
	projectHealthStatus: setupCheckStatusValidator,
	pairedAt: v.optional(v.number()),
	lastHeartbeatAt: v.optional(v.number()),
	lastEventAt: v.optional(v.number()),
	createdAt: v.number(),
	updatedAt: v.number(),
	revokedAt: v.optional(v.number()),
};

export const workspaceRunnerBindingPublicFields = {
	projectId: v.id("workspaceProjects"),
	status: workspaceRunnerBindingStatusValidator,
	pairingStatus: workspaceRunnerPairingStatusValidator,
	runnerMode: workspaceRunnerModeValidator,
	runnerLabel: v.string(),
	pairingToken: v.optional(v.string()),
	pairingTokenIssuedAt: v.optional(v.number()),
	pairingTokenExpiresAt: v.optional(v.number()),
	pairingTokenCanceledAt: v.optional(v.number()),
	machineDisplayName: v.optional(v.string()),
	runnerVersion: v.optional(v.string()),
	machineHealthStatus: setupCheckStatusValidator,
	projectHealthStatus: setupCheckStatusValidator,
	pairedAt: v.optional(v.number()),
	lastHeartbeatAt: v.optional(v.number()),
	lastEventAt: v.optional(v.number()),
	createdAt: v.number(),
	updatedAt: v.number(),
	revokedAt: v.optional(v.number()),
};

export const workspaceRepositoryBindingFields = {
	projectId: v.id("workspaceProjects"),
	runnerId: v.optional(v.id("workspaceRunnerBindings")),
	status: workspaceRepositoryBindingStatusValidator,
	displayName: v.string(),
	provider: workspaceRepositoryProviderValidator,
	remoteHost: v.optional(v.string()),
	remoteOwner: v.optional(v.string()),
	remoteName: v.optional(v.string()),
	defaultBranch: v.optional(v.string()),
	packageManager: v.optional(packageManagerValidator),
	createdAt: v.number(),
	updatedAt: v.number(),
	deletedAt: v.optional(v.number()),
};

export const doctorPassRunFields = {
	projectId: v.id("workspaceProjects"),
	runnerId: v.optional(v.id("workspaceRunnerBindings")),
	repositoryBindingId: v.optional(v.id("workspaceRepositoryBindings")),
	status: doctorPassRunStatusValidator,
	runnerMode: workspaceRunnerModeValidator,
	currentStage: v.optional(doctorPassStageValidator),
	syncPreviewStatus: syncPreviewStatusValidator,
	syncPreviewDigest: v.optional(v.string()),
	syncPreviewFindingsCount: v.optional(v.number()),
	excludedArtifactCount: v.optional(v.number()),
	findingsCount: v.optional(v.number()),
	localReportRef: v.optional(v.string()),
	blockedReason: v.optional(v.string()),
	startedAt: v.number(),
	completedAt: v.optional(v.number()),
	createdAt: v.number(),
	updatedAt: v.number(),
	deletedAt: v.optional(v.number()),
};

export const codebaseFindingFields = {
	projectId: v.id("workspaceProjects"),
	doctorPassRunId: v.id("doctorPassRuns"),
	repositoryBindingId: v.optional(v.id("workspaceRepositoryBindings")),
	findingId: v.string(),
	rank: v.number(),
	status: codebaseFindingStatusValidator,
	title: v.string(),
	category: codebaseFindingCategoryValidator,
	severity: codebaseFindingSeverityValidator,
	confidence: v.number(),
	buyerImpact: v.string(),
	blastRadius: blastRadiusValidator,
	proofPath: v.string(),
	proofability: proofabilityValidator,
	permissionRequired: permissionRequiredValidator,
	recommendedWorkflowId: v.string(),
	whyThisNow: v.string(),
	evidenceRefs: v.array(evidenceRefValidator),
	blockedReason: v.optional(v.string()),
	syncSensitivity: syncSensitivityValidator,
	localReportRef: v.string(),
	createdAt: v.number(),
	updatedAt: v.number(),
	deletedAt: v.optional(v.number()),
};

export const codebaseFindingInputValidator = v.object({
	findingId: v.string(),
	rank: v.number(),
	status: v.union(
		v.literal("ready"),
		v.literal("blocked"),
		v.literal("needs_approval"),
		v.literal("running"),
		v.literal("done"),
	),
	title: v.string(),
	category: codebaseFindingCategoryValidator,
	severity: codebaseFindingSeverityValidator,
	confidence: v.number(),
	buyerImpact: v.string(),
	blastRadius: blastRadiusValidator,
	proofPath: v.string(),
	proofability: proofabilityValidator,
	permissionRequired: permissionRequiredValidator,
	recommendedWorkflowId: v.string(),
	whyThisNow: v.string(),
	evidenceRefs: v.array(evidenceRefValidator),
	blockedReason: v.optional(v.string()),
	syncSensitivity: syncSensitivityValidator,
	localReportRef: v.string(),
});

export const workflowRunFields = {
	projectId: v.id("workspaceProjects"),
	findingDocumentId: v.optional(v.id("codebaseFindings")),
	runnerId: v.optional(v.id("workspaceRunnerBindings")),
	workflowId: v.string(),
	workflowVersion: v.string(),
	status: workflowRunStatusValidator,
	proofStatus: workflowProofStatusValidator,
	deliveryStatus: workflowDeliveryStatusValidator,
	branchName: v.optional(v.string()),
	profileName: v.optional(v.string()),
	blockedReason: v.optional(v.string()),
	startedAt: v.optional(v.number()),
	completedAt: v.optional(v.number()),
	createdAt: v.number(),
	updatedAt: v.number(),
	deletedAt: v.optional(v.number()),
};

export const workspaceRunnerEventFields = {
	eventId: v.string(),
	projectId: v.id("workspaceProjects"),
	runnerId: v.id("workspaceRunnerBindings"),
	doctorPassRunId: v.optional(v.id("doctorPassRuns")),
	workflowRunId: v.optional(v.id("workflowRuns")),
	eventType: workspaceRunnerEventTypeValidator,
	schemaVersion: workspaceRunnerEventSchemaVersionValidator,
	createdAt: v.number(),
	receivedAt: v.number(),
	payload: workspaceRunnerEventPayloadValidator,
};

export const workspaceProjectDocumentValidator = v.object({
	_id: v.id("workspaceProjects"),
	_creationTime: v.number(),
	...workspaceProjectFields,
});

export const workspaceRunnerBindingDocumentValidator = v.object({
	_id: v.id("workspaceRunnerBindings"),
	_creationTime: v.number(),
	...workspaceRunnerBindingFields,
});

export const workspaceRunnerBindingPublicDocumentValidator = v.object({
	_id: v.id("workspaceRunnerBindings"),
	_creationTime: v.number(),
	...workspaceRunnerBindingPublicFields,
});

export const workspaceRepositoryBindingDocumentValidator = v.object({
	_id: v.id("workspaceRepositoryBindings"),
	_creationTime: v.number(),
	...workspaceRepositoryBindingFields,
});

export const doctorPassRunDocumentValidator = v.object({
	_id: v.id("doctorPassRuns"),
	_creationTime: v.number(),
	...doctorPassRunFields,
});

export const codebaseFindingDocumentValidator = v.object({
	_id: v.id("codebaseFindings"),
	_creationTime: v.number(),
	...codebaseFindingFields,
});

export const workflowRunDocumentValidator = v.object({
	_id: v.id("workflowRuns"),
	_creationTime: v.number(),
	...workflowRunFields,
});

export const workspaceRunnerEventDocumentValidator = v.object({
	_id: v.id("workspaceRunnerEvents"),
	_creationTime: v.number(),
	...workspaceRunnerEventFields,
});

export const workspaceProjectStateValidator = v.object({
	project: v.union(workspaceProjectDocumentValidator, v.null()),
	runnerBindings: v.array(workspaceRunnerBindingPublicDocumentValidator),
	repositoryBinding: v.union(
		workspaceRepositoryBindingDocumentValidator,
		v.null(),
	),
	latestDoctorPassRun: v.union(doctorPassRunDocumentValidator, v.null()),
	latestWorkflowRun: v.union(workflowRunDocumentValidator, v.null()),
});

export const workspaceSetupPairingCommandValidator = v.object({
	runnerId: v.id("workspaceRunnerBindings"),
	token: v.string(),
	tokenExpiresAt: v.number(),
	primaryCommand: v.string(),
	fallbackCommand: v.string(),
});

export const workspaceSetupStateValidator = v.object({
	project: v.union(workspaceProjectDocumentValidator, v.null()),
	runnerBindings: v.array(workspaceRunnerBindingPublicDocumentValidator),
	activeRunner: v.union(
		workspaceRunnerBindingPublicDocumentValidator,
		v.null(),
	),
	repositoryBinding: v.union(
		workspaceRepositoryBindingDocumentValidator,
		v.null(),
	),
	latestDoctorPassRun: v.union(doctorPassRunDocumentValidator, v.null()),
	setupEvents: v.array(workspaceRunnerEventDocumentValidator),
	pairingCommand: v.union(workspaceSetupPairingCommandValidator, v.null()),
});

export const workspaceHeartbeatStateValidator = v.object({
	project: v.union(workspaceProjectDocumentValidator, v.null()),
	activeRunner: v.union(
		workspaceRunnerBindingPublicDocumentValidator,
		v.null(),
	),
});

export const workspaceRunHistoryValidator = v.object({
	doctorPassRuns: v.array(doctorPassRunDocumentValidator),
	workflowRuns: v.array(workflowRunDocumentValidator),
});

export const workspaceSyncPreviewStateValidator = v.object({
	doctorPassRun: v.union(doctorPassRunDocumentValidator, v.null()),
});

export const workspaceRunnerEventIngestResultValidator = v.object({
	eventId: v.string(),
	inserted: v.boolean(),
	eventDocumentId: v.id("workspaceRunnerEvents"),
});

export const workspaceCreateOrLoadResultValidator = v.object({
	project: workspaceProjectDocumentValidator,
	created: v.boolean(),
});

export const workspaceDeleteMarkerResultValidator = v.object({
	markedAt: v.number(),
	markedCount: v.number(),
});

export const workspaceFindingsSyncResultValidator = v.object({
	syncedAt: v.number(),
	insertedCount: v.number(),
	patchedCount: v.number(),
});
