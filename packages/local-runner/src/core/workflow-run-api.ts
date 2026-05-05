import type { RunnerCredential } from "./local-runner-home";
import type { LocalProjectState } from "./local-project-state";

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
		| "mature-repo-adoption";
	workflowVersion: string;
	branchName: string;
	profileName: string;
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
	const response = await fetchWorkflowRun(
		new URL(WORKFLOW_RUN_RESOLVE_ENDPOINT, credential.apiBaseUrl),
		{
			method: "POST",
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
	const response = await fetchWorkflowRun(
		new URL(WORKFLOW_RUN_CLAIM_ENDPOINT, credential.apiBaseUrl),
		{
			method: "POST",
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
		packet.workflowId !== "mature-repo-adoption"
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
		throw new Error("Mature repo adoption write lease duration is not approved.");
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
		throw new Error("Mature repo adoption workflow packet ref is not approved.");
	}
	if (packet.localProofRef !== `.sbs/runs/${packet.workflowRunId}/proof.json`) {
		throw new Error("Mature repo adoption proof ref is not approved.");
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
