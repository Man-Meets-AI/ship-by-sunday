import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type StripeWebhookEventRecord = {
	_id: string;
	stripeEventId: string;
	eventType: string;
	stripeObjectId?: string;
	courseSlug?: string;
	status:
		| "processing"
		| "queued"
		| "processed"
		| "failed"
		| "ignored"
		| "payment_pending";
	resultKind?: string;
	errorMessage?: string;
	attemptCount: number;
	firstSeenAt: number;
	updatedAt: number;
	completedAt?: number;
};
type StripeWebhookEventDocument = Omit<StripeWebhookEventRecord, "_id">;

function createStripeWebhookEventsCtx({
	stripeWebhookEvents = [],
}: {
	stripeWebhookEvents?: StripeWebhookEventRecord[];
} = {}) {
	const tables = {
		stripeWebhookEvents: [...stripeWebhookEvents],
	};
	const runAfter = vi.fn();
	const insert = vi.fn(
		async (
			tableName: "stripeWebhookEvents",
			document: StripeWebhookEventDocument,
		) => {
			const id = `${tableName}_${tables[tableName].length + 1}`;
			tables[tableName].push({ ...document, _id: id });
			return id;
		},
	);
	const patch = vi.fn(
		async (id: string, patchDocument: Partial<StripeWebhookEventRecord>) => {
			const eventIndex = tables.stripeWebhookEvents.findIndex(
				(event) => event._id === id,
			);
			if (eventIndex === -1) {
				throw new Error(`Missing event ${id}`);
			}

			tables.stripeWebhookEvents[eventIndex] = {
				...tables.stripeWebhookEvents[eventIndex],
				...patchDocument,
			};
		},
	);

	return {
		ctx: {
			db: {
				query: vi.fn((tableName: "stripeWebhookEvents") => ({
					withIndex: vi.fn(
						(
							indexName: string,
							buildQuery: (query: {
								eq: (fieldName: string, value: unknown) => unknown;
							}) => unknown,
						) => {
							const filters = new Map<string, unknown>();
							const query = {
								eq: (fieldName: string, value: unknown) => {
									filters.set(fieldName, value);
									return query;
								},
							};
							buildQuery(query);
							const matches = tables[tableName].filter((event) => {
								if (indexName === "by_stripe_event_id") {
									return event.stripeEventId === filters.get("stripeEventId");
								}

								if (indexName === "by_stripe_object_id_and_event_type") {
									return (
										event.stripeObjectId === filters.get("stripeObjectId") &&
										event.eventType === filters.get("eventType")
									);
								}

								throw new Error(`Unexpected index ${indexName}`);
							});

							return {
								unique: vi.fn(async () => matches[0] ?? null),
								order: vi.fn(() => ({
									take: vi.fn(async () => [...matches].reverse()),
								})),
							};
						},
					),
				})),
				insert,
				patch,
			},
			scheduler: {
				runAfter,
			},
		},
		insert,
		patch,
		runAfter,
		tables,
	};
}

