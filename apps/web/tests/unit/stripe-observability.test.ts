import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("stripe observability helpers", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = {
			...originalEnv,
			STRIPE_SECRET_KEY: "sk_test_123",
			STRIPE_PRODUCT_ID: "prod_123",
			STRIPE_PRICE_ID: "price_123",
		};
		vi.resetModules();
	});

	afterEach(() => {
		process.env = { ...originalEnv };
		vi.restoreAllMocks();
	});

	it("builds test-mode Stripe dashboard URLs", async () => {
		const {
			getStripeDashboardUrl,
			getStripeEventDashboardUrl,
			getStripeModeLabel,
			getStripeProductDashboardUrl,
			getStripeWebhookDashboardUrl,
		} = await import("@/platform/billing/stripe");

		expect(getStripeModeLabel()).toBe("test");
		expect(getStripeDashboardUrl("events")).toBe(
			"https://dashboard.stripe.com/test/events",
		);
		expect(getStripeEventDashboardUrl("evt_123")).toBe(
			"https://dashboard.stripe.com/test/events/evt_123",
		);
		expect(getStripeWebhookDashboardUrl()).toBe(
			"https://dashboard.stripe.com/test/webhooks",
		);
		expect(getStripeProductDashboardUrl()).toBe(
			"https://dashboard.stripe.com/test/products/prod_123",
		);
	});

	it("builds checkout failure context with configuration details", async () => {
		const { buildStripeCheckoutFailureContext } =
			await import("@/platform/observability/source-adapters/stripe-failure");

		const context = buildStripeCheckoutFailureContext({
			appBaseUrl: "https://www.man-meets-ai.com",
			userId: "user_123",
		});

		expect(context.nativeUrl).toBe(
			"https://dashboard.stripe.com/test/products/prod_123",
		);
		expect(context.logsUrl).toBe("https://dashboard.stripe.com/test/events");
		expect(context.details).toMatchObject({
			clerkUserId: "user_123",
			courseSlug: "ship-by-sunday",
			stripeMode: "test",
			stripePriceId: "price_123",
			stripeProductId: "prod_123",
		});
	});

	it("maps Stripe webhook failures to event-aware incidents", async () => {
		const { buildStripeWebhookResultIncident } =
			await import("@/platform/observability/source-adapters/stripe-failure");

		const invalidSignatureIncident = buildStripeWebhookResultIncident({
			kind: "invalid_signature",
			message: "No signatures found.",
		});
		const missingCheckoutEmailIncident = buildStripeWebhookResultIncident({
			kind: "missing_checkout_email",
			eventId: "evt_123",
			eventType: "checkout.session.completed",
			sessionId: "cs_123",
		});
		const grantFailedIncident = buildStripeWebhookResultIncident({
			kind: "grant_failed",
			eventId: "evt_456",
			eventType: "checkout.session.completed",
			sessionId: "cs_456",
			clerkUserId: "user_456",
			stripeCustomerId: "cus_456",
			stripePaymentIntentId: "pi_456",
			message: "convex unavailable",
		});
		const fulfillmentFailedIncident = buildStripeWebhookResultIncident({
			kind: "fulfillment_failed",
			eventId: "evt_789",
			eventType: "checkout.session.completed",
			sessionId: "cs_789",
			message: "Clerk unavailable",
		});

		expect(invalidSignatureIncident).toMatchObject({
			code: "stripe_webhook_invalid_signature",
			nativeUrl: "https://dashboard.stripe.com/test/webhooks",
			logsUrl: "https://dashboard.stripe.com/test/events",
		});
		expect(invalidSignatureIncident.details).toMatchObject({
			verifierMessage: "No signatures found.",
		});
		expect(missingCheckoutEmailIncident).toMatchObject({
			code: "stripe_webhook_missing_checkout_email",
			externalEventId: "evt_123",
			nativeUrl: "https://dashboard.stripe.com/test/events/evt_123",
		});
		expect(grantFailedIncident).toMatchObject({
			code: "stripe_webhook_grant_failed",
			externalEventId: "evt_456",
			userId: "user_456",
			logsUrl: "https://dashboard.stripe.com/test/events/evt_456",
		});
		expect(grantFailedIncident.details).toMatchObject({
			stripeCustomerId: "cus_456",
			stripePaymentIntentId: "pi_456",
		});
		expect(fulfillmentFailedIncident).toMatchObject({
			code: "stripe_webhook_fulfillment_failed",
			externalEventId: "evt_789",
			nativeUrl: "https://dashboard.stripe.com/test/events/evt_789",
		});
		expect(fulfillmentFailedIncident.details).toMatchObject({
			fulfillmentMessage: "Clerk unavailable",
			sessionId: "cs_789",
		});
	});

	it("infers live mode from live Stripe secret keys", async () => {
		process.env = {
			...originalEnv,
			STRIPE_SECRET_KEY: "sk_live_123",
		};
		vi.resetModules();

		const { getStripeModeLabel } = await import("@/platform/billing/stripe");

		expect(getStripeModeLabel()).toBe("live");
	});
});
