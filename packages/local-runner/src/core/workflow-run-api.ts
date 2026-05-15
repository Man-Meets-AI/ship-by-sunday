import { Context, Effect, Layer } from "effect";

import type { RunnerCredential } from "./local-runner-home";
import type { LocalProjectState } from "./local-project-state";
import {
	normalizeLocalRunnerEffectError,
	runLocalRunnerEffect,
} from "../effect/runtime";
import {
	DOCS_SPINE_ADOPTION_ALLOWED_TOUCH_TARGETS,
	DOCS_SPINE_ADOPTION_DISALLOWED_TOUCH_TARGETS,
	DOCS_SPINE_ADOPTION_EXPECTED_OUTPUTS,
	DOCS_SPINE_ADOPTION_PROOF_COMMANDS,
	DOCS_SPINE_ADOPTION_ROLLBACK_NOTES,
	DOCS_SPINE_ADOPTION_STOP_CONDITIONS,
	DOCS_SPINE_ADOPTION_SYNC_POLICY_SUMMARY,
	DOCS_SPINE_ADOPTION_WORKFLOW_ID,
	DOCS_SPINE_ADOPTION_WORKFLOW_VERSION,
} from "../workflows/docs-spine-adoption/manifest";
import {
	DOCS_SPINE_APPLY_ALLOWED_TOUCH_TARGETS,
	DOCS_SPINE_APPLY_DISALLOWED_TOUCH_TARGETS,
	DOCS_SPINE_APPLY_EXPECTED_OUTPUTS,
	DOCS_SPINE_APPLY_PROOF_COMMANDS,
	DOCS_SPINE_APPLY_ROLLBACK_NOTES,
	DOCS_SPINE_APPLY_STOP_CONDITIONS,
	DOCS_SPINE_APPLY_SYNC_POLICY_SUMMARY,
	DOCS_SPINE_APPLY_WORKFLOW_ID,
	DOCS_SPINE_APPLY_WORKFLOW_VERSION,
} from "../workflows/docs-spine-apply-and-proof/manifest";
import {
	DOCS_OPERATING_SYSTEM_ADOPTION_ALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_ADOPTION_DISALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_ADOPTION_EXPECTED_OUTPUTS,
	DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
	DOCS_OPERATING_SYSTEM_ADOPTION_PROOF_COMMANDS,
	DOCS_OPERATING_SYSTEM_ADOPTION_ROLLBACK_NOTES,
	DOCS_OPERATING_SYSTEM_ADOPTION_STOP_CONDITIONS,
	DOCS_OPERATING_SYSTEM_ADOPTION_SYNC_POLICY_SUMMARY,
	DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID,
	DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_VERSION,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_DISALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_EXPECTED_OUTPUTS,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PROOF_COMMANDS,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ROLLBACK_NOTES,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_STOP_CONDITIONS,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_SYNC_POLICY_SUMMARY,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_VERSION,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_DISALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_EXPECTED_OUTPUTS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROOF_COMMANDS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ROLLBACK_NOTES,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_STOP_CONDITIONS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_SYNC_POLICY_SUMMARY,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_VERSION,
} from "../workflows/docs-operating-system-adoption/manifest";

export const WORKFLOW_RUN_RESOLVE_ENDPOINT =
	"/api/workspace/runner/workflow-runs/resolve";
export const WORKFLOW_RUN_CLAIM_ENDPOINT =
	"/api/workspace/runner/workflow-runs/claim";
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
const MATURE_REPO_ADOPTION_DISALLOWED_TOUCH_TARGETS = [
	"runtime app code",
	"environment files",
	"dependency manifests",
	"dependency locks",
	"database migrations",
	"provider configuration",
	"generated folders",
	"package scripts",
	"root agent instructions",
	"CI configuration",
	"CI-affecting commands",
	"branch pushes",
	"pull requests",
	"raw logs",
	"raw source",
	"Codex transcripts",
] as const;
const MATURE_REPO_ADOPTION_PROOF_COMMANDS = [
	"git status --short",
	"git diff --name-only",
	"git diff --check",
] as const;
const MATURE_REPO_ADOPTION_SYNC_POLICY_SUMMARY =
	"Only approved structured workflow metadata, proof status, command names, artifact names, and repo-relative refs sync. Local code, command output, and Codex session history stay on the machine.";