describe("convex/stripeWebhookEvents", () => {
	let moduleUnderTest: typeof import("@/convex/stripeWebhookEvents");

	beforeEach(async () => {
		vi.resetModules();
		moduleUnderTest = await import("@/convex/stripeWebhookEvents");
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("starts processing a first Stripe webhook event", async () => {
		const { ctx, insert, tables } = createStripeWebhookEventsCtx();
		vi.spyOn(Date, "now").mockReturnValue(1_000);

		await expect(
			moduleUnderTest.beginStripeWebhookEventProcessing._handler(ctx as never, {
				stripeEventId: "evt_first",
				eventType: "checkout.session.completed",
				stripeObjectId: "cs_first",
				courseSlug: "ship-by-sunday",
			}),
		).resolves.toEqual({
			decision: "process",
			attemptCount: 1,
		});

		expect(insert).toHaveBeenCalledWith(
			"stripeWebhookEvents",
			expect.objectContaining({
				stripeEventId: "evt_first",
				eventType: "checkout.session.completed",
				stripeObjectId: "cs_first",
				courseSlug: "ship-by-sunday",
				status: "processing",
				attemptCount: 1,
				firstSeenAt: 1_000,
				updatedAt: 1_000,
			}),
		);
		expect(tables.stripeWebhookEvents).toHaveLength(1);
	});

	it("skips an exact Stripe event id that already reached a terminal state", async () => {
		const { ctx, insert, patch } = createStripeWebhookEventsCtx({
			stripeWebhookEvents: [
				{
					_id: "stripe_webhook_event_1",
					stripeEventId: "evt_done",
					eventType: "checkout.session.completed",
					stripeObjectId: "cs_done",
					courseSlug: "ship-by-sunday",
					status: "processed",
					resultKind: "granted",
					attemptCount: 1,
					firstSeenAt: 1_000,
					updatedAt: 1_000,
					completedAt: 1_000,
				},
			],
		});

		await expect(
			moduleUnderTest.beginStripeWebhookEventProcessing._handler(ctx as never, {
				stripeEventId: "evt_done",
				eventType: "checkout.session.completed",
				stripeObjectId: "cs_done",
				courseSlug: "ship-by-sunday",
			}),
		).resolves.toEqual({
			decision: "skip",
			status: "processed",
			resultKind: "granted",
		});

		expect(insert).not.toHaveBeenCalled();
		expect(patch).not.toHaveBeenCalled();
	});

	it("skips a logical duplicate with a new event id for the same session and event type", async () => {
		const { ctx, insert, patch } = createStripeWebhookEventsCtx({
			stripeWebhookEvents: [
				{
					_id: "stripe_webhook_event_1",
					stripeEventId: "evt_original",
					eventType: "checkout.session.completed",
					stripeObjectId: "cs_duplicate",
					courseSlug: "ship-by-sunday",
					status: "processed",
					resultKind: "granted",
					attemptCount: 1,
					firstSeenAt: 1_000,
					updatedAt: 1_000,
					completedAt: 1_000,
				},
			],
		});

		await expect(
			moduleUnderTest.beginStripeWebhookEventProcessing._handler(ctx as never, {
				stripeEventId: "evt_logical_duplicate",
				eventType: "checkout.session.completed",
				stripeObjectId: "cs_duplicate",
				courseSlug: "ship-by-sunday",
			}),
		).resolves.toEqual({
			decision: "skip",
			status: "processed",
			resultKind: "granted",
		});

		expect(insert).not.toHaveBeenCalled();
		expect(patch).not.toHaveBeenCalled();
	});

	it("processes a different event type for the same Checkout Session", async () => {
		const { ctx, insert } = createStripeWebhookEventsCtx({
			stripeWebhookEvents: [
				{
					_id: "stripe_webhook_event_1",
					stripeEventId: "evt_completed",
					eventType: "checkout.session.completed",
					stripeObjectId: "cs_async",
					courseSlug: "ship-by-sunday",
					status: "payment_pending",
					resultKind: "payment_pending",
					attemptCount: 1,
					firstSeenAt: 1_000,
					updatedAt: 1_000,
					completedAt: 1_000,
				},
			],
		});
		vi.spyOn(Date, "now").mockReturnValue(2_000);

		await expect(
			moduleUnderTest.beginStripeWebhookEventProcessing._handler(ctx as never, {
				stripeEventId: "evt_async_success",
				eventType: "checkout.session.async_payment_succeeded",
				stripeObjectId: "cs_async",
				courseSlug: "ship-by-sunday",
			}),
		).resolves.toEqual({
			decision: "process",
			attemptCount: 1,
		});

		expect(insert).toHaveBeenCalledWith(
			"stripeWebhookEvents",
			expect.objectContaining({
				stripeEventId: "evt_async_success",
				eventType: "checkout.session.async_payment_succeeded",
				stripeObjectId: "cs_async",
				status: "processing",
			}),
		);
	});

	it("retries a failed event instead of treating it as terminal", async () => {
		const { ctx, patch } = createStripeWebhookEventsCtx({
			stripeWebhookEvents: [
				{
					_id: "stripe_webhook_event_failed",
					stripeEventId: "evt_failed",
					eventType: "checkout.session.completed",
					stripeObjectId: "cs_failed",
					courseSlug: "ship-by-sunday",
					status: "failed",
					resultKind: "grant_failed",
					errorMessage: "convex unavailable",
					attemptCount: 1,
					firstSeenAt: 1_000,
					updatedAt: 1_000,
					completedAt: 1_000,
				},
			],
		});
		vi.spyOn(Date, "now").mockReturnValue(2_000);

		await expect(
			moduleUnderTest.beginStripeWebhookEventProcessing._handler(ctx as never, {
				stripeEventId: "evt_failed",
				eventType: "checkout.session.completed",
				stripeObjectId: "cs_failed",
				courseSlug: "ship-by-sunday",
			}),
		).resolves.toEqual({
			decision: "process",
			attemptCount: 2,
		});

		expect(patch).toHaveBeenCalledWith(
			"stripe_webhook_event_failed",
			expect.objectContaining({
				status: "processing",
				errorMessage: undefined,
				attemptCount: 2,
				updatedAt: 2_000,
				completedAt: undefined,
			}),
		);
	});

	it("records the terminal result for a processed event", async () => {
		const { ctx, patch } = createStripeWebhookEventsCtx({
			stripeWebhookEvents: [
				{
					_id: "stripe_webhook_event_processing",
					stripeEventId: "evt_processing",
					eventType: "checkout.session.completed",
					stripeObjectId: "cs_processing",
					courseSlug: "ship-by-sunday",
					status: "processing",
					attemptCount: 1,
					firstSeenAt: 1_000,
					updatedAt: 1_000,
				},
			],
		});
		vi.spyOn(Date, "now").mockReturnValue(3_000);

		await expect(
			moduleUnderTest.recordStripeWebhookEventResult._handler(ctx as never, {
				stripeEventId: "evt_processing",
				eventType: "checkout.session.completed",
				stripeObjectId: "cs_processing",
				courseSlug: "ship-by-sunday",
				status: "processed",
				attemptCount: 1,
				resultKind: "granted",
			}),
		).resolves.toEqual({
			recorded: "patched",
		});

		expect(patch).toHaveBeenCalledWith(
			"stripe_webhook_event_processing",
			expect.objectContaining({
				status: "processed",
				resultKind: "granted",
				attemptCount: 1,
				updatedAt: 3_000,
				completedAt: 3_000,
			}),
		);
	});

	it("does not let a stale failed attempt overwrite a newer processed result", async () => {
		const { ctx, patch } = createStripeWebhookEventsCtx({
			stripeWebhookEvents: [
				{
					_id: "stripe_webhook_event_processed",
					stripeEventId: "evt_race",
					eventType: "checkout.session.completed",
					stripeObjectId: "cs_race",
					courseSlug: "ship-by-sunday",
					status: "processed",
					resultKind: "granted",
					attemptCount: 2,
					firstSeenAt: 1_000,
					updatedAt: 2_000,
					completedAt: 2_000,
				},
			],
		});

		await expect(
			moduleUnderTest.recordStripeWebhookEventResult._handler(ctx as never, {
				stripeEventId: "evt_race",
				eventType: "checkout.session.completed",
				stripeObjectId: "cs_race",
				courseSlug: "ship-by-sunday",
				status: "failed",
				attemptCount: 1,
				resultKind: "grant_failed",
				errorMessage: "convex unavailable",
			}),
		).resolves.toEqual({
			recorded: "skipped_stale",
		});

		expect(patch).not.toHaveBeenCalled();
	});

	it("lets a stale success repair a newer failed attempt", async () => {
		const { ctx, patch } = createStripeWebhookEventsCtx({
			stripeWebhookEvents: [
				{
					_id: "stripe_webhook_event_failed",
					stripeEventId: "evt_race_success",
					eventType: "checkout.session.completed",
					stripeObjectId: "cs_race_success",
					courseSlug: "ship-by-sunday",
					status: "failed",
					resultKind: "grant_failed",
					errorMessage: "convex unavailable",
					attemptCount: 2,
					firstSeenAt: 1_000,
					updatedAt: 2_000,
					completedAt: 2_000,
				},
			],
		});
		vi.spyOn(Date, "now").mockReturnValue(3_000);

		await expect(
			moduleUnderTest.recordStripeWebhookEventResult._handler(ctx as never, {
				stripeEventId: "evt_race_success",
				eventType: "checkout.session.completed",
				stripeObjectId: "cs_race_success",
				courseSlug: "ship-by-sunday",
				status: "processed",
				attemptCount: 1,
				resultKind: "granted",
			}),
		).resolves.toEqual({
			recorded: "patched",
		});

		expect(patch).toHaveBeenCalledWith(
			"stripe_webhook_event_failed",
			expect.objectContaining({
				status: "processed",
				resultKind: "granted",
				errorMessage: undefined,
				attemptCount: 2,
				updatedAt: 3_000,
				completedAt: 3_000,
			}),
		);
	});

	it("schedules a retry for a failed queued fulfillment attempt", async () => {
		const { ctx, patch, runAfter } = createStripeWebhookEventsCtx({
			stripeWebhookEvents: [
				{
					_id: "stripe_webhook_event_failed",
					stripeEventId: "evt_retry",
					eventType: "checkout.session.completed",
					stripeObjectId: "cs_retry",
					courseSlug: "ship-by-sunday",
					status: "failed",
					resultKind: "grant_failed",
					errorMessage: "convex unavailable",
					attemptCount: 1,
					firstSeenAt: 1_000,
					updatedAt: 1_000,
					completedAt: 1_000,
				},
			],
		});
		vi.spyOn(Date, "now").mockReturnValue(2_000);

		await expect(
			moduleUnderTest.retryFailedStripeWebhookEventFulfillment._handler(
				ctx as never,
				{
					stripeEventId: "evt_retry",
					eventType: "checkout.session.completed",
					sessionId: "cs_retry",
					failedAttemptCount: 1,
				},
			),
		).resolves.toEqual({
			retried: "scheduled",
		});

		expect(patch).toHaveBeenCalledWith(
			"stripe_webhook_event_failed",
			expect.objectContaining({
				status: "queued",
				resultKind: "queued",
				errorMessage: undefined,
				attemptCount: 2,
				updatedAt: 2_000,
				completedAt: undefined,
			}),
		);
		expect(runAfter).toHaveBeenCalledTimes(2);
		expect(runAfter.mock.calls[0]?.[0]).toBe(0);
		expect(runAfter.mock.calls[0]?.[2]).toMatchObject({
			stripeEventId: "evt_retry",
			eventType: "checkout.session.completed",
			sessionId: "cs_retry",
			attemptCount: 2,
		});
	});

	it("reschedules a stale queued fulfillment attempt", async () => {
		const { ctx, patch, runAfter } = createStripeWebhookEventsCtx({
			stripeWebhookEvents: [
				{
					_id: "stripe_webhook_event_queued",
					stripeEventId: "evt_stale",
					eventType: "checkout.session.completed",
					stripeObjectId: "cs_stale",
					courseSlug: "ship-by-sunday",
					status: "queued",
					resultKind: "queued",
					attemptCount: 1,
					firstSeenAt: 1_000,
					updatedAt: 1_000,
				},
			],
		});
		vi.spyOn(Date, "now").mockReturnValue(
			1_000 + moduleUnderTest.STRIPE_WEBHOOK_FULFILLMENT_STALE_MS + 1,
		);

		await expect(
			moduleUnderTest.retryStaleStripeWebhookEventFulfillment._handler(
				ctx as never,
				{
					stripeEventId: "evt_stale",
					eventType: "checkout.session.completed",
					sessionId: "cs_stale",
					attemptCount: 1,
				},
			),
		).resolves.toEqual({
			retried: "scheduled",
		});

		expect(patch).toHaveBeenCalledWith(
			"stripe_webhook_event_queued",
			expect.objectContaining({
				status: "queued",
				resultKind: "queued",
				errorMessage: undefined,
				attemptCount: 2,
				completedAt: undefined,
			}),
		);
		expect(runAfter).toHaveBeenCalledTimes(2);
		expect(runAfter.mock.calls[0]?.[2]).toMatchObject({
			stripeEventId: "evt_stale",
			eventType: "checkout.session.completed",
			sessionId: "cs_stale",
			attemptCount: 2,
		});
	});
});
