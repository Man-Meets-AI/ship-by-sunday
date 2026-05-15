import type { JsonObject } from "../../core/json-value";
import {
	WORKER_CODEX_PROJECT_WRITE_PROFILE,
	WORKER_FOUNDATIONS_BUNDLE_VERSION,
	WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID,
	WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION,
} from "./manifest";

export type WorkerInstallOptions = {
	dryRun: boolean;
	json: boolean;
	noCommit: boolean;
	noKickoff: boolean;
	repoPath?: string;
	yes: boolean;
};

export type WorkerInstallResult = {
	outcome: "ready" | "installed" | "blocked" | "failed" | "cancelled";
	exitCode: 0 | 1 | 2 | 130;
	summary: string;
	report?: WorkerInstallReport;
};

export type WorkerInstallReport = {
	schemaVersion: "worker-foundations-install-result.v1";
	workflowId: typeof WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID;
	workflowVersion: typeof WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION;
	outcome: WorkerInstallResult["outcome"];
	workerBundleVersion: string;
	branch: string | null;
	commit: string | null;
	dryRun: boolean;
	phases: WorkerInstallPhase[];
	plan: WorkerInstallPlan;
	proof: WorkerProofCommandStatus[];
	createdRefs: string[];
	changedRefs: string[];
	reportRef: string | null;
	localProofRef: string | null;
	kickoff: WorkerKickoffStatus;
	privacyBoundary: WorkerPrivacyBoundary;
};

export type WorkerInstallPhase = {
	name: string;
	status: "ready" | "planned" | "applied" | "blocked" | "failed" | "skipped";
	reason?: string;
};

export type WorkerInstallPlan = {
	schemaVersion: "worker-foundations-install-plan.v1";
	workflowId: typeof WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID;
	workflowVersion: typeof WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION;
	workerBundleVersion: typeof WORKER_FOUNDATIONS_BUNDLE_VERSION;
	packageManager: RootPackageManager;
	toolchain: WorkerNodeRuntimePlan;
	operations: WorkerInstallOperation[];
	blockers: WorkerInstallBlocker[];
	proofCommands: string[];
	privacyBoundary: WorkerPrivacyBoundary;
};

export type WorkerNodeRuntimePlan = {
	runtime: "node";
	status: "available" | "blocked";
	origin: "path" | "missing";
	targetRef: "system-node";
};

export type WorkerInstallOperation = {
	operationId: string;
	surface: string;
	targetRef: string;
	status: "add" | "update-managed" | "keep" | "planned" | "blocked";
	reason: string;
};

export type WorkerInstallBlocker = {
	blockerId: string;
	targetRef?: string;
	reason: string;
};

export type WorkerProofCommandStatus = {
	command: string;
	status: "passed" | "failed" | "skipped";
};

export type WorkerKickoffStatus = {
	status: "started" | "skipped" | "blocked";
	promptRef: string;
	codexProfile: typeof WORKER_CODEX_PROJECT_WRITE_PROFILE;
};

export type WorkerPrivacyBoundary = {
	rawSourceIncluded: false;
	rawLogsIncluded: false;
	packageScriptBodiesIncluded: false;
	dependencyVersionsIncluded: false;
	localAbsolutePathsIncluded: false;
	codexTranscriptsIncluded: false;
};

export type WorkerInstallContext = {
	env: NodeJS.ProcessEnv;
	now: number;
	options: WorkerInstallOptions;
	repositoryRoot: string;
	workerHome: string;
	runId: string;
};

export type FinishResultInput = {
	outcome: WorkerInstallResult["outcome"];
	exitCode: WorkerInstallResult["exitCode"];
	summary: string;
	context: WorkerInstallContext;
	plan: WorkerInstallPlan;
	proof: WorkerProofCommandStatus[];
	createdRefs: string[];
	changedRefs: string[];
	branch: string | null;
	commit: string | null;
	localProofRef: string | null;
	reportRef: string | null;
	kickoff: WorkerKickoffStatus;
};

export type TargetRepoInspection = {
	packageManager: RootPackageManager;
	packageJsonText: string;
	packageJson: JsonObject;
	packageJsonExists: boolean;
	gitClean: boolean;
	currentBranch: string | null;
	installBranchExists: boolean;
	licenseStatus: WorkerLicenseStatus;
	nodeRuntime: WorkerNodeRuntimePlan;
	codexStatus: "ready" | "blocked" | "skipped";
	codexProfileStatus: "ready" | "planned" | "blocked" | "skipped";
	blockers: WorkerInstallBlocker[];
};

export type WorkerLicenseStatus =
	| { status: "active" }
	| { reason: string; status: "missing" | "invalid" };

export type WorkerLicenseFile = {
	accountId?: string;
	expires_at?: string;
	issued_at?: string;
	licenseSignature: string;
	machineCredential: string;
	machineId?: string;
	schemaVersion: "shipbysunday-worker-license.v1";
	status: "active";
};

export type WorkerActivationStartResponse = {
	deviceCode: string;
	expiresAt: number;
	intervalMs: number;
	userCode: string;
	verificationUrl: string;
	verificationUrlComplete?: string;
};

export type WorkerActivationPollResponse =
	| { status: "pending" }
	| { reason: string; status: "denied" | "expired" }
	| { license: WorkerLicenseFile; status: "approved" };

export type WorkerLicenseActivationResult =
	| { status: "activated" }
	| { reason: string; status: "blocked" | "failed" };

export type ApplyResult = {
	createdRefs: string[];
	changedRefs: string[];
};

export type RootPackageManager = "npm" | "pnpm" | "yarn";

export type ManagedFileTemplate = {
	content: string;
	executable?: boolean;
	managedSection?: boolean;
	preserveIfExists?: boolean;
	targetRef: string;
};
