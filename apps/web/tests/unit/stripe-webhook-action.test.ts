import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const constructEventMock = vi.fn();
const retrieveSessionMock = vi.fn();
const stripeConstructorArgs: Array<Array<unknown>> = [];

class StripeMock {
	webhooks = {
		constructEvent: constructEventMock,
	};
	checkout = {
		sessions: {
			retrieve: retrieveSessionMock,
		},
	};

	constructor(...args: Array<unknown>) {
		stripeConstructorArgs.push(args);
	}
}

vi.mock("stripe", () => ({
	default: StripeMock,
}));

type StripeWebhookLedgerBeginResult =
	| {
			decision: "process";
			attemptCount: number;
	  }
	| {
			decision: "skip";
			status: string;
			resultKind: string | null;
	  };

function createWebhookRunMutationMock({
	beginResult = { decision: "process", attemptCount: 1 },
	grantResult = { granted: "inserted" },
	grantError,
}: {
	beginResult?: StripeWebhookLedgerBeginResult;
	grantResult?: { granted: "inserted" | "patched" };
	grantError?: Error;
} = {}) {
	return vi.fn(async (_ref: unknown, args: Record<string, unknown>) => {
		if ("status" in args && "resultKind" in args) {
			return { recorded: "patched" };
		}

		if ("stripeEventId" in args) {
			return beginResult;
		}

		if ("clerkUserId" in args) {
			if (grantError) {
				throw grantError;
			}

			return grantResult;
		}

		throw new Error(`Unexpected mutation args: ${JSON.stringify(args)}`);
	});
}