const MATURE_REPO_ADOPTION_STOP_CONDITIONS = [
	"worktree is dirty before branch creation",
	"write lease expires before adoption audit starts",
	"requested work needs generated-starter rewrites, provider setup, package installs, migrations, CI, PRs, branch pushes, raw source, raw logs, or Codex transcripts",
	"proof command fails",
] as const;
const MATURE_REPO_ADOPTION_ROLLBACK_NOTES =
	"Keep the branch local by default. Roll back with git switch back to the base branch and git branch -D the mature adoption branch after reviewing local proof.";

export type ApprovedWorkflowRunPacket = {
	workflowRunId: string;
	workflowId:
		| "source-truth-agent-readiness"
		| "observability-debuggability"
		| "broken-app-triage"
		| "mature-repo-adoption"
		| typeof DOCS_SPINE_ADOPTION_WORKFLOW_ID
		| typeof DOCS_SPINE_APPLY_WORKFLOW_ID
		| typeof DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID
		| typeof DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID
		| typeof DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID;
	workflowVersion: string;
	branchName: string;
	profileName: string;
	installProfile?: string;
	writeLeaseId: string;
	writeLeaseExpiresAt: number;
	writeLeaseDurationMinutes: number;
	dirtyStatePolicy: "require_clean_worktree";
	expectedOutputs: string[];
	allowedTouchTargets: string[];
	disallowedTouchTargets: string[];
	proofCommands: string[];
	syncPolicySummary: string;
	stopConditions: string[];
	rollbackNotes: string;
	localWorkflowPacketRef: string;
	localProofRef: string;
};

type ResolveApprovedWorkflowRunRequest = {
	state: LocalProjectState;
	credential: RunnerCredential;
	workflowRunId: string;
	fetchWorkflowRun: typeof fetch;
};

type ClaimApprovedWorkflowRunRequest = {
	state: LocalProjectState;
	credential: RunnerCredential;
	fetchWorkflowRun: typeof fetch;
};

export interface WorkflowRunApiService {
	readonly resolve: (
		request: ResolveApprovedWorkflowRunRequest,
	) => Effect.Effect<ApprovedWorkflowRunPacket, Error>;
	readonly claim: (
		request: ClaimApprovedWorkflowRunRequest,
	) => Effect.Effect<ApprovedWorkflowRunPacket | null, Error>;
}

export const WorkflowRunApiService = Context.GenericTag<WorkflowRunApiService>(
	"ship-by-sunday/WorkflowRunApiService",
);

export const NodeWorkflowRunApiServiceLive = Layer.succeed(
	WorkflowRunApiService,
	WorkflowRunApiService.of({
		resolve: (request) =>
			Effect.tryPromise({
				try: (signal) => resolveApprovedWorkflowRunNode(request, signal),
				catch: normalizeLocalRunnerEffectError,
			}),
		claim: (request) =>
			Effect.tryPromise({
				try: (signal) => claimApprovedWorkflowRunNode(request, signal),
				catch: normalizeLocalRunnerEffectError,
			}),
	}),
);

export async function resolveApprovedWorkflowRun({
	state,
	credential,
	workflowRunId,
	fetchWorkflowRun = fetch,
}: {
	state: LocalProjectState;
	credential: RunnerCredential;
	workflowRunId: string;
	fetchWorkflowRun?: typeof fetch;
}) {
	return await runLocalRunnerEffect(
		resolveApprovedWorkflowRunEffect({
			state,
			credential,
			workflowRunId,
			fetchWorkflowRun,
		}).pipe(Effect.provide(NodeWorkflowRunApiServiceLive)),
	);
}

export function resolveApprovedWorkflowRunEffect({
	state,
	credential,
	workflowRunId,
	fetchWorkflowRun = fetch,
}: {
	state: LocalProjectState;
	credential: RunnerCredential;
	workflowRunId: string;
	fetchWorkflowRun?: typeof fetch;
}): Effect.Effect<ApprovedWorkflowRunPacket, Error, WorkflowRunApiService> {
	return Effect.flatMap(WorkflowRunApiService, (service) =>
		service.resolve({
			state,
			credential,
			workflowRunId,
			fetchWorkflowRun,
		}),
	);
}

