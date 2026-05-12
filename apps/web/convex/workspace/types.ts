import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export type WorkspaceQueryCtx = QueryCtx;
export type WorkspaceMutationCtx = MutationCtx;
export type WorkspaceReadCtx = QueryCtx | MutationCtx;

export type WorkspaceProjectDoc = Doc<"workspaceProjects">;
export type WorkspaceRunnerBindingDoc = Doc<"workspaceRunnerBindings">;
export type WorkspaceRepositoryBindingDoc = Doc<"workspaceRepositoryBindings">;
export type DoctorPassRunDoc = Doc<"doctorPassRuns">;
export type CodebaseFindingDoc = Doc<"codebaseFindings">;
export type WorkflowRunDoc = Doc<"workflowRuns">;
export type WorkspaceRunnerEventDoc = Doc<"workspaceRunnerEvents">;
export type ManagedGithubExecutionConsentDoc =
	Doc<"managedGithubExecutionConsents">;
export type ManagedGithubAuditEventDoc = Doc<"managedGithubAuditEvents">;

export type WorkspaceProjectId = Id<"workspaceProjects">;
export type WorkspaceRunnerBindingId = Id<"workspaceRunnerBindings">;
export type WorkspaceRepositoryBindingId = Id<"workspaceRepositoryBindings">;
export type DoctorPassRunId = Id<"doctorPassRuns">;
export type CodebaseFindingId = Id<"codebaseFindings">;
export type WorkflowRunId = Id<"workflowRuns">;
export type ManagedGithubExecutionConsentId =
	Id<"managedGithubExecutionConsents">;

export type SetupCheckStatus = "unknown" | "blocked" | "warning" | "ready";
export type WorkspaceRunnerMode = "daemon" | "one_shot";

export type WorkspaceRunnerEventType =
	| "runner.paired"
	| "runner.heartbeat"
	| "setup.check.started"
	| "setup.check.completed"
	| "worker.install.previewed"
	| "worker.install.completed"
	| "worker.install.blocked"
	| "doctor.stage.started"
	| "doctor.probe.completed"
	| "doctor.sync_preview.ready"
	| "doctor.findings.approved"
	| "workflow.approval.requested"
	| "workflow.claimed"
	| "workflow.started"
	| "workflow.proof.completed"
	| "workflow.blocked"
	| "runner.revoked";

