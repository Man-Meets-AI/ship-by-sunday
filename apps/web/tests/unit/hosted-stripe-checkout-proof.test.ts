import { describe, expect, it } from "vitest";

import {
	buildHostedProofAccessDebugArgs,
	buildHostedProofCheckoutSessionParams,
	buildHostedProofCouponParams,
	buildHostedProofSignInPath,
	EXPRESS_CHECKOUT_ROUTE_PATH,
	HOMEPAGE_CHECKOUT_PROOF_PATH,
	isExpressCheckoutRouteUrl,
} from "../../scripts/lib/hosted-stripe-checkout-proof.mjs";

describe("hosted Stripe checkout proof helpers", () => {
	it("builds a one-time zero-cost coupon", () => {
		const coupon = buildHostedProofCouponParams({
			now: 1_700_000_000_000,
			runLabel: "prod-123",
		});

		expect(coupon).toMatchObject({
			duration: "once",
			max_redemptions: 1,
			metadata: {
				qaBillingProof: "hosted_direct_checkout",
				runLabel: "prod-123",
			},
			name: "QA proof prod-123",
			percent_off: 100,
			redeem_by: 1_700_000_900,
		});
	});

	it("builds the direct discounted checkout session for the hosted proof", () => {
		const session = buildHostedProofCheckoutSessionParams({
			appBaseUrl: "https://www.man-meets-ai.com/",
			checkoutEmail: "buyer@example.com",
			clerkUserId: "user_123",
			couponId: "coupon_123",
			courseSlug: "ship-by-sunday",
			priceId: "price_123",
		});

		expect(session).toEqual({
			billing_address_collection: "auto",
			cancel_url: "https://www.man-meets-ai.com/checkout/cancel",
			client_reference_id: "user_123",
			customer_email: "buyer@example.com",
			discounts: [{ coupon: "coupon_123" }],
			line_items: [{ price: "price_123", quantity: 1 }],
			metadata: {
				clerkUserId: "user_123",
				courseSlug: "ship-by-sunday",
			},
			mode: "payment",
			payment_intent_data: {
				metadata: {
					clerkUserId: "user_123",
					courseSlug: "ship-by-sunday",
				},
			},
			success_url:
				"https://www.man-meets-ai.com/checkout/success?session_id={CHECKOUT_SESSION_ID}",
		});
	});

	it("builds the hosted proof sign-in path", () => {
		expect(buildHostedProofSignInPath({})).toBe(
			"/sign-in?redirect_url=%2Fworkspace%2Fchoose",
		);
	});

	it("keeps the checkout session id in the hosted proof access debug query", () => {
		expect(
			buildHostedProofAccessDebugArgs({
				clerkUserId: "user_123",
				sessionId: "cs_live_123",
			}),
		).toEqual({
			clerkUserId: "user_123",
			stripeCheckoutSessionId: "cs_live_123",
		});
	});

	it("identifies homepage Express Checkout route requests", () => {
		expect(HOMEPAGE_CHECKOUT_PROOF_PATH).toBe("/?marketing=1");
		expect(EXPRESS_CHECKOUT_ROUTE_PATH).toBe("/api/stripe/checkout/express");
		expect(
			isExpressCheckoutRouteUrl(
				"https://www.man-meets-ai.com/api/stripe/checkout/express",
				"https://www.man-meets-ai.com",
			),
		).toBe(true);
		expect(
			isExpressCheckoutRouteUrl(
				"https://www.man-meets-ai.com/api/stripe/checkout",
				"https://www.man-meets-ai.com",
			),
		).toBe(false);
	});
});