async function resolveApprovedWorkflowRunNode(
	{
		state,
		credential,
		workflowRunId,
		fetchWorkflowRun,
	}: ResolveApprovedWorkflowRunRequest,
	signal: AbortSignal,
) {
	const response = await fetchWorkflowRun(
		new URL(WORKFLOW_RUN_RESOLVE_ENDPOINT, credential.apiBaseUrl),
		{
			method: "POST",
			signal,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${credential.runnerToken}`,
			},
			body: JSON.stringify({
				projectId: state.projectId,
				runnerId: state.runnerId,
				workflowRunId,
			}),
		},
	);

	if (!response.ok) {
		const body = await response.json().catch(() => null);
		const errorMessage =
			body && typeof body === "object" && "error" in body
				? String(body.error)
				: `HTTP ${response.status}`;
		throw new Error(`Unable to load approved workflow run: ${errorMessage}`);
	}

	const parsed = (await response.json()) as ApprovedWorkflowRunPacket;
	assertApprovedWorkflowRunPacket(parsed, workflowRunId);
	return parsed;
}

export async function claimApprovedWorkflowRun({
	state,
	credential,
	fetchWorkflowRun = fetch,
}: {
	state: LocalProjectState;
	credential: RunnerCredential;
	fetchWorkflowRun?: typeof fetch;
}) {
	return await runLocalRunnerEffect(
		claimApprovedWorkflowRunEffect({
			state,
			credential,
			fetchWorkflowRun,
		}).pipe(Effect.provide(NodeWorkflowRunApiServiceLive)),
	);
}

export function claimApprovedWorkflowRunEffect({
	state,
	credential,
	fetchWorkflowRun = fetch,
}: {
	state: LocalProjectState;
	credential: RunnerCredential;
	fetchWorkflowRun?: typeof fetch;
}): Effect.Effect<
	ApprovedWorkflowRunPacket | null,
	Error,
	WorkflowRunApiService
> {
	return Effect.flatMap(WorkflowRunApiService, (service) =>
		service.claim({
			state,
			credential,
			fetchWorkflowRun,
		}),
	);
}

async function claimApprovedWorkflowRunNode(
	{ state, credential, fetchWorkflowRun }: ClaimApprovedWorkflowRunRequest,
	signal: AbortSignal,
) {
	const response = await fetchWorkflowRun(
		new URL(WORKFLOW_RUN_CLAIM_ENDPOINT, credential.apiBaseUrl),
		{
			method: "POST",
			signal,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${credential.runnerToken}`,
			},
			body: JSON.stringify({
				projectId: state.projectId,
				runnerId: state.runnerId,
			}),
		},
	);

	if (!response.ok) {
		const body = await response.json().catch(() => null);
		const errorMessage =
			body && typeof body === "object" && "error" in body
				? String(body.error)
				: `HTTP ${response.status}`;
		throw new Error(`Unable to claim approved workflow run: ${errorMessage}`);
	}

	const parsed = (await response.json()) as ApprovedWorkflowRunPacket | null;
	if (parsed === null) {
		return null;
	}

	assertApprovedWorkflowRunPacket(parsed, parsed.workflowRunId);
	return parsed;
}

function assertApprovedWorkflowRunPacket(
	packet: ApprovedWorkflowRunPacket,
	workflowRunId: string,
) {
	if (packet.workflowRunId !== workflowRunId) {
		throw new Error("Approved workflow run id does not match request.");
	}
	if (
		packet.workflowId !== "source-truth-agent-readiness" &&
		packet.workflowId !== "observability-debuggability" &&
		packet.workflowId !== "broken-app-triage" &&
		packet.workflowId !== "mature-repo-adoption" &&
		packet.workflowId !== DOCS_SPINE_ADOPTION_WORKFLOW_ID &&
		packet.workflowId !== DOCS_SPINE_APPLY_WORKFLOW_ID &&
		packet.workflowId !== DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID &&
		packet.workflowId !==
			DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID &&
		packet.workflowId !== DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID
	) {
		throw new Error("Approved workflow run is not supported.");
	}
	if (!packet.branchName || !packet.profileName || !packet.writeLeaseId) {
		throw new Error("Approved workflow run is missing execution metadata.");
	}
	if (!Number.isFinite(packet.writeLeaseExpiresAt)) {
		throw new Error("Approved workflow run is missing write lease expiry.");
	}
	if (packet.workflowId === "mature-repo-adoption") {
		assertMatureRepoAdoptionPacket(packet);
	}
	if (packet.workflowId === DOCS_SPINE_ADOPTION_WORKFLOW_ID) {
		assertDocsSpineAdoptionPacket(packet);
	}
	if (packet.workflowId === DOCS_SPINE_APPLY_WORKFLOW_ID) {
		assertDocsSpineApplyPacket(packet);
	}
	if (packet.workflowId === DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID) {
		assertDocsOperatingSystemAdoptionPacket(packet);
	}
	if (
		packet.workflowId ===
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID
	) {
		assertDocsOperatingSystemPackageScriptPatchingPacket(packet);
	}
	if (
		packet.workflowId === DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID
	) {
		assertDocsOperatingSystemLockfileRefreshPacket(packet);
	}
}

