import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const hostedCheckoutMetadata = {
	metadataSchema: "mma_checkout_v1",
	app: "man_meets_ai",
	accessProduct: "paid_app_access",
	purchaseIntentId: "purchase_intent_123",
	checkoutSurface: "hosted_checkout",
} as const;

const expressCheckoutMetadata = {
	...hostedCheckoutMetadata,
	checkoutSurface: "express_checkout",
} as const;

describe("buildStripeCheckoutSessionCreateParams", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = {
			...originalEnv,
			STRIPE_PRICE_ID: "price_250_managed",
			STRIPE_PROMOTION_CODE_ID: "promo_50_off",
		};
		vi.resetModules();
	});

	afterEach(() => {
		process.env = { ...originalEnv };
		vi.restoreAllMocks();
	});

	it("builds the signed-in checkout handoff with the active promotion code", async () => {
		const { buildStripeCheckoutSessionCreateParams } =
			await import("@/platform/billing/checkout/checkout-session-params");

		expect(
			buildStripeCheckoutSessionCreateParams({
				appBaseUrl: "https://app.example.com",
				clerkUserId: "user_123",
				customerEmail: "buyer@example.com",
				purchaseIntentId: hostedCheckoutMetadata.purchaseIntentId,
			}),
		).toEqual({
			mode: "payment",
			billing_address_collection: "auto",
			customer_creation: "always",
			cancel_url: "https://app.example.com/checkout/cancel",
			success_url:
				"https://app.example.com/checkout/success?session_id={CHECKOUT_SESSION_ID}",
			client_reference_id: "user_123",
			customer_email: "buyer@example.com",
			discounts: [{ promotion_code: "promo_50_off" }],
			line_items: [{ price: "price_250_managed", quantity: 1 }],
			metadata: {
				...hostedCheckoutMetadata,
				clerkUserId: "user_123",
			},
			payment_intent_data: {
				metadata: {
					...hostedCheckoutMetadata,
					clerkUserId: "user_123",
				},
			},
		});
	});

	it("builds guest checkout metadata without account handoff fields", async () => {
		const { buildStripeCheckoutSessionCreateParams } =
			await import("@/platform/billing/checkout/checkout-session-params");

		const params = buildStripeCheckoutSessionCreateParams({
			appBaseUrl: "https://app.example.com",
			clerkUserId: null,
			customerEmail: null,
			purchaseIntentId: hostedCheckoutMetadata.purchaseIntentId,
		});

		expect(params).toMatchObject({
			client_reference_id: undefined,
			customer_creation: "always",
			customer_email: undefined,
			discounts: [{ promotion_code: "promo_50_off" }],
			metadata: hostedCheckoutMetadata,
			payment_intent_data: {
				metadata: hostedCheckoutMetadata,
			},
		});
		expect(params).not.toHaveProperty("allow_promotion_codes");
		expect(params.metadata).not.toHaveProperty("clerkUserId");
		expect(params.payment_intent_data?.metadata).not.toHaveProperty(
			"clerkUserId",
		);
	});

	it("builds an express checkout session for custom UI", async () => {
		const { buildStripeExpressCheckoutSessionCreateParams } =
			await import("@/platform/billing/checkout/checkout-session-params");

		expect(
			buildStripeExpressCheckoutSessionCreateParams({
				appBaseUrl: "https://app.example.com",
				clerkUserId: "user_123",
				customerEmail: "buyer@example.com",
				purchaseIntentId: expressCheckoutMetadata.purchaseIntentId,
			}),
		).toEqual({
			mode: "payment",
			ui_mode: "custom",
			billing_address_collection: "auto",
			customer_creation: "always",
			return_url:
				"https://app.example.com/checkout/success?session_id={CHECKOUT_SESSION_ID}",
			client_reference_id: "user_123",
			customer_email: "buyer@example.com",
			discounts: [{ promotion_code: "promo_50_off" }],
			line_items: [{ price: "price_250_managed", quantity: 1 }],
			metadata: {
				...expressCheckoutMetadata,
				clerkUserId: "user_123",
			},
			payment_intent_data: {
				metadata: {
					...expressCheckoutMetadata,
					clerkUserId: "user_123",
				},
			},
		});
	});

	it("does not write checkout path intent metadata for new sessions", async () => {
		const { buildStripeCheckoutSessionCreateParams } =
			await import("@/platform/billing/checkout/checkout-session-params");

		const params = buildStripeCheckoutSessionCreateParams({
			appBaseUrl: "https://app.example.com",
			clerkUserId: null,
			customerEmail: null,
			purchaseIntentId: hostedCheckoutMetadata.purchaseIntentId,
		});

		expect(params.metadata).toEqual(hostedCheckoutMetadata);
		expect(params.payment_intent_data?.metadata).toEqual(
			hostedCheckoutMetadata,
		);
		expect(params.metadata).not.toHaveProperty("courseSlug");
		expect(params.metadata).not.toHaveProperty("buyerStartingPoint");
		expect(params.metadata).not.toHaveProperty("checkoutCtaId");
		expect(params.metadata).not.toHaveProperty("fulfillmentTrack");
	});
});
