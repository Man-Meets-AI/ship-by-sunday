import type {
	DOCS_SPINE_ADOPTION_WORKFLOW_ID,
	DOCS_SPINE_ADOPTION_WORKFLOW_VERSION,
} from "./manifest";
import type { JsonValue } from "../../core/json-value";

export type DocsSpineAdoptionProofCommandResult = {
	commandName: string;
	status: "passed" | "failed" | "blocked";
	exitCodeSummary: string;
};

export type DocsSpineRepoFacts = {
	schemaVersion: "docs-spine-repo-facts.v1";
	workflowId: typeof DOCS_SPINE_ADOPTION_WORKFLOW_ID;
	workflowVersion: typeof DOCS_SPINE_ADOPTION_WORKFLOW_VERSION;
	repositoryShape: {
		packageManager: string;
		packageScripts: string[];
		workspaceGlobs: string[];
		workspacePackageRefs: string[];
		dependencyNames: string[];
	};
	instructionSurface: {
		agentInstructionRefs: string[];
		assistantShimRefs: string[];
		secondaryInstructionRefs: string[];
		ignoredInstructionRefs: string[];
		skillRefs: string[];
	};
	docsSurface: {
		docsRefs: string[];
		programRefs: string[];
		execPlanRefs: string[];
		promptRefs: string[];
		specRefs: string[];
		generatedRefs: string[];
	};
	validationSurface: {
		validationRefs: string[];
		ciRefs: string[];
		releaseRefs: string[];
	};
	blockedFacts: Array<{
		factId: string;
		reason: string;
		nextApprovalRequired: boolean;
	}>;
	createdAt: number;
};

export type DocsSpineScannerArtifact = {
	repoRelativePath: string;
	value: JsonValue;
};

export type DocsSpineSynthesisArtifact = {
	repoRelativePath: string;
	value: JsonValue;
};

export type DocsSpineDraftFamily =
	| "docs-index"
	| "program-packet"
	| "exec-plan"
	| "agent-instructions"
	| "prompt-assets"
	| "validation-proof"
	| "quality-score"
	| "parity-checklist";

export type DocsSpineAdoptionManifest = {
	schemaVersion: "docs-spine-adoption-manifest.v1";
	workflowId: typeof DOCS_SPINE_ADOPTION_WORKFLOW_ID;
	workflowVersion: typeof DOCS_SPINE_ADOPTION_WORKFLOW_VERSION;
	phases: readonly string[];
	allowedTouchTargets: readonly string[];
	disallowedTouchTargets: readonly string[];
	proofCommands: readonly string[];
	localArtifactRefs: Record<string, string>;
	syncPolicySummary: string;
	rollbackNotes: string;
	performanceBudgets: Record<string, number>;
	reservedArtifactRefs: {
		semgrepOutput: string;
		astOutput: string;
	};
	createdAt: number;
};