function assertMatureRepoAdoptionPacket(packet: ApprovedWorkflowRunPacket) {
	if (packet.workflowVersion !== "v1") {
		throw new Error("Mature repo adoption workflow version is not approved.");
	}
	if (packet.profileName !== "sbs-workspace-write") {
		throw new Error("Mature repo adoption profile is not approved.");
	}
	if (!/^sbs\/mature-repo-adoption-\d{8}-\d{4}$/.test(packet.branchName)) {
		throw new Error("Mature repo adoption branch is not approved.");
	}
	if (packet.writeLeaseDurationMinutes !== 30) {
		throw new Error(
			"Mature repo adoption write lease duration is not approved.",
		);
	}
	if (packet.dirtyStatePolicy !== "require_clean_worktree") {
		throw new Error("Mature repo adoption requires a clean-worktree policy.");
	}
	assertExactTextList(
		packet.expectedOutputs,
		MATURE_REPO_ADOPTION_EXPECTED_OUTPUTS,
		"Mature repo adoption expected outputs",
	);
	assertExactTextList(
		packet.allowedTouchTargets,
		MATURE_REPO_ADOPTION_ALLOWED_TOUCH_TARGETS,
		"Mature repo adoption allowed touch targets",
	);
	assertExactTextList(
		packet.disallowedTouchTargets,
		MATURE_REPO_ADOPTION_DISALLOWED_TOUCH_TARGETS,
		"Mature repo adoption disallowed touch targets",
	);
	assertExactTextList(
		packet.proofCommands,
		MATURE_REPO_ADOPTION_PROOF_COMMANDS,
		"Mature repo adoption proof commands",
	);
	if (packet.syncPolicySummary !== MATURE_REPO_ADOPTION_SYNC_POLICY_SUMMARY) {
		throw new Error("Mature repo adoption sync policy is not approved.");
	}
	assertExactTextList(
		packet.stopConditions,
		MATURE_REPO_ADOPTION_STOP_CONDITIONS,
		"Mature repo adoption stop conditions",
	);
	if (packet.rollbackNotes !== MATURE_REPO_ADOPTION_ROLLBACK_NOTES) {
		throw new Error("Mature repo adoption rollback notes are not approved.");
	}
	if (
		packet.localWorkflowPacketRef !==
		`.sbs/runs/${packet.workflowRunId}/workflow-packet.json`
	) {
		throw new Error(
			"Mature repo adoption workflow packet ref is not approved.",
		);
	}
	if (packet.localProofRef !== `.sbs/runs/${packet.workflowRunId}/proof.json`) {
		throw new Error("Mature repo adoption proof ref is not approved.");
	}
}

