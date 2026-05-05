export const DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION = "doctor-pass-local.v1";
export const TOP_NINE_SCHEMA_VERSION = "repo-doctor-top-nine.v1";

export type DoctorProbeStatus = "completed" | "blocked" | "failed";

export type DoctorProbeResult = {
	probeId: string;
	status: DoctorProbeStatus;
	durationMs: number;
	sensitivity: "local_only" | "sync_safe";
	summary: string;
	blockedReason?: string;
	artifactRefs: string[];
};

export type EvidenceRef =
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
	  };

export type DoctorFinding = {
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
	evidenceRefs: EvidenceRef[];
	blockedReason?: string;
	syncSensitivity: "low" | "medium" | "high";
	localReportRef: string;
};

export type TopNineOutput = {
	schemaVersion: typeof TOP_NINE_SCHEMA_VERSION;
	findings: DoctorFinding[];
	summary: string;
};

export type DoctorPassRunArtifacts = {
	runId: string;
	doctorPassRunId: string | null;
	reportDirectory: string;
	localReportRefPrefix: string;
	findings: DoctorFinding[];
	previewDigest: string | null;
	probes: DoctorProbeResult[];
	uploaded?: {
		syncedAt: number;
		insertedCount: number;
		patchedCount: number;
	};
};
