import {
	createRunnerEvent,
	flushRunnerEvents,
	queueRunnerEvent,
	readQueuedRunnerEvents,
} from "../src/core/runner-events";
import { createTemporaryDirectory } from "./test-utils";

describe("runner events", () => {
	it("queues sync-safe events and retains failed deliveries", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-runner-events-");
		const firstEvent = createRunnerEvent({
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			payload: {
				eventType: "runner.paired",
				pairingStatus: "paired",
				runnerMode: "daemon",
			},
		});
		const secondEvent = createRunnerEvent({
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			payload: {
				eventType: "runner.heartbeat",
				runnerMode: "daemon",
				status: "online",
				machineHealthStatus: "ready",
				projectHealthStatus: "ready",
			},
		});

		await queueRunnerEvent(repositoryRoot, firstEvent);
		await queueRunnerEvent(repositoryRoot, secondEvent);
		let callCount = 0;
		const result = await flushRunnerEvents({
			repositoryRoot,
			credential: {
				projectId: "workspaceProjects_1",
				runnerId: "workspaceRunnerBindings_1",
				runnerToken: "sbs_run_secret",
				apiBaseUrl: "https://example.com/",
				eventEndpoint: "/api/workspace/runner/events",
				updatedAt: 1,
			},
			fetchRunnerEvent: async () => {
				callCount += 1;
				return new Response(null, { status: callCount === 1 ? 200 : 503 });
			},
		});

		expect(result).toEqual({ delivered: 1, remaining: 1 });
		await expect(readQueuedRunnerEvents(repositoryRoot)).resolves.toHaveLength(
			1,
		);
	});

	it("keeps events queued while a flush is in progress", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-runner-events-");
		const firstEvent = createRunnerEvent({
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			payload: {
				eventType: "runner.heartbeat",
				runnerMode: "daemon",
				status: "online",
				machineHealthStatus: "ready",
				projectHealthStatus: "ready",
			},
		});
		const concurrentEvent = createRunnerEvent({
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			payload: {
				eventType: "workflow.blocked",
				workflowId: "broken-app-triage",
				writeLeaseId: "lease_workflowRuns_1",
				blockedStage: "reproduction-command",
				blockedReason:
					"No approved read-only diagnostic command was available.",
			},
		});

		await queueRunnerEvent(repositoryRoot, firstEvent);
		const result = await flushRunnerEvents({
			repositoryRoot,
			credential: {
				projectId: "workspaceProjects_1",
				runnerId: "workspaceRunnerBindings_1",
				runnerToken: "sbs_run_secret",
				apiBaseUrl: "https://example.com/",
				eventEndpoint: "/api/workspace/runner/events",
				updatedAt: 1,
			},
			fetchRunnerEvent: async () => {
				await queueRunnerEvent(repositoryRoot, concurrentEvent);
				return new Response(null, { status: 200 });
			},
		});

		expect(result).toEqual({ delivered: 1, remaining: 0 });
		await expect(readQueuedRunnerEvents(repositoryRoot)).resolves.toEqual([
			concurrentEvent,
		]);
	});

	it("rejects unsafe payload fields before enqueue", () => {
		expect(() =>
			createRunnerEvent({
				projectId: "workspaceProjects_1",
				runnerId: "workspaceRunnerBindings_1",
				payload: {
					eventType: "runner.heartbeat",
					runnerMode: "daemon",
					status: "online",
					machineHealthStatus: "ready",
					projectHealthStatus: "ready",
					token: "sbs_run_secret",
				} as never,
			}),
		).toThrow(/unsafe field token/);
	});
});
