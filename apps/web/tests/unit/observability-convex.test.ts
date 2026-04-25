import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("convex/observability", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = {
			...originalEnv,
			OBSERVABILITY_INGEST_TOKEN: "ingest_token",
			TELEGRAM_BOT_TOKEN: "telegram_token",
			TELEGRAM_CHAT_ID: "12345",
		};
		vi.resetModules();
	});

	afterEach(() => {
		process.env = { ...originalEnv };
		vi.restoreAllMocks();
	});

	it("deduplicates medium-severity incidents until the delivery threshold is reached", async () => {
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
		expect(third.shouldNotify).toBe(true);
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

	it("formats and sends Telegram alerts through the delivery action", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			text: vi.fn().mockResolvedValue(
				JSON.stringify({
					result: {
						message_id: 99,
					},
				}),
			),
		});
		vi.stubGlobal("fetch", fetchMock);

		const { deliverIncidentNotificationHandler } =
			await import("@/convex/observability/model");

		const runMutation = vi.fn().mockResolvedValue(null);
		await deliverIncidentNotificationHandler(
			{
				runQuery: vi.fn().mockResolvedValue({
					_id: "incident_1",
					product: "ship-by-sunday",
					fingerprint: "incident_1",
					telegramMessageId: undefined,
					telegramThreadId: undefined,
					severity: "high",
					source: "stripe",
					surface: "billing",
					status: "firing",
					environment: "prod",
					pathname: "/api/stripe/checkout",
					requestId: "request_123",
					userId: "user_123",
					externalEventId: null,
					deploymentId: null,
					nativeUrl: "https://dashboard.stripe.com/events",
					logsUrl: null,
					nextAction:
						"Check the Stripe dashboard and the failing checkout or webhook path.",
					code: "stripe_checkout_failed",
					title: "Unable to start Stripe checkout.",
					summary: "code=stripe_checkout_failed | path=/api/stripe/checkout",
					details: '{"provider":"stripe"}',
					stack: "stack line 1\nstack line 2",
					occurrenceCount: 1,
					firstSeenAt: 1_700_000_000_000,
					lastSeenAt: 1_700_000_000_000,
				}),
				runMutation,
			} as never,
			{
				incidentId: "incident_1" as never,
			},
		);

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining("/sendMessage"),
			expect.objectContaining({
				method: "POST",
				body: expect.stringContaining("[Ship by Sunday][PROD][Stripe][high]"),
			}),
		);
		expect(runMutation).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				telegramMessageId: 99,
			}),
		);
	});

	it("records a telegram_delivery incident when Telegram delivery fails", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: false,
			status: 403,
			text: vi.fn().mockResolvedValue(
				JSON.stringify({
					description: "Forbidden: bot was blocked by the user",
				}),
			),
		});
		vi.stubGlobal("fetch", fetchMock);

		const { deliverIncidentNotificationHandler } =
			await import("@/convex/observability/model");
		const runMutation = vi
			.fn()
			.mockResolvedValueOnce(null)
			.mockResolvedValueOnce({
				incidentId: "incident_telegram",
				occurrenceCount: 1,
				shouldNotify: false,
			});

		await deliverIncidentNotificationHandler(
			{
				runQuery: vi.fn().mockResolvedValue({
					_id: "incident_1",
					product: "ship-by-sunday",
					fingerprint: "incident_1",
					telegramMessageId: undefined,
					telegramThreadId: undefined,
					severity: "high",
					source: "stripe",
					surface: "billing",
					status: "firing",
					environment: "prod",
					pathname: "/api/stripe/checkout",
					requestId: "request_123",
					userId: "user_123",
					externalEventId: null,
					deploymentId: null,
					nativeUrl: "https://dashboard.stripe.com/events",
					logsUrl: null,
					nextAction:
						"Check the Stripe dashboard and the failing checkout or webhook path.",
					code: "stripe_checkout_failed",
					title: "Unable to start Stripe checkout.",
					summary: "code=stripe_checkout_failed | path=/api/stripe/checkout",
					details: '{"provider":"stripe"}',
					stack: "stack line 1\nstack line 2",
					occurrenceCount: 1,
					firstSeenAt: 1_700_000_000_000,
					lastSeenAt: 1_700_000_000_000,
				}),
				runMutation,
			} as never,
			{
				incidentId: "incident_1" as never,
			},
		);

		expect(runMutation.mock.calls[0]?.[1]).toMatchObject({
			incidentId: "incident_1",
			message: expect.stringContaining(
				"Telegram delivery failed with status 403",
			),
		});
		expect(runMutation.mock.calls[1]?.[1]).toMatchObject({
			source: "telegram_delivery",
			code: "telegram_delivery_authorization_failed",
			externalEventId: "telegram_delivery_authorization_failed",
			environment: "prod",
			product: "ship-by-sunday",
		});
	});
});
