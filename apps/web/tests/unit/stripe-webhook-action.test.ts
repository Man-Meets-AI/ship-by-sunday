import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const constructEventMock = vi.fn();
const stripeConstructorArgs: Array<Array<unknown>> = [];

class StripeMock {
	webhooks = {
		constructEvent: constructEventMock,
	};

	constructor(...args: Array<unknown>) {
		stripeConstructorArgs.push(args);
	}
}

vi.mock("stripe", () => ({
	default: StripeMock,
}));

describe("convex/stripeWebhook", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = {
			...originalEnv,
			STRIPE_SECRET_KEY: "sk_test_123",
			STRIPE_WEBHOOK_SECRET: "whsec_test_123",
		};
		constructEventMock.mockReset();
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

	it("fulfills access by checkout email when checkout metadata is incomplete but the buyer email exists", async () => {
		constructEventMock.mockReturnValue({
			id: "evt_pending_claim",
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
			kind: "granted",
			eventId: "evt_pending_claim",
			eventType: "checkout.session.completed",
			clerkUserId: "user_from_email",
			grantResult: {
				granted: "inserted",
			},
		});
		expect(runAction).toHaveBeenCalledWith(expect.anything(), {
			sessionId: "cs_test_123",
			stripeEventId: "evt_pending_claim",
			stripeEventType: "checkout.session.completed",
		});
		expect(runMutation).not.toHaveBeenCalled();
	});

	it("returns missing_checkout_email when a guest checkout session has no recoverable buyer email", async () => {
		constructEventMock.mockReturnValue({
			id: "evt_missing_email",
			type: "checkout.session.completed",
			data: {
				object: {
					id: "cs_test_123",
					client_reference_id: null,
					metadata: {},
				},
			},
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
			kind: "missing_checkout_email",
			eventId: "evt_missing_email",
			eventType: "checkout.session.completed",
			sessionId: "cs_test_123",
		});
		expect(runMutation).not.toHaveBeenCalled();
	});

	it.each([
		"checkout.session.completed",
		"checkout.session.async_payment_succeeded",
	] as const)("grants product access for %s events", async (eventType) => {
		constructEventMock.mockReturnValue({
			id: "evt_grant",
			type: eventType,
			data: {
				object: {
					id: "cs_test_123",
					client_reference_id: "user_123",
					metadata: {
						clerkUserId: "user_123",
					},
					customer: "cus_123",
					payment_intent: "pi_123",
				},
			},
		});
		const runMutation = vi.fn().mockResolvedValue({ granted: "inserted" });
		const { processStripeWebhook } = await import("@/convex/stripeWebhook");

		const result = await processStripeWebhook._handler(
			{ runMutation } as never,
			{
				body: "raw-webhook-body",
				signature: "t=1,v1=signature",
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
	});

	it("surfaces persistence failures from the internal grant mutation", async () => {
		constructEventMock.mockReturnValue({
			id: "evt_failure",
			type: "checkout.session.completed",
			data: {
				object: {
					id: "cs_test_123",
					client_reference_id: "user_123",
					metadata: {
						clerkUserId: "user_123",
					},
				},
			},
		});
		const runMutation = vi
			.fn()
			.mockRejectedValue(new Error("convex unavailable"));
		const { processStripeWebhook } = await import("@/convex/stripeWebhook");

		const result = await processStripeWebhook._handler(
			{ runMutation } as never,
			{
				body: "raw-webhook-body",
				signature: "t=1,v1=signature",
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
	});
});
