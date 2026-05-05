import { createHash } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const fetchMutationMock = vi.fn();
const fetchQueryMock = vi.fn();

vi.mock("convex/nextjs", () => ({
	fetchMutation: fetchMutationMock,
	fetchQuery: fetchQueryMock,
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		workspace: {
			bindWorkspaceRunnerByPairingToken: "bindWorkspaceRunnerByPairingToken",
			ingestWorkspaceRunnerEventByCredential:
				"ingestWorkspaceRunnerEventByCredential",
			getWorkspaceWorkflowRunByCredential:
				"getWorkspaceWorkflowRunByCredential",
			startWorkspaceDoctorPassRunByCredential:
				"startWorkspaceDoctorPassRunByCredential",
			syncApprovedCodebaseFindingsByCredential:
				"syncApprovedCodebaseFindingsByCredential",
		},
	},
}));

function createJsonRequest(url: string, body: unknown, headers?: HeadersInit) {
	return new Request(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
		body: JSON.stringify(body),
	});
}

describe("workspace runner API", () => {
	beforeEach(() => {
		fetchMutationMock.mockReset();
		fetchQueryMock.mockReset();
		vi.resetModules();
	});

	it("pairs a runner through a setup token and only stores a token hash", async () => {
		fetchMutationMock.mockResolvedValue({
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			runnerMode: "daemon",
			pairingStatus: "paired",
		});
		const { POST } = await import("../../app/api/workspace/runner/pair/route");

		const response = await POST(
			createJsonRequest("https://example.com/api/workspace/runner/pair", {
				pairingToken: "sbs_pair_111111112222_4333844455555555",
				runnerMode: "daemon",
				machineDisplayName: "Parker MacBook",
			}),
		);
		const body = await response.json();
		const [, mutationArgs] = fetchMutationMock.mock.calls[0];

		expect(response.status).toBe(200);
		expect(body.runnerToken).toMatch(/^sbs_run_/);
		expect(body.eventEndpoint).toBe("/api/workspace/runner/events");
		expect(mutationArgs).toMatchObject({
			pairingToken: "sbs_pair_111111112222_4333844455555555",
			runnerMode: "daemon",
			machineDisplayName: "Parker MacBook",
		});
		expect(mutationArgs.runnerCredentialHash).toMatch(/^sha256:/);
		expect(JSON.stringify(mutationArgs)).not.toContain(body.runnerToken);
	});

	it("authenticates event ingestion with the bearer token hash", async () => {
		fetchMutationMock.mockResolvedValue({
			eventId: "evt-heartbeat",
			inserted: true,
			eventDocumentId: "workspaceRunnerEvents_1",
		});
		const { POST } =
			await import("../../app/api/workspace/runner/events/route");

		const response = await POST(
			createJsonRequest(
				"https://example.com/api/workspace/runner/events",
				{
					eventId: "evt-heartbeat",
					projectId: "workspaceProjects_1",
					runnerId: "workspaceRunnerBindings_1",
					eventType: "runner.heartbeat",
					schemaVersion: "workspace.runner-event.v1",
					createdAt: 1000,
					payload: {
						eventType: "runner.heartbeat",
						runnerMode: "daemon",
						status: "online",
						machineHealthStatus: "ready",
						projectHealthStatus: "ready",
					},
				},
				{ Authorization: "Bearer sbs_run_secret" },
			),
		);
		const [, mutationArgs] = fetchMutationMock.mock.calls[0];

		expect(response.status).toBe(200);
		expect(mutationArgs.runnerCredentialHash).toBe(
			`sha256:${createHash("sha256").update("sbs_run_secret").digest("hex")}`,
		);
		expect(JSON.stringify(mutationArgs)).not.toContain("sbs_run_secret");
	});

	it("passes sync-safe paired runner repository metadata to Convex", async () => {
		fetchMutationMock.mockResolvedValue({
			eventId: "evt-paired",
			inserted: true,
			eventDocumentId: "workspaceRunnerEvents_1",
		});
		const { POST } =
			await import("../../app/api/workspace/runner/events/route");

		const response = await POST(
			createJsonRequest(
				"https://example.com/api/workspace/runner/events",
				{
					eventId: "evt-paired",
					projectId: "workspaceProjects_1",
					runnerId: "workspaceRunnerBindings_1",
					eventType: "runner.paired",
					schemaVersion: "workspace.runner-event.v1",
					createdAt: 1000,
					payload: {
						eventType: "runner.paired",
						pairingStatus: "paired",
						runnerMode: "daemon",
						machineDisplayName: "Parker MacBook",
						repositoryDisplayName: "ship-by-sunday",
					},
				},
				{ Authorization: "Bearer sbs_run_secret" },
			),
		);
		const [, mutationArgs] = fetchMutationMock.mock.calls[0];

		expect(response.status).toBe(200);
		expect(mutationArgs.payload).toMatchObject({
			eventType: "runner.paired",
			repositoryDisplayName: "ship-by-sunday",
		});
	});

	it("rejects runner events without bearer credentials", async () => {
		const { POST } =
			await import("../../app/api/workspace/runner/events/route");

		const response = await POST(
			createJsonRequest("https://example.com/api/workspace/runner/events", {}),
		);

		expect(response.status).toBe(401);
		expect(fetchMutationMock).not.toHaveBeenCalled();
	});

	it("starts a doctor pass run through bearer credentials", async () => {
		fetchMutationMock.mockResolvedValue({
			doctorPassRunId: "doctorPassRuns_1",
			startedAt: 1234,
		});
		const { POST } =
			await import("../../app/api/workspace/runner/doctor-pass/start/route");

		const response = await POST(
			createJsonRequest(
				"https://example.com/api/workspace/runner/doctor-pass/start",
				{
					projectId: "workspaceProjects_1",
					runnerId: "workspaceRunnerBindings_1",
					localRunId: "run-test",
					runnerMode: "daemon",
				},
				{ Authorization: "Bearer sbs_run_secret" },
			),
		);
		const [, mutationArgs] = fetchMutationMock.mock.calls[0];

		expect(response.status).toBe(200);
		expect(mutationArgs).toMatchObject({
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			localRunId: "run-test",
			runnerMode: "daemon",
			runnerCredentialHash: `sha256:${createHash("sha256").update("sbs_run_secret").digest("hex")}`,
		});
	});

	it("uploads approved findings through bearer credentials", async () => {
		fetchMutationMock.mockResolvedValue({
			syncedAt: 1234,
			insertedCount: 1,
			patchedCount: 0,
		});
		const { POST } =
			await import("../../app/api/workspace/runner/findings/route");

		const response = await POST(
			createJsonRequest(
				"https://example.com/api/workspace/runner/findings",
				{
					projectId: "workspaceProjects_1",
					runnerId: "workspaceRunnerBindings_1",
					doctorPassRunId: "doctorPassRuns_1",
					previewDigest: "sha256:preview",
					findings: [],
				},
				{ Authorization: "Bearer sbs_run_secret" },
			),
		);
		const [, mutationArgs] = fetchMutationMock.mock.calls[0];

		expect(response.status).toBe(200);
		expect(mutationArgs).toMatchObject({
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			doctorPassRunId: "doctorPassRuns_1",
			previewDigest: "sha256:preview",
			findings: [],
			runnerCredentialHash: `sha256:${createHash("sha256").update("sbs_run_secret").digest("hex")}`,
		});
	});

	it("resolves approved workflow runs through bearer credentials", async () => {
		fetchQueryMock.mockResolvedValue({
			workflowRunId: "workflowRuns_1",
			workflowId: "source-truth-agent-readiness",
			workflowVersion: "v1",
			branchName: "sbs/source-truth-readiness-20260504-2100",
			profileName: "sbs-workspace-write",
			writeLeaseId: "lease_workflowRuns_1",
			writeLeaseExpiresAt: 1234,
			writeLeaseDurationMinutes: 30,
			dirtyStatePolicy: "require_clean_worktree",
			expectedOutputs: [],
			allowedTouchTargets: [],
			disallowedTouchTargets: [],
			proofCommands: [],
			syncPolicySummary: "Only structured metadata syncs.",
			stopConditions: [],
			rollbackNotes: "Delete the local branch after review.",
			localWorkflowPacketRef: ".sbs/runs/workflowRuns_1/workflow-packet.json",
			localProofRef: ".sbs/runs/workflowRuns_1/proof.json",
		});
		const { POST } =
			await import("../../app/api/workspace/runner/workflow-runs/resolve/route");

		const response = await POST(
			createJsonRequest(
				"https://example.com/api/workspace/runner/workflow-runs/resolve",
				{
					projectId: "workspaceProjects_1",
					runnerId: "workspaceRunnerBindings_1",
					workflowRunId: "workflowRuns_1",
				},
				{ Authorization: "Bearer sbs_run_secret" },
			),
		);
		const [, queryArgs] = fetchQueryMock.mock.calls[0];

		expect(response.status).toBe(200);
		expect(queryArgs).toMatchObject({
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			workflowRunId: "workflowRuns_1",
			runnerCredentialHash: `sha256:${createHash("sha256").update("sbs_run_secret").digest("hex")}`,
		});
	});
});
