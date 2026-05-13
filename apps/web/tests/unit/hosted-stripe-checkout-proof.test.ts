import { describe, expect, it } from "vitest";

import {
	assertHostedProofCheckoutSessionSafe,
	buildHostedBillingProofCheckoutButtonSelector,
	buildHostedBillingProofSuccessPathPattern,
	buildHostedProofAccessDebugArgs,
	buildHostedProofCheckoutSessionParams,
	buildHostedProofCouponParams,
	buildHostedProofSignInPath,
	getHostedBillingProofOffer,
	getHostedBillingProofStripePriceId,
	hostedProofCheckoutLineItemMatchesOffer,
	hostedProofAccessGrantMatchesOffer,
	EXPRESS_CHECKOUT_ROUTE_PATH,
	metadataMatchesHostedProofCheckoutSession,
	isHostedProofCheckoutSessionFulfilled,
	HOMEPAGE_CHECKOUT_PROOF_PATH,
	isExpressCheckoutRouteUrl,
	isLiveStripeSecretKey,
	shouldAllowHostedProofCardEntry,
} from "../../scripts/lib/hosted-stripe-checkout-proof.mjs";

describe("hosted Stripe checkout proof helpers", () => {
	it("resolves Starter as the default proof offer and Workers explicitly", () => {
		expect(getHostedBillingProofOffer()).toMatchObject({
			expectedAmountCents: 29_700,
			expectedCapabilities: ["generate_codebase", "tutorials"],
			id: "starter",
			protectedAccessPath: "/starter/generate-codebase",
			publicPath: "/starter",
			successPath: "/starter/home",
		});
		expect(getHostedBillingProofOffer("workers")).toMatchObject({
			expectedAmountCents: 60_000,
			expectedCapabilities: ["worker"],
			id: "workers",
			protectedAccessPath: "/workers/setup",
			publicPath: "/workers",
			successPath: "/workers/setup",
		});
		expect(() => getHostedBillingProofOffer("pro" as never)).toThrow(
			'Unsupported hosted billing proof offer "pro". Expected one of starter, workers.',
		);
	});

	it("selects offer-specific Stripe price environment variables", () => {
		expect(
			getHostedBillingProofStripePriceId({
				STRIPE_PRICE_ID: " price_legacy_starter\n",
			}),
		).toBe("price_legacy_starter");
		expect(
			getHostedBillingProofStripePriceId(
				{
					STRIPE_STARTER_PRICE_ID: "price_starter",
					STRIPE_WORKERS_PRICE_ID: "price_workers",
				},
				"workers",
			),
		).toBe("price_workers");
		expect(() => getHostedBillingProofStripePriceId({}, "workers")).toThrow(
			"Missing STRIPE_WORKERS_PRICE_ID in environment. Hosted Workers billing proof needs a managed Workers price.",
		);
	});

	it("builds offer-specific route and checkout button selectors", () => {
		expect(
			buildHostedBillingProofSuccessPathPattern().test("/starter/home"),
		).toBe(true);
		expect(
			buildHostedBillingProofSuccessPathPattern("workers").test(
				"/workers/setup?welcome=checkout",
			),
		).toBe(true);
		expect(buildHostedBillingProofCheckoutButtonSelector("workers")).toBe(
			"[data-testid='workers-checkout-cta']",
		);
	});

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
			purchaseIntentId: "j123purchaseintent",
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
				accessProduct: "paid_app_access",
				app: "man_meets_ai",
				checkoutSurface: "hosted_checkout",
				clerkUserId: "user_123",
				metadataSchema: "mma_checkout_v1",
				offerId: "starter",
				purchaseIntentId: "j123purchaseintent",
			},
			mode: "payment",
			payment_intent_data: {
				metadata: {
					accessProduct: "paid_app_access",
					app: "man_meets_ai",
					checkoutSurface: "hosted_checkout",
					clerkUserId: "user_123",
					metadataSchema: "mma_checkout_v1",
					offerId: "starter",
					purchaseIntentId: "j123purchaseintent",
				},
			},
			success_url:
				"https://www.man-meets-ai.com/checkout/success?session_id={CHECKOUT_SESSION_ID}",
		});
	});

	it("builds Workers checkout metadata for the hosted proof", () => {
		const session = buildHostedProofCheckoutSessionParams({
			appBaseUrl: "https://www.man-meets-ai.com",
			checkoutEmail: "buyer@example.com",
			clerkUserId: "user_123",
			couponId: "coupon_123",
			offerId: "workers",
			purchaseIntentId: "j123purchaseintent",
			priceId: "price_workers",
		});

		expect(session.metadata).toMatchObject({
			accessProduct: "paid_app_access",
			app: "man_meets_ai",
			checkoutSurface: "hosted_checkout",
			clerkUserId: "user_123",
			metadataSchema: "mma_checkout_v1",
			offerId: "workers",
			purchaseIntentId: "j123purchaseintent",
		});
		expect(session.payment_intent_data.metadata).toEqual(session.metadata);
		expect(session.line_items).toEqual([
			{
				price: "price_workers",
				quantity: 1,
			},
		]);
	});

	it("matches hosted proof metadata and offer-specific access grants", () => {
		const sessionMetadata = {
			accessProduct: "paid_app_access",
			app: "man_meets_ai",
			checkoutSurface: "hosted_checkout",
			metadataSchema: "mma_checkout_v1",
			offerId: "workers",
			purchaseIntentId: "purchase_123",
		};

		expect(
			metadataMatchesHostedProofCheckoutSession({
				offerId: "workers",
				paymentIntentMetadata: sessionMetadata,
				sessionMetadata,
			}),
		).toBe(true);
		expect(
			hostedProofAccessGrantMatchesOffer(
				{
					capabilities: ["worker"],
					lastCheckoutOfferId: "workers",
					source: "stripe_webhook",
					status: "granted",
					stripeCheckoutSessionId: "cs_test_123",
				},
				"workers",
			),
		).toBe(true);
		expect(
			hostedProofAccessGrantMatchesOffer(
				{
					capabilities: ["generate_codebase", "tutorials"],
					lastCheckoutOfferId: "starter",
					source: "stripe_webhook",
					status: "granted",
					stripeCheckoutSessionId: "cs_test_123",
				},
				"workers",
			),
		).toBe(false);
	});

	it("matches offer-specific line item amounts", () => {
		expect(
			hostedProofCheckoutLineItemMatchesOffer(
				{
					amount_subtotal: 60_000,
				},
				"workers",
			),
		).toBe(true);
		expect(
			hostedProofCheckoutLineItemMatchesOffer(
				{
					amount_subtotal: 29_700,
				},
				"workers",
			),
		).toBe(false);
	});

	it("builds the hosted proof sign-in path", () => {
		expect(buildHostedProofSignInPath({})).toBe(
			"/sign-in?redirect_url=%2Fstarter%2Fhome",
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
		expect(HOMEPAGE_CHECKOUT_PROOF_PATH).toBe("/starter");
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

	it("keeps live production proof on the zero-cost no-card path", () => {
		expect(isLiveStripeSecretKey("sk_live_123")).toBe(true);
		expect(isLiveStripeSecretKey("rk_live_123")).toBe(true);
		expect(isLiveStripeSecretKey("sk_test_123")).toBe(false);
		expect(isLiveStripeSecretKey("rk_test_123")).toBe(false);
		expect(shouldAllowHostedProofCardEntry(true)).toBe(false);
		expect(shouldAllowHostedProofCardEntry(false)).toBe(true);
		expect(() =>
			assertHostedProofCheckoutSessionSafe({
				checkoutSession: {
					amount_total: 100,
					id: "cs_live_non_zero",
				},
				isLiveStripeMode: true,
			}),
		).toThrow(
			"Live hosted billing proof requires a zero-cost Checkout Session before navigation. Session cs_live_non_zero amount_total=100.",
		);
		expect(() =>
			assertHostedProofCheckoutSessionSafe({
				checkoutSession: {
					amount_total: 0,
					id: "cs_live_zero",
				},
				isLiveStripeMode: true,
			}),
		).not.toThrow();
		expect(
			isHostedProofCheckoutSessionFulfilled({
				amount_total: 0,
				payment_status: "paid",
				status: "complete",
			}),
		).toBe(true);
		expect(
			isHostedProofCheckoutSessionFulfilled({
				amount_total: 0,
				payment_status: "no_payment_required",
				status: "complete",
			}),
		).toBe(true);
		expect(
			isHostedProofCheckoutSessionFulfilled({
				amount_total: 0,
				payment_status: "unpaid",
				status: "complete",
			}),
		).toBe(false);
	});
});