function assertDocsSpineAdoptionPacket(packet: ApprovedWorkflowRunPacket) {
	if (packet.workflowVersion !== DOCS_SPINE_ADOPTION_WORKFLOW_VERSION) {
		throw new Error("Docs spine adoption workflow version is not approved.");
	}
	if (packet.profileName !== "sbs-workspace-write") {
		throw new Error("Docs spine adoption profile is not approved.");
	}
	if (!/^sbs\/docs-spine-adoption-\d{8}-\d{4}$/.test(packet.branchName)) {
		throw new Error("Docs spine adoption branch is not approved.");
	}
	if (packet.writeLeaseDurationMinutes !== 30) {
		throw new Error(
			"Docs spine adoption write lease duration is not approved.",
		);
	}
	if (packet.dirtyStatePolicy !== "require_clean_worktree") {
		throw new Error("Docs spine adoption requires a clean-worktree policy.");
	}
	assertExactTextList(
		packet.expectedOutputs,
		DOCS_SPINE_ADOPTION_EXPECTED_OUTPUTS,
		"Docs spine adoption expected outputs",
	);
	assertExactTextList(
		packet.allowedTouchTargets,
		DOCS_SPINE_ADOPTION_ALLOWED_TOUCH_TARGETS,
		"Docs spine adoption allowed touch targets",
	);
	assertExactTextList(
		packet.disallowedTouchTargets,
		DOCS_SPINE_ADOPTION_DISALLOWED_TOUCH_TARGETS,
		"Docs spine adoption disallowed touch targets",
	);
	assertExactTextList(
		packet.proofCommands,
		DOCS_SPINE_ADOPTION_PROOF_COMMANDS,
		"Docs spine adoption proof commands",
	);
	if (packet.syncPolicySummary !== DOCS_SPINE_ADOPTION_SYNC_POLICY_SUMMARY) {
		throw new Error("Docs spine adoption sync policy is not approved.");
	}
	assertExactTextList(
		packet.stopConditions,
		DOCS_SPINE_ADOPTION_STOP_CONDITIONS,
		"Docs spine adoption stop conditions",
	);
	if (packet.rollbackNotes !== DOCS_SPINE_ADOPTION_ROLLBACK_NOTES) {
		throw new Error("Docs spine adoption rollback notes are not approved.");
	}
	if (
		packet.localWorkflowPacketRef !==
		`.sbs/runs/${packet.workflowRunId}/workflow-packet.json`
	) {
		throw new Error("Docs spine adoption workflow packet ref is not approved.");
	}
	if (packet.localProofRef !== `.sbs/runs/${packet.workflowRunId}/proof.json`) {
		throw new Error("Docs spine adoption proof ref is not approved.");
	}
}

function assertDocsSpineApplyPacket(packet: ApprovedWorkflowRunPacket) {
	if (packet.workflowVersion !== DOCS_SPINE_APPLY_WORKFLOW_VERSION) {
		throw new Error("Docs spine apply workflow version is not approved.");
	}
	if (packet.profileName !== "sbs-workspace-write") {
		throw new Error("Docs spine apply profile is not approved.");
	}
	if (!/^sbs\/docs-spine-apply-\d{8}-\d{4}$/.test(packet.branchName)) {
		throw new Error("Docs spine apply branch is not approved.");
	}
	if (packet.writeLeaseDurationMinutes !== 30) {
		throw new Error("Docs spine apply write lease duration is not approved.");
	}
	if (packet.dirtyStatePolicy !== "require_clean_worktree") {
		throw new Error("Docs spine apply requires a clean-worktree policy.");
	}
	assertExactTextList(
		packet.expectedOutputs,
		DOCS_SPINE_APPLY_EXPECTED_OUTPUTS,
		"Docs spine apply expected outputs",
	);
	assertExactTextList(
		packet.allowedTouchTargets,
		DOCS_SPINE_APPLY_ALLOWED_TOUCH_TARGETS,
		"Docs spine apply allowed touch targets",
	);
	assertExactTextList(
		packet.disallowedTouchTargets,
		DOCS_SPINE_APPLY_DISALLOWED_TOUCH_TARGETS,
		"Docs spine apply disallowed touch targets",
	);
	assertExactTextList(
		packet.proofCommands,
		DOCS_SPINE_APPLY_PROOF_COMMANDS,
		"Docs spine apply proof commands",
	);
	if (packet.syncPolicySummary !== DOCS_SPINE_APPLY_SYNC_POLICY_SUMMARY) {
		throw new Error("Docs spine apply sync policy is not approved.");
	}
	assertExactTextList(
		packet.stopConditions,
		DOCS_SPINE_APPLY_STOP_CONDITIONS,
		"Docs spine apply stop conditions",
	);
	if (packet.rollbackNotes !== DOCS_SPINE_APPLY_ROLLBACK_NOTES) {
		throw new Error("Docs spine apply rollback notes are not approved.");
	}
	if (
		packet.localWorkflowPacketRef !==
		`.sbs/runs/${packet.workflowRunId}/workflow-packet.json`
	) {
		throw new Error("Docs spine apply workflow packet ref is not approved.");
	}
	if (packet.localProofRef !== `.sbs/runs/${packet.workflowRunId}/proof.json`) {
		throw new Error("Docs spine apply proof ref is not approved.");
	}
}

