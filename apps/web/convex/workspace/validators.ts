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

export const managedGithubConsentStatusValidator = v.union(
	v.literal("requested"),
	v.literal("approved"),
	v.literal("revoked"),
);

export const managedGithubAuditEventTypeValidator = v.union(
	v.literal("managed_github.requested"),
	v.literal("managed_github.revoked"),
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
	v.literal("paused"),
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

export const workflowProofCommandResultValidator = v.object({
	commandName: v.string(),
	status: v.union(
		v.literal("passed"),
		v.literal("failed"),
		v.literal("blocked"),
	),
});

export const workflowApprovalSourceValidator = v.union(
	v.literal("finding_detail"),
	v.literal("runner_cli"),
);

export const workflowDirtyStatePolicyValidator = v.union(
	v.literal("require_clean_worktree"),
	v.literal("checkpoint_required"),
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
	v.literal("workflow.claimed"),
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
		eventType: v.literal("workflow.claimed"),
		workflowId: v.string(),
		writeLeaseId: v.string(),
		writeLeaseExpiresAt: v.number(),
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
		writeLeaseId: v.string(),
		proofStatus: workflowProofStatusValidator,
		proofSummary: v.string(),
		touchedFileRefs: v.optional(v.array(v.string())),
		createdArtifactRefs: v.optional(v.array(v.string())),
		proofCommandResults: v.optional(
			v.array(workflowProofCommandResultValidator),
		),
		nextRecommendedWorkflowId: v.optional(v.string()),
	}),
	v.object({
		eventType: v.literal("workflow.blocked"),
		workflowId: v.string(),
		writeLeaseId: v.string(),
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
	localRunId: v.optional(v.string()),
	status: doctorPassRunStatusValidator,
	runnerMode: workspaceRunnerModeValidator,
	currentStage: v.optional(doctorPassStageValidator),
	syncPreviewStatus: syncPreviewStatusValidator,
	syncPreviewDigest: v.optional(v.string()),
	syncPreviewApprovedAt: v.optional(v.number()),
	syncPreviewApprovedByClerkUserId: v.optional(v.string()),
	syncPreviewApprovedDigest: v.optional(v.string()),
	syncPreviewApprovedSchemaVersion: v.optional(v.string()),
	syncPreviewApprovalSource: v.optional(v.string()),
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
	targetBranch: v.optional(v.string()),
	profileName: v.optional(v.string()),
	approvalSchemaVersion: v.optional(v.string()),
	approvedAt: v.optional(v.number()),
	approvedByClerkUserId: v.optional(v.string()),
	approvalSource: v.optional(workflowApprovalSourceValidator),
	writeLeaseId: v.optional(v.string()),
	writeLeaseExpiresAt: v.optional(v.number()),
	writeLeaseDurationMinutes: v.optional(v.number()),
	writeLeaseRenewalCount: v.optional(v.number()),
	dirtyStatePolicy: v.optional(workflowDirtyStatePolicyValidator),
	localWorkflowPacketRef: v.optional(v.string()),
	localProofRef: v.optional(v.string()),
	expectedOutputs: v.optional(v.array(v.string())),
	allowedTouchTargets: v.optional(v.array(v.string())),
	disallowedTouchTargets: v.optional(v.array(v.string())),
	proofCommands: v.optional(v.array(v.string())),
	proofCommandResults: v.optional(v.array(workflowProofCommandResultValidator)),
	syncPolicySummary: v.optional(v.string()),
	stopConditions: v.optional(v.array(v.string())),
	rollbackNotes: v.optional(v.string()),
	proofSummary: v.optional(v.string()),
	touchedFileRefs: v.optional(v.array(v.string())),
	createdArtifactRefs: v.optional(v.array(v.string())),
	nextRecommendedWorkflowId: v.optional(v.string()),
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

export const managedGithubRepositoryAccessValidator = v.object({
	provider: v.literal("github"),
	remoteOwner: v.string(),
	remoteName: v.string(),
	defaultBranch: v.optional(v.string()),
	accessMode: v.literal("selected_repository_only"),
});

export const managedGithubInstallationScopeValidator = v.object({
	repositorySelection: v.literal("selected_repository_only"),
	permissions: v.array(v.string()),
});

export const managedGithubStoragePolicyValidator = v.object({
	sourceCloneRetention: v.literal("ephemeral_until_delivery_or_revocation"),
	proofArtifactRetention: v.literal("structured_metadata_only"),
	secretStorage: v.literal("never_store_customer_secrets"),
});

export const managedGithubPrAuthorityValidator = v.object({
	branchCreation: v.literal("customer_approval_required"),
	pullRequestCreation: v.literal("customer_approval_required"),
	mergeAuthority: v.literal("never"),
	ciRerunAuthority: v.literal("customer_approval_required"),
});

export const managedGithubRawSourceVisibilityValidator = v.object({
	operatorVisibility: v.literal("assigned_concierge_only_after_consent"),
	rawSourceSharing: v.literal("disabled_until_explicit_share"),
	transcriptStorage: v.literal("disabled"),
});

export const managedGithubProofBoundaryValidator = v.object({
	proofCommands: v.literal("customer_approved_only"),
	ciCommands: v.literal("customer_approved_only"),
	syncedArtifacts: v.literal("proof_metadata_and_pr_refs_only"),
});

export const managedGithubConsentAcknowledgementValidator = v.object({
	repoAccess: v.literal(true),
	installationScope: v.literal(true),
	storagePolicy: v.literal(true),
	prAuthority: v.literal(true),
	auditLog: v.literal(true),
	revocation: v.literal(true),
	rawSourceVisibility: v.literal(true),
	proofBoundaries: v.literal(true),
});

export const managedGithubExecutionConsentFields = {
	projectId: v.id("workspaceProjects"),
	repositoryBindingId: v.id("workspaceRepositoryBindings"),
	status: managedGithubConsentStatusValidator,
	consentSchemaVersion: v.literal("managed-github-consent.v1"),
	repositoryAccess: managedGithubRepositoryAccessValidator,
	installationScope: managedGithubInstallationScopeValidator,
	storagePolicy: managedGithubStoragePolicyValidator,
	prAuthority: managedGithubPrAuthorityValidator,
	rawSourceVisibility: managedGithubRawSourceVisibilityValidator,
	proofBoundary: managedGithubProofBoundaryValidator,
	requestedByClerkUserId: v.string(),
	requestedAt: v.number(),
	approvedByClerkUserId: v.optional(v.string()),
	approvedAt: v.optional(v.number()),
	revokedByClerkUserId: v.optional(v.string()),
	revokedAt: v.optional(v.number()),
	revokeReason: v.optional(v.string()),
	createdAt: v.number(),
	updatedAt: v.number(),
};

export const managedGithubAuditEventFields = {
	projectId: v.id("workspaceProjects"),
	consentId: v.optional(v.id("managedGithubExecutionConsents")),
	eventType: managedGithubAuditEventTypeValidator,
	actorClerkUserId: v.string(),
	summary: v.string(),
	repositoryLabel: v.string(),
	createdAt: v.number(),
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

export const workspaceRunnerWorkflowApprovalValidator = v.object({
	workflowRunId: v.id("workflowRuns"),
	workflowId: v.string(),
	workflowVersion: v.string(),
	branchName: v.string(),
	profileName: v.string(),
	writeLeaseId: v.string(),
	writeLeaseExpiresAt: v.number(),
	writeLeaseDurationMinutes: v.number(),
	dirtyStatePolicy: workflowDirtyStatePolicyValidator,
	expectedOutputs: v.array(v.string()),
	allowedTouchTargets: v.array(v.string()),
	disallowedTouchTargets: v.array(v.string()),
	proofCommands: v.array(v.string()),
	syncPolicySummary: v.string(),
	stopConditions: v.array(v.string()),
	rollbackNotes: v.string(),
	localWorkflowPacketRef: v.string(),
	localProofRef: v.string(),
});

export const workspaceWorkerQueueStateValidator = v.object({
	project: v.union(workspaceProjectDocumentValidator, v.null()),
	activeRunner: v.union(
		workspaceRunnerBindingPublicDocumentValidator,
		v.null(),
	),
	workflowRuns: v.array(workflowRunDocumentValidator),
});

export const workspaceRunnerEventDocumentValidator = v.object({
	_id: v.id("workspaceRunnerEvents"),
	_creationTime: v.number(),
	...workspaceRunnerEventFields,
});

export const managedGithubExecutionConsentDocumentValidator = v.object({
	_id: v.id("managedGithubExecutionConsents"),
	_creationTime: v.number(),
	...managedGithubExecutionConsentFields,
});

export const managedGithubAuditEventDocumentValidator = v.object({
	_id: v.id("managedGithubAuditEvents"),
	_creationTime: v.number(),
	...managedGithubAuditEventFields,
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

export const managedGithubExecutionStateValidator = v.object({
	consent: v.union(managedGithubExecutionConsentDocumentValidator, v.null()),
	auditEvents: v.array(managedGithubAuditEventDocumentValidator),
});
