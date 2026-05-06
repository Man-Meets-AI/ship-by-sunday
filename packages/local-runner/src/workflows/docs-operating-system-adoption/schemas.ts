import type {
	DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
	DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID,
	DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_VERSION,
	DOCS_OPERATING_SYSTEM_CANONICAL_SCRIPTS,
	DOCS_OPERATING_SYSTEM_MODULE_IDS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_VERSION,
} from "./manifest";

export type DocsOperatingSystemInstallProfile =
	typeof DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE;

export type DocsOperatingSystemModuleId =
	(typeof DOCS_OPERATING_SYSTEM_MODULE_IDS)[number];

export type DocsOperatingSystemCanonicalScript =
	(typeof DOCS_OPERATING_SYSTEM_CANONICAL_SCRIPTS)[number];

export type DocsOperatingSystemModuleStatus =
	| "already-present"
	| "installable"
	| "selected"
	| "skipped"
	| "blocked"
	| "conflict";

export type DocsOperatingSystemScriptOperationStatus =
	| "keep"
	| "add"
	| "blocked"
	| "conflict"
	| "rename-proposed";

export type DocsOperatingSystemDependencyOperationStatus =
	| "already-present"
	| "installable"
	| "blocked";

export type DocsOperatingSystemFileOperationStatus =
	| "already-present"
	| "installable"
	| "blocked";

export type DocsOperatingSystemOutOfScopeKind =
	| "runtime"
	| "worker-operating-state"
	| "worker-state"
	| "topology"
	| "ci-provider-setup"
	| "app-stack-command-wiring"
	| "broad-root-agent-rewrite";

export type DocsOperatingSystemModuleState = {
	moduleId: DocsOperatingSystemModuleId;
	status: DocsOperatingSystemModuleStatus;
	evidenceRefs: string[];
	requiredScriptNames: DocsOperatingSystemCanonicalScript[];
	reason: string;
};

export type DocsOperatingSystemScriptOperation = {
	scriptName: DocsOperatingSystemCanonicalScript;
	moduleIds: DocsOperatingSystemModuleId[];
	status: DocsOperatingSystemScriptOperationStatus;
	currentScriptRecognized: boolean;
	proposedTarget: "package.json#scripts";
	reason: string;
};

export type DocsOperatingSystemDependencyOperation = {
	packageName: "ship-by-sunday";
	dependencyType: "devDependency";
	status: DocsOperatingSystemDependencyOperationStatus;
	reason: string;
};

export type DocsOperatingSystemValidatorFileOperation = {
	targetRef: string;
	moduleIds: DocsOperatingSystemModuleId[];
	status: DocsOperatingSystemFileOperationStatus;
	reason: string;
};

export type DocsOperatingSystemConflict = {
	conflictId: string;
	surface: "package-script" | "validator-file" | "out-of-scope";
	targetRef: string;
	reason: string;
	nextApprovalRequired: boolean;
};

export type DocsOperatingSystemBlockedOperation = {
	operationId: string;
	surface: "package-script" | "dependency" | "validator-file" | "workflow";
	targetRef: string;
	reason: string;
	nextApprovalRequired: boolean;
};

export type DocsOperatingSystemOutOfScopeDetection = {
	kind: DocsOperatingSystemOutOfScopeKind;
	evidenceRefs: string[];
	reason: string;
};

export type DocsOperatingSystemInstallPlan = {
	schemaVersion: "docs-operating-system-install-plan.v1";
	workflowId: typeof DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID;
	workflowVersion: typeof DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_VERSION;
	installProfile: DocsOperatingSystemInstallProfile;
	packageManager: string;
	resolvedModules: DocsOperatingSystemModuleState[];
	packageScriptOperations: DocsOperatingSystemScriptOperation[];
	dependencyOperations: DocsOperatingSystemDependencyOperation[];
	validatorFileOperations: DocsOperatingSystemValidatorFileOperation[];
	conflicts: DocsOperatingSystemConflict[];
	blockedOperations: DocsOperatingSystemBlockedOperation[];
	outOfScopeDetections: DocsOperatingSystemOutOfScopeDetection[];
	proofCommands: readonly string[];
	rollbackNotes: string;
	privacyBoundary: {
		rawSourceIncluded: false;
		rawLogsIncluded: false;
		packageScriptBodiesIncluded: false;
		dependencyVersionsIncluded: false;
		localAbsolutePathsIncluded: false;
		codexTranscriptsIncluded: false;
	};
	createdAt: number;
};

export type DocsOperatingSystemManifest = {
	schemaVersion: "docs-operating-system-adoption-manifest.v1";
	workflowId: typeof DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID;
	workflowVersion: typeof DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_VERSION;
	installProfile: DocsOperatingSystemInstallProfile;
	phases: readonly string[];
	allowedTouchTargets: readonly string[];
	disallowedTouchTargets: readonly string[];
	proofCommands: readonly string[];
	localArtifactRefs: Record<string, string>;
	syncPolicySummary: string;
	rollbackNotes: string;
	performanceBudgets: Record<string, number>;
	createdAt: number;
};

export type DocsOperatingSystemProofCommandResult = {
	commandName: string;
	status: "passed" | "failed" | "blocked";
	exitCodeSummary: string;
};

export type DocsOperatingSystemPackagePatchOperation = {
	operationId: string;
	surface: "package-script" | "dependency" | "validator-file";
	targetRef: string;
	status: "added" | "kept";
	reason: string;
};

export type DocsOperatingSystemPackagePatchBlockedReason = {
	stage: string;
	reason: string;
	targetRef?: string;
};

export type DocsOperatingSystemPackagePatchSummary = {
	schemaVersion: "docs-operating-system-package-script-patching.v1";
	workflowId: typeof DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID;
	workflowVersion: typeof DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_VERSION;
	installProfile: DocsOperatingSystemInstallProfile;
	sourceInstallPlanRef: string;
	status: "applied" | "blocked";
	appliedOperations: DocsOperatingSystemPackagePatchOperation[];
	blockedReasons: DocsOperatingSystemPackagePatchBlockedReason[];
	touchedFileRefs: string[];
	privacyBoundary: {
		rawSourceIncluded: false;
		rawLogsIncluded: false;
		packageScriptBodiesIncluded: false;
		targetDependencyVersionsIncluded: false;
		localAbsolutePathsIncluded: false;
		codexTranscriptsIncluded: false;
	};
	createdAt: number;
};

export type DocsOperatingSystemPackageScriptPatchingManifest = {
	schemaVersion: "docs-operating-system-package-script-patching-manifest.v1";
	workflowId: typeof DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID;
	workflowVersion: typeof DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_VERSION;
	installProfile: DocsOperatingSystemInstallProfile;
	phases: readonly string[];
	allowedTouchTargets: readonly string[];
	disallowedTouchTargets: readonly string[];
	proofCommands: readonly string[];
	localArtifactRefs: Record<string, string>;
	syncPolicySummary: string;
	rollbackNotes: string;
	createdAt: number;
};
