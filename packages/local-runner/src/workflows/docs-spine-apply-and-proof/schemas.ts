import type {
	DOCS_SPINE_APPLY_WORKFLOW_ID,
	DOCS_SPINE_APPLY_WORKFLOW_VERSION,
} from "./manifest";

export type DocsSpineApplyProofCommandResult = {
	commandName: string;
	status: "passed" | "failed" | "blocked";
	exitCodeSummary: string;
};

export type DocsSpineApplyReadyFile = {
	targetRef: string;
	markdown: string;
	sourceArtifactRef: string;
	draftStatus: string | null;
	draftBlockedReasons: string[];
};

export type DocsSpineApplySummary = {
	schemaVersion: "docs-spine-apply-summary.v1";
	workflowId: typeof DOCS_SPINE_APPLY_WORKFLOW_ID;
	workflowVersion: typeof DOCS_SPINE_APPLY_WORKFLOW_VERSION;
	status: "applied" | "blocked";
	appliedFileRefs: string[];
	blockedReasons: string[];
	sourceArtifactRefs: string[];
	createdAt: number;
};