export type WorkspaceRunnerEventPayload =
	| {
			eventType: "runner.paired";
			pairingStatus:
				| "waiting"
				| "runner_detected"
				| "verifying_machine"
				| "verifying_project"
				| "paired"
				| "revoked";
			runnerMode: WorkspaceRunnerMode;
			machineDisplayName?: string;
			runnerVersion?: string;
			repositoryDisplayName?: string;
	  }
	| {
			eventType: "runner.heartbeat";
			runnerMode: WorkspaceRunnerMode;
			status: "online" | "degraded";
			machineHealthStatus: SetupCheckStatus;
			projectHealthStatus: SetupCheckStatus;
	  }
	| {
			eventType: "setup.check.started";
			scope: "machine" | "project";
			checkKey: string;
			summary?: string;
	  }
	| {
			eventType: "setup.check.completed";
			scope: "machine" | "project";
			checkKey: string;
			status: SetupCheckStatus;
			summary: string;
			remediationAction?: string;
	  }
	| {
			eventType: "worker.install.previewed";
			outcome: "ready";
			status: "ready";
			summary: string;
			branch?: string;
			commitHash?: string;
			reportRef?: string;
			localProofRef?: string;
			createdRefs: string[];
			changedRefs: string[];
			proofCommandResults: WorkerInstallProofCommandResult[];
	  }
	| {
			eventType: "worker.install.completed";
			outcome: "installed";
			status: "installed";
			summary: string;
			branch?: string;
			commitHash?: string;
			reportRef?: string;
			localProofRef?: string;
			createdRefs: string[];
			changedRefs: string[];
			proofCommandResults: WorkerInstallProofCommandResult[];
	  }
	| {
			eventType: "worker.install.blocked";
			outcome: "blocked" | "failed" | "cancelled";
			status: "blocked" | "failed" | "cancelled";
			summary: string;
			branch?: string;
			commitHash?: string;
			reportRef?: string;
			localProofRef?: string;
			createdRefs: string[];
			changedRefs: string[];
			blockerIds: string[];
			blockerReasons: string[];
			proofCommandResults: WorkerInstallProofCommandResult[];
	  }
	| {
			eventType: "doctor.stage.started";
			stage:
				| "runner_connected"
				| "machine_setup_checked"
				| "project_setup_checked"
				| "passive_probes_running"
				| "codex_interpretation_running"
				| "sync_preview_ready"
				| "findings_ready";
	  }
	| {
			eventType: "doctor.probe.completed";
			probeId: string;
			status: "completed" | "blocked" | "failed";
			durationMs: number;
			sensitivity: "local_only" | "sync_safe";
			summary: string;
			blockedReason?: string;
	  }
	| {
			eventType: "doctor.sync_preview.ready";
			previewDigest: string;
			findingsCount: number;
			excludedArtifactCount: number;
			localReportRef: string;
			expiresAt?: number;
	  }
	| {
			eventType: "doctor.findings.approved";
			previewDigest: string;
			approvedFindingsCount: number;
	  }
	| {
			eventType: "workflow.approval.requested";
			workflowId: string;
			findingId?: string;
			requiredPermission:
				| "read_only"
				| "docs_write"
				| "workspace_write"
				| "network"
				| "provider_access"
				| "managed_github";
			summary: string;
	  }
	| {
			eventType: "workflow.claimed";
			workflowId: string;
			writeLeaseId: string;
			writeLeaseExpiresAt: number;
	  }
	| {
			eventType: "workflow.started";
			workflowId: string;
			branchName?: string;
			profileName?: string;
	  }
	| {
			eventType: "workflow.proof.completed";
			workflowId: string;
			writeLeaseId: string;
			proofStatus: "not_started" | "passed" | "failed" | "blocked";
			proofSummary: string;
			touchedFileRefs?: string[];
			createdArtifactRefs?: string[];
			proofCommandResults?: Array<{
				commandName: string;
				status: "passed" | "failed" | "blocked";
			}>;
			nextRecommendedWorkflowId?: string;
	  }
	| {
			eventType: "workflow.blocked";
			workflowId: string;
			writeLeaseId: string;
			blockedStage: string;
			blockedReason: string;
	  }
	| {
			eventType: "runner.revoked";
			reason?: string;
	  };

export type WorkerInstallProofCommandResult = {
	commandLabel: string;
	status: "passed" | "failed" | "blocked" | "skipped";
};

export type CodebaseFindingInput = {
	findingId: string;
	rank: number;
	status: "ready" | "blocked" | "needs_approval" | "running" | "done";
	title: string;
	category:
		| "source_truth"
		| "setup"
		| "proof"
		| "revenue_path"
		| "observability"
		| "ux_conversion"
		| "broken_app"
		| "performance"
		| "security"
		| "testing"
		| "other";
	severity: "critical" | "high" | "medium" | "low";
	confidence: number;
	buyerImpact: string;
	blastRadius: "none" | "low" | "medium" | "high";
	proofPath: string;
	proofability: "clear" | "partial" | "blocked";
	permissionRequired:
		| "read_only"
		| "docs_write"
		| "workspace_write"
		| "network"
		| "provider_access"
		| "managed_github";
	recommendedWorkflowId: string;
	whyThisNow: string;
	evidenceRefs: Array<
		| {
				kind: "file";
				repoRelativePath: string;
				lineStart?: number;
				lineEnd?: number;
				summary?: string;
		  }
		| {
				kind: "command";
				commandName: string;
				summary?: string;
		  }
		| {
				kind: "artifact";
				artifactId: string;
				localReportRef?: string;
				summary?: string;
		  }
		| {
				kind: "package";
				packageName: string;
				summary?: string;
		  }
	>;
	blockedReason?: string;
	syncSensitivity: "low" | "medium" | "high";
	localReportRef: string;
};
