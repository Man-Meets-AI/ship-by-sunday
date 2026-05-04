import { createHash } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const fetchMutationMock = vi.fn();

vi.mock("convex/nextjs", () => ({
	fetchMutation: fetchMutationMock,
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		workspace: {
			bindWorkspaceRunnerByPairingToken: "bindWorkspaceRunnerByPairingToken",
			ingestWorkspaceRunnerEventByCredential:
				"ingestWorkspaceRunnerEventByCredential",
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

	it("rejects runner events without bearer credentials", async () => {
		const { POST } =
			await import("../../app/api/workspace/runner/events/route");

		const response = await POST(
			createJsonRequest("https://example.com/api/workspace/runner/events", {}),
		);

		expect(response.status).toBe(401);
		expect(fetchMutationMock).not.toHaveBeenCalled();
	});
});
