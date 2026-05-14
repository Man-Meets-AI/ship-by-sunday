import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Effect, Layer } from "effect";

import {
	createRunnerEvent,
	flushRunnerEvents,
	queueRunnerEvent,
	queueRunnerEventEffect,
	readQueuedRunnerEvents,
	readQueuedRunnerEventsEffect,
	RunnerEventService,
	flushRunnerEventsEffect,
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

	it("retains events when delivery times out", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-runner-events-");
		const event = createRunnerEvent({
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			payload: {
				eventType: "worker.install.previewed",
				outcome: "ready",
				status: "ready",
				summary: "Worker Foundations install is ready.",
				createdRefs: [],
				changedRefs: [],
				proofCommandResults: [],
			},
		});

		await queueRunnerEvent(repositoryRoot, event);
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
			deliveryTimeoutMs: 1,
			fetchRunnerEvent: () => new Promise<Response>(() => undefined),
		});

		expect(result).toEqual({ delivered: 0, remaining: 1 });
		await expect(readQueuedRunnerEvents(repositoryRoot)).resolves.toEqual([
			event,
		]);
	});

	it("restores stranded flushing outboxes before delivery", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-runner-events-");
		const event = createRunnerEvent({
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
		const eventDirectory = path.join(repositoryRoot, ".sbs", "events");
		await mkdir(eventDirectory, { recursive: true });
		await writeFile(
			path.join(eventDirectory, "outbox.jsonl.123.flushing"),
			`${JSON.stringify(event)}\n`,
		);

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
			fetchRunnerEvent: async () => new Response(null, { status: 200 }),
		});

		expect(result).toEqual({ delivered: 1, remaining: 0 });
		await expect(readQueuedRunnerEvents(repositoryRoot)).resolves.toEqual([]);
	});

	it("supports injecting the Effect runner event service", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-runner-events-");
		const event = createRunnerEvent({
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			payload: {
				eventType: "runner.paired",
				pairingStatus: "paired",
				runnerMode: "one_shot",
			},
		});
		const queuedEvents = new Array<typeof event>();
		const stubRunnerEventService = Layer.succeed(
			RunnerEventService,
			RunnerEventService.of({
				queue: (request) =>
					Effect.sync(() => {
						expect(request.repositoryRoot).toBe(repositoryRoot);
						expect(request.updateGitExclude).toBe(true);
						queuedEvents.push(request.event);
					}),
				readQueued: () => Effect.succeed(queuedEvents),
				flush: (request) =>
					Effect.succeed({
						delivered: request.deliveryTimeoutMs,
						remaining: request.updateGitExclude ? 0 : 1,
					}),
			}),
		);

		await Effect.runPromise(
			queueRunnerEventEffect(repositoryRoot, event).pipe(
				Effect.provide(stubRunnerEventService),
			),
		);
		const events = await Effect.runPromise(
			readQueuedRunnerEventsEffect(repositoryRoot).pipe(
				Effect.provide(stubRunnerEventService),
			),
		);
		const flushResult = await Effect.runPromise(
			flushRunnerEventsEffect({
				repositoryRoot,
				credential: {
					projectId: "workspaceProjects_1",
					runnerId: "workspaceRunnerBindings_1",
					runnerToken: "sbs_run_secret",
					apiBaseUrl: "https://example.com/",
					eventEndpoint: "/api/workspace/runner/events",
					updatedAt: 1,
				},
				deliveryTimeoutMs: 12,
			}).pipe(Effect.provide(stubRunnerEventService)),
		);

		expect(events).toEqual([event]);
		expect(flushResult).toEqual({ delivered: 12, remaining: 0 });
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

	it("rejects Worker install absolute paths before enqueue", () => {
		expect(() =>
			createRunnerEvent({
				projectId: "workspaceProjects_1",
				runnerId: "workspaceRunnerBindings_1",
				payload: {
					eventType: "worker.install.blocked",
					outcome: "blocked",
					status: "blocked",
					summary: "Worker install is blocked at /workspace/customer-app.",
					createdRefs: [],
					changedRefs: [],
					blockerIds: ["license"],
					blockerReasons: ["Check /workspace/customer-app locally."],
					proofCommandResults: [],
				},
			}),
		).toThrow(/local absolute path/);
	});
});