describe("convex/stripeWebhook", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = {
			...originalEnv,
			STRIPE_SECRET_KEY: "sk_test_123",
			STRIPE_WEBHOOK_SECRET: "whsec_test_123",
		};
		constructEventMock.mockReset();
		retrieveSessionMock.mockReset();
		stripeConstructorArgs.length = 0;
		vi.resetModules();
	});

	afterEach(() => {
		process.env = { ...originalEnv };
		vi.restoreAllMocks();
	});

	it("returns invalid_signature when Stripe verification fails", async () => {
		constructEventMock.mockImplementation(() => {
			throw new Error("Signature verification failed");
		});
		const runMutation = vi.fn();
		const { processStripeWebhook } = await import("@/convex/stripeWebhook");

		const result = await processStripeWebhook._handler(
			{ runMutation } as never,
			{
				body: "raw-webhook-body",
				signature: "t=1,v1=signature",
			},
		);

		expect(result).toEqual({
			kind: "invalid_signature",
			message: "Signature verification failed",
		});
		expect(runMutation).not.toHaveBeenCalled();
	});

	it("ignores unrelated webhook events", async () => {
		constructEventMock.mockReturnValue({
			id: "evt_ignored",
			type: "customer.subscription.updated",
			data: { object: {} },
		});
		const runMutation = vi.fn();
		const { processStripeWebhook } = await import("@/convex/stripeWebhook");

		const result = await processStripeWebhook._handler(
			{ runMutation } as never,
			{
				body: "raw-webhook-body",
				signature: "t=1,v1=signature",
			},
		);

		expect(result).toEqual({
			kind: "ignored",
			eventId: "evt_ignored",
			eventType: "customer.subscription.updated",
		});
		expect(runMutation).not.toHaveBeenCalled();
	});

	it("queues checkout-email fulfillment when the buyer email exists", async () => {
		constructEventMock.mockReturnValue({
			id: "evt_pending_claim",
			type: "checkout.session.completed",
			data: {
				object: {
					id: "cs_test_123",
					client_reference_id: null,
					metadata: {
						courseSlug: "ship-by-sunday",
					},
					customer_details: {
						email: "buyer@example.com",
					},
					payment_status: "paid",
				},
			},
		});
		const runMutation = createWebhookRunMutationMock();
		const runAction = vi.fn().mockResolvedValue({
			kind: "fulfilled",
			sessionId: "cs_test_123",
			checkoutEmail: "buyer@example.com",
			clerkUserId: "user_from_email",
			clerkUserStatus: "exists",
			grantResult: {
				granted: "inserted",
			},
		});
		const { processStripeWebhook } = await import("@/convex/stripeWebhook");

		const result = await processStripeWebhook._handler(
			{ runMutation, runAction } as never,
			{
				body: "raw-webhook-body",
				signature: "t=1,v1=signature",
			},
		);

		expect(result).toEqual({
			kind: "queued",
			eventId: "evt_pending_claim",
			eventType: "checkout.session.completed",
			sessionId: "cs_test_123",
		});
		expect(runAction).not.toHaveBeenCalled();
		expect(runMutation).toHaveBeenCalledWith(expect.anything(), {
			stripeEventId: "evt_pending_claim",
			eventType: "checkout.session.completed",
			stripeObjectId: "cs_test_123",
			courseSlug: "ship-by-sunday",
		});
		expect(runMutation).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				stripeEventId: "evt_pending_claim",
				stripeObjectId: "cs_test_123",
				attemptCount: 1,
			}),
		);
	});

	it("ignores checkout sessions missing course metadata", async () => {
		constructEventMock.mockReturnValue({
			id: "evt_missing_course",
			type: "checkout.session.completed",
			data: {
				object: {
					id: "cs_test_123",
					client_reference_id: null,
					metadata: {},
					customer_details: {
						email: "buyer@example.com",
					},
					payment_status: "paid",
				},
			},
		});
		const runMutation = vi.fn();
		const runAction = vi.fn();
		const { processStripeWebhook } = await import("@/convex/stripeWebhook");

		const result = await processStripeWebhook._handler(
			{ runMutation, runAction } as never,
			{
				body: "raw-webhook-body",
				signature: "t=1,v1=signature",
			},
		);

		expect(result).toEqual({
			kind: "ignored",
			eventId: "evt_missing_course",
			eventType: "checkout.session.completed",
		});
		expect(runAction).not.toHaveBeenCalled();
		expect(runMutation).not.toHaveBeenCalled();
	});

	it("queues guest checkout sessions before checking recoverable buyer email", async () => {
		constructEventMock.mockReturnValue({
			id: "evt_missing_email",
			type: "checkout.session.completed",
			data: {
				object: {
					id: "cs_test_123",
					client_reference_id: null,
					metadata: {
						courseSlug: "ship-by-sunday",
					},
					payment_status: "paid",
				},
			},
		});
		const runMutation = createWebhookRunMutationMock();
		const { processStripeWebhook } = await import("@/convex/stripeWebhook");

		const result = await processStripeWebhook._handler(
			{ runMutation } as never,
			{
				body: "raw-webhook-body",
				signature: "t=1,v1=signature",
			},
		);

		expect(result).toEqual({
			kind: "queued",
			eventId: "evt_missing_email",
			eventType: "checkout.session.completed",
			sessionId: "cs_test_123",
		});
		expect(runMutation).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				stripeEventId: "evt_missing_email",
				stripeObjectId: "cs_test_123",
				attemptCount: 1,
			}),
		);
	});

	it("accepts unpaid signed-in checkout completion without granting access", async () => {
		constructEventMock.mockReturnValue({
			id: "evt_pending_payment",
			type: "checkout.session.completed",
			data: {
				object: {
					id: "cs_test_pending",
					client_reference_id: "user_123",
					metadata: {
						clerkUserId: "user_123",
						courseSlug: "ship-by-sunday",
					},
					customer_details: {
						email: "buyer@example.com",
					},
					payment_status: "unpaid",
				},
			},
		});
		const runMutation = createWebhookRunMutationMock();
		const runAction = vi.fn();
		const { processStripeWebhook } = await import("@/convex/stripeWebhook");

		const result = await processStripeWebhook._handler(
			{ runMutation, runAction } as never,
			{
				body: "raw-webhook-body",
				signature: "t=1,v1=signature",
			},
		);

		expect(result).toEqual({
			kind: "payment_pending",
			eventId: "evt_pending_payment",
			eventType: "checkout.session.completed",
			sessionId: "cs_test_pending",
			paymentStatus: "unpaid",
		});
		expect(runMutation).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				stripeEventId: "evt_pending_payment",
				status: "payment_pending",
				resultKind: "payment_pending",
			}),
		);
		expect(runAction).not.toHaveBeenCalled();
	});

	it("does not grant setup-mode Checkout Sessions that require no payment", async () => {
		constructEventMock.mockReturnValue({
			id: "evt_setup_mode",
			type: "checkout.session.completed",
			data: {
				object: {
					id: "cs_test_setup",
					client_reference_id: "user_123",
					mode: "setup",
					metadata: {
						clerkUserId: "user_123",
						courseSlug: "ship-by-sunday",
					},
					payment_status: "no_payment_required",
				},
			},
		});
		const runMutation = createWebhookRunMutationMock();
		const { processStripeWebhook } = await import("@/convex/stripeWebhook");

		const result = await processStripeWebhook._handler(
			{ runMutation } as never,
			{
				body: "raw-webhook-body",
				signature: "t=1,v1=signature",
			},
		);

		expect(result).toEqual({
			kind: "payment_pending",
			eventId: "evt_setup_mode",
			eventType: "checkout.session.completed",
			sessionId: "cs_test_setup",
			paymentStatus: "no_payment_required",
		});
		expect(runMutation).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				stripeEventId: "evt_setup_mode",
				status: "payment_pending",
				resultKind: "payment_pending",
			}),
		);
	});

	it("skips a terminal duplicate Stripe event without repeating fulfillment", async () => {
		constructEventMock.mockReturnValue({
			id: "evt_duplicate",
			type: "checkout.session.completed",
			data: {
				object: {
					id: "cs_test_duplicate",
					client_reference_id: "user_123",
					metadata: {
						clerkUserId: "user_123",
						courseSlug: "ship-by-sunday",
					},
					payment_status: "paid",
				},
			},
		});
		const runMutation = createWebhookRunMutationMock({
			beginResult: {
				decision: "skip",
				status: "processed",
				resultKind: "granted",
			},
		});
		const runAction = vi.fn();
		const { processStripeWebhook } = await import("@/convex/stripeWebhook");

		const result = await processStripeWebhook._handler(
			{ runMutation, runAction } as never,
			{
				body: "raw-webhook-body",
				signature: "t=1,v1=signature",
			},
		);

		expect(result).toEqual({
			kind: "duplicate",
			eventId: "evt_duplicate",
			eventType: "checkout.session.completed",
			sessionId: "cs_test_duplicate",
			status: "processed",
			resultKind: "granted",
		});
		expect(runAction).not.toHaveBeenCalled();
		expect(runMutation).toHaveBeenCalledTimes(1);
		expect(runMutation).toHaveBeenCalledWith(expect.anything(), {
			stripeEventId: "evt_duplicate",
			eventType: "checkout.session.completed",
			stripeObjectId: "cs_test_duplicate",
			courseSlug: "ship-by-sunday",
		});
	});

	it.each([
		"checkout.session.completed",
		"checkout.session.async_payment_succeeded",
	] as const)(
		"fulfills queued product access for %s events",
		async (eventType) => {
			retrieveSessionMock.mockResolvedValue({
				id: "cs_test_123",
				client_reference_id: "user_123",
				metadata: {
					buyerStartingPoint: "existing_codebase",
					checkoutCtaId: "codebase_demo_existing",
					clerkUserId: "user_123",
					courseSlug: "ship-by-sunday",
					fulfillmentTrack: "existing_codebase_doctor",
				},
				customer: "cus_123",
				payment_intent: "pi_123",
				payment_status: "paid",
			});
			const runMutation = createWebhookRunMutationMock();
			const { fulfillQueuedStripeWebhookEvent } =
				await import("@/convex/stripeWebhook");

			const result = await fulfillQueuedStripeWebhookEvent._handler(
				{ runMutation } as never,
				{
					stripeEventId: "evt_grant",
					eventType,
					sessionId: "cs_test_123",
					attemptCount: 1,
				},
			);

			expect(result).toEqual({
				kind: "granted",
				eventId: "evt_grant",
				eventType,
				clerkUserId: "user_123",
				grantResult: { granted: "inserted" },
			});
			expect(runMutation).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					clerkUserId: "user_123",
					stripeCheckoutSessionId: "cs_test_123",
					stripeCustomerId: "cus_123",
					stripePaymentIntentId: "pi_123",
					buyerStartingPoint: "existing_codebase",
					checkoutCtaId: "codebase_demo_existing",
					fulfillmentTrack: "existing_codebase_doctor",
				}),
			);
			expect(runMutation).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					stripeEventId: "evt_grant",
					status: "processed",
					resultKind: "granted",
				}),
			);
			expect(stripeConstructorArgs).toEqual([
				[
					"sk_test_123",
					{
						apiVersion: "2026-02-25.clover",
					},
				],
			]);
		},
	);

	it("surfaces persistence failures from the internal grant mutation", async () => {
		retrieveSessionMock.mockResolvedValue({
			id: "cs_test_123",
			client_reference_id: "user_123",
			metadata: {
				clerkUserId: "user_123",
				courseSlug: "ship-by-sunday",
			},
			payment_status: "paid",
		});
		const runMutation = createWebhookRunMutationMock({
			grantError: new Error("convex unavailable"),
		});
		const runAfter = vi.fn();
		const { fulfillQueuedStripeWebhookEvent } =
			await import("@/convex/stripeWebhook");

		const result = await fulfillQueuedStripeWebhookEvent._handler(
			{ runMutation, scheduler: { runAfter } } as never,
			{
				stripeEventId: "evt_failure",
				eventType: "checkout.session.completed",
				sessionId: "cs_test_123",
				attemptCount: 1,
			},
		);

		expect(result).toEqual({
			kind: "grant_failed",
			eventId: "evt_failure",
			eventType: "checkout.session.completed",
			sessionId: "cs_test_123",
			clerkUserId: "user_123",
			stripeCustomerId: null,
			stripePaymentIntentId: null,
			message: "convex unavailable",
		});
		expect(runMutation).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				stripeEventId: "evt_failure",
				status: "failed",
				resultKind: "grant_failed",
				errorMessage: "convex unavailable",
			}),
		);
		expect(runAfter).toHaveBeenCalledWith(
			30_000,
			expect.anything(),
			expect.objectContaining({
				stripeEventId: "evt_failure",
				eventType: "checkout.session.completed",
				sessionId: "cs_test_123",
				failedAttemptCount: 1,
			}),
		);
	});
});