function assertDocsOperatingSystemAdoptionPacket(
	packet: ApprovedWorkflowRunPacket,
) {
	if (
		packet.workflowVersion !== DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_VERSION
	) {
		throw new Error(
			"Docs operating system adoption workflow version is not approved.",
		);
	}
	if (packet.profileName !== "sbs-workspace-write") {
		throw new Error("Docs operating system adoption profile is not approved.");
	}
	if (
		packet.installProfile !== DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE
	) {
		throw new Error(
			"Docs operating system adoption install profile is not approved.",
		);
	}
	if (
		!/^sbs\/docs-operating-system-adoption-\d{8}-\d{4}$/.test(packet.branchName)
	) {
		throw new Error("Docs operating system adoption branch is not approved.");
	}
	if (packet.writeLeaseDurationMinutes !== 30) {
		throw new Error(
			"Docs operating system adoption write lease duration is not approved.",
		);
	}
	if (packet.dirtyStatePolicy !== "require_clean_worktree") {
		throw new Error(
			"Docs operating system adoption requires a clean-worktree policy.",
		);
	}
	assertExactTextList(
		packet.expectedOutputs,
		DOCS_OPERATING_SYSTEM_ADOPTION_EXPECTED_OUTPUTS,
		"Docs operating system adoption expected outputs",
	);
	assertExactTextList(
		packet.allowedTouchTargets,
		DOCS_OPERATING_SYSTEM_ADOPTION_ALLOWED_TOUCH_TARGETS,
		"Docs operating system adoption allowed touch targets",
	);
	assertExactTextList(
		packet.disallowedTouchTargets,
		DOCS_OPERATING_SYSTEM_ADOPTION_DISALLOWED_TOUCH_TARGETS,
		"Docs operating system adoption disallowed touch targets",
	);
	assertExactTextList(
		packet.proofCommands,
		DOCS_OPERATING_SYSTEM_ADOPTION_PROOF_COMMANDS,
		"Docs operating system adoption proof commands",
	);
	if (
		packet.syncPolicySummary !==
		DOCS_OPERATING_SYSTEM_ADOPTION_SYNC_POLICY_SUMMARY
	) {
		throw new Error(
			"Docs operating system adoption sync policy is not approved.",
		);
	}
	assertExactTextList(
		packet.stopConditions,
		DOCS_OPERATING_SYSTEM_ADOPTION_STOP_CONDITIONS,
		"Docs operating system adoption stop conditions",
	);
	if (packet.rollbackNotes !== DOCS_OPERATING_SYSTEM_ADOPTION_ROLLBACK_NOTES) {
		throw new Error(
			"Docs operating system adoption rollback notes are not approved.",
		);
	}
	if (
		packet.localWorkflowPacketRef !==
		`.sbs/runs/${packet.workflowRunId}/workflow-packet.json`
	) {
		throw new Error(
			"Docs operating system adoption workflow packet ref is not approved.",
		);
	}
	if (packet.localProofRef !== `.sbs/runs/${packet.workflowRunId}/proof.json`) {
		throw new Error(
			"Docs operating system adoption proof ref is not approved.",
		);
	}
}

function assertDocsOperatingSystemPackageScriptPatchingPacket(
	packet: ApprovedWorkflowRunPacket,
) {
	if (
		packet.workflowVersion !==
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_VERSION
	) {
		throw new Error(
			"Docs operating system package-script patching workflow version is not approved.",
		);
	}
	if (packet.profileName !== "sbs-workspace-write") {
		throw new Error(
			"Docs operating system package-script patching profile is not approved.",
		);
	}
	if (
		packet.installProfile !== DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE
	) {
		throw new Error(
			"Docs operating system package-script patching install profile is not approved.",
		);
	}
	if (
		!/^sbs\/docs-operating-system-package-scripts-\d{8}-\d{4}$/.test(
			packet.branchName,
		)
	) {
		throw new Error(
			"Docs operating system package-script patching branch is not approved.",
		);
	}
	if (packet.writeLeaseDurationMinutes !== 30) {
		throw new Error(
			"Docs operating system package-script patching write lease duration is not approved.",
		);
	}
	if (packet.dirtyStatePolicy !== "require_clean_worktree") {
		throw new Error(
			"Docs operating system package-script patching requires a clean-worktree policy.",
		);
	}
	assertExactTextList(
		packet.expectedOutputs,
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_EXPECTED_OUTPUTS,
		"Docs operating system package-script patching expected outputs",
	);
	assertExactTextList(
		packet.allowedTouchTargets,
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ALLOWED_TOUCH_TARGETS,
		"Docs operating system package-script patching allowed touch targets",
	);
	assertExactTextList(
		packet.disallowedTouchTargets,
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_DISALLOWED_TOUCH_TARGETS,
		"Docs operating system package-script patching disallowed touch targets",
	);
	assertExactTextList(
		packet.proofCommands,
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROOF_COMMANDS,
		"Docs operating system package-script patching proof commands",
	);
	if (
		packet.syncPolicySummary !==
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_SYNC_POLICY_SUMMARY
	) {
		throw new Error(
			"Docs operating system package-script patching sync policy is not approved.",
		);
	}
	assertExactTextList(
		packet.stopConditions,
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_STOP_CONDITIONS,
		"Docs operating system package-script patching stop conditions",
	);
	if (
		packet.rollbackNotes !==
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ROLLBACK_NOTES
	) {
		throw new Error(
			"Docs operating system package-script patching rollback notes are not approved.",
		);
	}
	if (
		packet.localWorkflowPacketRef !==
		`.sbs/runs/${packet.workflowRunId}/workflow-packet.json`
	) {
		throw new Error(
			"Docs operating system package-script patching workflow packet ref is not approved.",
		);
	}
	if (packet.localProofRef !== `.sbs/runs/${packet.workflowRunId}/proof.json`) {
		throw new Error(
			"Docs operating system package-script patching proof ref is not approved.",
		);
	}
}

