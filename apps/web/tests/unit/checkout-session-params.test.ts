import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { productConfig } from "@/config/product";

vi.mock("server-only", () => ({}));

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
			await import("@/features/checkout/server/checkout-session-params");

		expect(
			buildStripeCheckoutSessionCreateParams({
				appBaseUrl: "https://app.example.com",
				clerkUserId: "user_123",
				customerEmail: "buyer@example.com",
			}),
		).toEqual({
			mode: "payment",
			billing_address_collection: "auto",
			cancel_url: "https://app.example.com/checkout/cancel",
			success_url:
				"https://app.example.com/checkout/success?session_id={CHECKOUT_SESSION_ID}",
			client_reference_id: "user_123",
			customer_email: "buyer@example.com",
			discounts: [{ promotion_code: "promo_50_off" }],
			line_items: [{ price: "price_250_managed", quantity: 1 }],
			metadata: {
				clerkUserId: "user_123",
				courseSlug: productConfig.courseSlug,
			},
			payment_intent_data: {
				metadata: {
					clerkUserId: "user_123",
					courseSlug: productConfig.courseSlug,
				},
			},
		});
	});

	it("builds guest checkout metadata without account handoff fields", async () => {
		const { buildStripeCheckoutSessionCreateParams } =
			await import("@/features/checkout/server/checkout-session-params");

		const params = buildStripeCheckoutSessionCreateParams({
			appBaseUrl: "https://app.example.com",
			clerkUserId: null,
			customerEmail: null,
		});

		expect(params).toMatchObject({
			client_reference_id: undefined,
			customer_email: undefined,
			discounts: [{ promotion_code: "promo_50_off" }],
			metadata: {
				courseSlug: productConfig.courseSlug,
			},
			payment_intent_data: {
				metadata: {
					courseSlug: productConfig.courseSlug,
				},
			},
		});
		expect(params).not.toHaveProperty("allow_promotion_codes");
		expect(params.metadata).not.toHaveProperty("clerkUserId");
		expect(params.payment_intent_data?.metadata).not.toHaveProperty(
			"clerkUserId",
		);
	});
});
