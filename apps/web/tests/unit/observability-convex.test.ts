import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("convex/observability", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = {
			...originalEnv,
			OBSERVABILITY_INGEST_TOKEN: "ingest_token",
		};
		vi.resetModules();
	});

	afterEach(() => {
		process.env = { ...originalEnv };
		vi.restoreAllMocks();
	});

	it("deduplicates medium-severity incidents without app-owned delivery", async () => {
		const insert = vi.fn().mockResolvedValue("incident_1");
		const patch = vi.fn().mockResolvedValue(undefined);
		const unique = vi
			.fn()
			.mockResolvedValueOnce(null)
			.mockResolvedValueOnce({
				_id: "incident_1",
				occurrenceCount: 1,
				firstSeenAt: 10,
				status: "firing",
				deliveryCount: 0,
				deliveryStatus: "suppressed",
			})
			.mockResolvedValueOnce({
				_id: "incident_1",
				occurrenceCount: 2,
				firstSeenAt: 10,
				status: "firing",
				deliveryCount: 0,
				deliveryStatus: "suppressed",
			});
		const { recordIncidentHandler } =
			await import("@/convex/observability/model");

		const ctx = {
			db: {
				query: vi.fn(() => ({
					withIndex: vi.fn(() => ({
						unique,
					})),
				})),
				insert,
				patch,
			},
		};

		const incident = {
			product: "ship-by-sunday",
			environment: "prod" as const,
			fingerprint: "incident_1",
			source: "next_runtime" as const,
			surface: "runtime_error" as const,
			title: "Mission failed",
			summary: "code=next_request_error | path=/mission",
			code: "next_request_error",
			requestId: "request_1",
			pathname: "/mission",
			userId: null,
			externalEventId: null,
			deploymentId: null,
			nativeUrl: null,
			logsUrl: null,
			nextAction: "Check the failing request path and recent server logs.",
			stack: "stack",
			details: null,
			severity: "medium" as const,
		};

		const first = await recordIncidentHandler(ctx as never, incident);
		const second = await recordIncidentHandler(ctx as never, {
			...incident,
			requestId: "request_2",
		});
		const third = await recordIncidentHandler(ctx as never, {
			...incident,
			requestId: "request_3",
		});

		expect(first.shouldNotify).toBe(false);
		expect(second.shouldNotify).toBe(false);
		expect(third.shouldNotify).toBe(false);
		expect(insert).toHaveBeenCalledTimes(4);
		expect(insert).toHaveBeenCalledWith(
			"incidentOccurrences",
			expect.objectContaining({
				incidentId: "incident_1",
				requestId: "request_1",
				occurrenceNumber: 1,
				stack: "stack",
			}),
		);
		expect(insert).toHaveBeenCalledWith(
			"incidentOccurrences",
			expect.objectContaining({
				incidentId: "incident_1",
				requestId: "request_2",
				occurrenceNumber: 2,
			}),
		);
		expect(insert).toHaveBeenCalledWith(
			"incidentOccurrences",
			expect.objectContaining({
				incidentId: "incident_1",
				requestId: "request_3",
				occurrenceNumber: 3,
			}),
		);
		expect(patch).toHaveBeenCalledTimes(3);
	});

	it("keeps acked incidents suppressed on repeat until resolved", async () => {
		const patch = vi.fn().mockResolvedValue(undefined);
		const { recordIncidentHandler, updateIncidentStatusHandler } =
			await import("@/convex/observability/model");

		await updateIncidentStatusHandler(
			{
				db: {
					patch,
				},
			} as never,
			{
				incidentId: "incident_1" as never,
				status: "resolved",
			},
		);

		expect(patch).toHaveBeenCalledWith("incident_1", {
			status: "resolved",
		});

		const result = await recordIncidentHandler(
			{
				db: {
					query: vi.fn(() => ({
						withIndex: vi.fn(() => ({
							unique: vi.fn().mockResolvedValue({
								_id: "incident_2",
								occurrenceCount: 1,
								firstSeenAt: 10,
								status: "acked",
								deliveryCount: 1,
								deliveryStatus: "delivered",
								lastDeliveryAt: Date.now(),
							}),
						})),
					})),
					insert: vi.fn().mockResolvedValue("occurrence_2"),
					patch: vi.fn().mockResolvedValue(undefined),
				},
			} as never,
			{
				product: "ship-by-sunday",
				environment: "prod",
				fingerprint: "incident_2",
				source: "codex",
				surface: "runtime_error",
				title: "Codex failed",
				summary: "code=codex_failed",
				code: "codex_failed",
				requestId: "request_1",
				pathname: "/api/codex/generate",
				userId: "user_123",
				externalEventId: null,
				deploymentId: null,
				nativeUrl: null,
				logsUrl: null,
				nextAction:
					"Check the Codex app-server process and the failing API route.",
				stack: null,
				details: null,
				severity: "high",
			},
		);

		expect(result.shouldNotify).toBe(false);
	});

	it("suppresses notification delivery for telegram_delivery incidents", async () => {
		const insert = vi.fn().mockResolvedValue("incident_telegram");
		const { recordIncidentHandler } =
			await import("@/convex/observability/model");

		const result = await recordIncidentHandler(
			{
				db: {
					query: vi.fn(() => ({
						withIndex: vi.fn(() => ({
							unique: vi.fn().mockResolvedValue(null),
						})),
					})),
					insert,
					patch: vi.fn(),
				},
			} as never,
			{
				product: "ship-by-sunday",
				environment: "prod",
				fingerprint: "incident_telegram",
				source: "telegram_delivery",
				surface: "delivery",
				title: "Telegram delivery failed.",
				summary: "code=telegram_delivery_failed",
				code: "telegram_delivery_failed",
				requestId: null,
				pathname: "/api/observability/vercel",
				userId: null,
				externalEventId: "telegram_delivery_failed:incident_1",
				deploymentId: null,
				nativeUrl: null,
				logsUrl: null,
				nextAction:
					"Inspect the source incident delivery metadata and the Telegram API error before retrying delivery.",
				stack: null,
				details: '{"deliveryError":"Telegram delivery failed."}',
				severity: "critical",
			},
		);

		expect(result.shouldNotify).toBe(false);
		expect(insert).toHaveBeenCalledWith(
			"incidents",
			expect.objectContaining({
				source: "telegram_delivery",
				deliveryStatus: "suppressed",
			}),
		);
	});

	it("lists occurrence documents through the engineering intake query seam", async () => {
		const paginate = vi.fn().mockResolvedValue({
			page: [
				{
					_id: "occurrence_1",
					incidentId: "incident_1",
					requestId: "request_1",
				},
			],
			isDone: true,
			continueCursor: "",
		});
		const { listIncidentOccurrencesForEngineeringIntakeHandler } =
			await import("@/convex/observability/model");

		const result = await listIncidentOccurrencesForEngineeringIntakeHandler(
			{
				db: {
					query: vi.fn((tableName) => {
						expect(tableName).toBe("incidentOccurrences");
						return {
							order: vi.fn((direction) => {
								expect(direction).toBe("desc");
								return { paginate };
							}),
						};
					}),
				},
			} as never,
			{
				paginationOpts: {
					cursor: null,
					numItems: 10,
				},
			},
		);

		expect(paginate).toHaveBeenCalledWith({
			cursor: null,
			numItems: 10,
		});
		expect(result.page[0]).toMatchObject({
			_id: "occurrence_1",
			incidentId: "incident_1",
			requestId: "request_1",
		});
	});

	it("keeps the legacy delivery action side-effect free", async () => {
		const { deliverIncidentNotificationHandler } =
			await import("@/convex/observability/model");

		const runMutation = vi.fn().mockResolvedValue(null);
		await deliverIncidentNotificationHandler(
			{
				runQuery: vi.fn(),
				runMutation,
			} as never,
			{
				incidentId: "incident_1" as never,
			},
		);

		expect(runMutation).not.toHaveBeenCalled();
	});
});
