import type { RunnerCredential } from "./local-runner-home";
import type { LocalProjectState } from "./local-project-state";

export const WORKFLOW_RUN_RESOLVE_ENDPOINT =
	"/api/workspace/runner/workflow-runs/resolve";
export const WORKFLOW_RUN_CLAIM_ENDPOINT =
	"/api/workspace/runner/workflow-runs/claim";

export type ApprovedWorkflowRunPacket = {
	workflowRunId: string;
	workflowId:
		| "source-truth-agent-readiness"
		| "observability-debuggability"
		| "broken-app-triage";
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
		packet.workflowId !== "broken-app-triage"
	) {
		throw new Error("Approved workflow run is not supported.");
	}
	if (!packet.branchName || !packet.profileName || !packet.writeLeaseId) {
		throw new Error("Approved workflow run is missing execution metadata.");
	}
	if (!Number.isFinite(packet.writeLeaseExpiresAt)) {
		throw new Error("Approved workflow run is missing write lease expiry.");
	}
}