function assertDocsOperatingSystemLockfileRefreshPacket(
	packet: ApprovedWorkflowRunPacket,
) {
	if (
		packet.workflowVersion !==
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_VERSION
	) {
		throw new Error(
			"Docs operating system lockfile refresh workflow version is not approved.",
		);
	}
	if (packet.profileName !== "sbs-workspace-write") {
		throw new Error(
			"Docs operating system lockfile refresh profile is not approved.",
		);
	}
	if (
		packet.installProfile !== DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE
	) {
		throw new Error(
			"Docs operating system lockfile refresh install profile is not approved.",
		);
	}
	if (
		!/^sbs\/docs-operating-system-lockfile-refresh-\d{8}-\d{4}$/.test(
			packet.branchName,
		)
	) {
		throw new Error(
			"Docs operating system lockfile refresh branch is not approved.",
		);
	}
	if (packet.writeLeaseDurationMinutes !== 30) {
		throw new Error(
			"Docs operating system lockfile refresh write lease duration is not approved.",
		);
	}
	if (packet.dirtyStatePolicy !== "require_clean_worktree") {
		throw new Error(
			"Docs operating system lockfile refresh requires a clean-worktree policy.",
		);
	}
	assertExactTextList(
		packet.expectedOutputs,
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_EXPECTED_OUTPUTS,
		"Docs operating system lockfile refresh expected outputs",
	);
	assertExactTextList(
		packet.allowedTouchTargets,
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ALLOWED_TOUCH_TARGETS,
		"Docs operating system lockfile refresh allowed touch targets",
	);
	assertExactTextList(
		packet.disallowedTouchTargets,
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_DISALLOWED_TOUCH_TARGETS,
		"Docs operating system lockfile refresh disallowed touch targets",
	);
	assertExactTextList(
		packet.proofCommands,
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PROOF_COMMANDS,
		"Docs operating system lockfile refresh proof commands",
	);
	if (
		packet.syncPolicySummary !==
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_SYNC_POLICY_SUMMARY
	) {
		throw new Error(
			"Docs operating system lockfile refresh sync policy is not approved.",
		);
	}
	assertExactTextList(
		packet.stopConditions,
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_STOP_CONDITIONS,
		"Docs operating system lockfile refresh stop conditions",
	);
	if (
		packet.rollbackNotes !==
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ROLLBACK_NOTES
	) {
		throw new Error(
			"Docs operating system lockfile refresh rollback notes are not approved.",
		);
	}
	if (
		packet.localWorkflowPacketRef !==
		`.sbs/runs/${packet.workflowRunId}/workflow-packet.json`
	) {
		throw new Error(
			"Docs operating system lockfile refresh workflow packet ref is not approved.",
		);
	}
	if (packet.localProofRef !== `.sbs/runs/${packet.workflowRunId}/proof.json`) {
		throw new Error(
			"Docs operating system lockfile refresh proof ref is not approved.",
		);
	}
}

function assertExactTextList(
	actual: string[],
	expected: readonly string[],
	errorMessage: string,
) {
	if (
		actual.length !== expected.length ||
		actual.some((value, index) => value !== expected[index])
	) {
		throw new Error(errorMessage);
	}
}
