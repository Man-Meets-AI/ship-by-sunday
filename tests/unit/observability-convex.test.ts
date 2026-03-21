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

	it("deduplicates medium-severity incidents until the alert threshold is reached", async () => {
		const insert = vi.fn().mockResolvedValue("error_1");
		const patch = vi.fn().mockResolvedValue(undefined);
		const unique = vi
			.fn()
			.mockResolvedValueOnce(null)
			.mockResolvedValueOnce({
				_id: "error_1",
				occurrenceCount: 1,
				firstSeenAt: 10,
				alertCount: 0,
				alertStatus: "suppressed",
			})
			.mockResolvedValueOnce({
				_id: "error_1",
				occurrenceCount: 2,
				firstSeenAt: 10,
				alertCount: 0,
				alertStatus: "suppressed",
			});
		const { recordObservedError } = await import("@/convex/observability");

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

		const first = await recordObservedError._handler(ctx as never, {
			fingerprint: "err_1",
			source: "next_server",
			message: "Mission failed",
			stack: "stack",
			details: null,
			requestId: "request_1",
			pathname: "/mission",
			userId: null,
			code: "next_request_error",
			severity: "medium",
			environment: "production",
		});
		const second = await recordObservedError._handler(ctx as never, {
			fingerprint: "err_1",
			source: "next_server",
			message: "Mission failed",
			stack: "stack",
			details: null,
			requestId: "request_2",
			pathname: "/mission",
			userId: null,
			code: "next_request_error",
			severity: "medium",
			environment: "production",
		});
		const third = await recordObservedError._handler(ctx as never, {
			fingerprint: "err_1",
			source: "next_server",
			message: "Mission failed",
			stack: "stack",
			details: null,
			requestId: "request_3",
			pathname: "/mission",
			userId: null,
			code: "next_request_error",
			severity: "medium",
			environment: "production",
		});

		expect(first.shouldAlert).toBe(false);
		expect(second.shouldAlert).toBe(false);
		expect(third.shouldAlert).toBe(true);
		expect(insert).toHaveBeenCalledTimes(1);
		expect(patch).toHaveBeenCalledTimes(2);
	});

	it("formats and sends Telegram alerts through the delivery action", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue({
				result: {
					message_id: 99,
				},
			}),
		});
		vi.stubGlobal("fetch", fetchMock);

		const { deliverObservedErrorAlert } = await import("@/convex/observability");

		const runMutation = vi.fn().mockResolvedValue(null);
		await deliverObservedErrorAlert._handler(
			{
				runQuery: vi.fn().mockResolvedValue({
					_id: "error_1",
					fingerprint: "err_1",
					telegramMessageId: undefined,
					severity: "high",
					source: "stripe",
					environment: "production",
					pathname: "/api/stripe/checkout",
					requestId: "request_123",
					userId: "user_123",
					code: "stripe_checkout_failed",
					message: "Unable to start Stripe checkout.",
					details: '{"provider":"stripe"}',
					stack: "stack line 1\nstack line 2",
					occurrenceCount: 1,
					firstSeenAt: 1_700_000_000_000,
					lastSeenAt: 1_700_000_000_000,
				}),
				runMutation,
			} as never,
			{
				eventId: "error_1" as never,
			},
		);

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining("/sendMessage"),
			expect.objectContaining({
				method: "POST",
				body: expect.stringContaining("INCIDENT_PACKET"),
			}),
		);
		expect(runMutation).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				telegramMessageId: 99,
			}),
		);
	});
});
