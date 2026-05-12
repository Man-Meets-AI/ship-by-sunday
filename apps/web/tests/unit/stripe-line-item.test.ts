import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { productConfig } from "@/config/product";

vi.mock("server-only", () => ({}));

describe("getStripeLineItem", () => {
	const originalEnv = { ...process.env };
	const expectedConvexWebhookUrl = "https://convex-site.example/stripe/webhook";
	const staleAppOriginWebhookUrl = "https://www.example.com/api/stripe/webhook";

	function setWebhookPreflightEnv({
		secretKey = "sk_live_123",
	}: {
		secretKey?: string;
	} = {}) {
		process.env.APP_BASE_URL = "https://www.example.com";
		process.env.NEXT_PUBLIC_CONVEX_SITE_URL = "https://convex-site.example";
		process.env.STRIPE_SECRET_KEY = secretKey;
		process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_123";
	}

	function buildWebhookEndpoint(
		overrides: Partial<Stripe.WebhookEndpoint> = {},
	): Stripe.WebhookEndpoint {
		return {
			api_version: "2026-02-25.clover",
			application: null,
			created: 1_700_000_000,
			description: null,
			enabled_events: [
				"checkout.session.completed",
				"checkout.session.async_payment_succeeded",
			],
			id: "we_ready",
			livemode: true,
			metadata: {},
			object: "webhook_endpoint",
			status: "enabled",
			url: expectedConvexWebhookUrl,
			...overrides,
		};
	}

	function buildStripeWithWebhookEndpoints(
		endpoints: Stripe.WebhookEndpoint[],
	) {
		return {
			webhookEndpoints: {
				list: vi.fn().mockReturnValue({
					autoPagingToArray: vi.fn().mockResolvedValue(endpoints),
				}),
			},
		} as unknown as Stripe;
	}

	beforeEach(() => {
		process.env = {
			...originalEnv,
		};
		vi.resetModules();
	});

	afterEach(() => {
		process.env = { ...originalEnv };
		vi.restoreAllMocks();
	});

	it("returns the managed Stripe price when STRIPE_PRICE_ID is configured", async () => {
		process.env.STRIPE_PRICE_ID = "price_250_managed";

		const { getStripeLineItem } = await import("@/platform/billing/stripe");

		expect(getStripeLineItem()).toEqual({
			price: "price_250_managed",
			quantity: 1,
		});
	});

	it("normalizes trailing newline escapes on managed Stripe ids", async () => {
		process.env.STRIPE_PRICE_ID = "price_250_managed\\n";

		const { getStripeLineItem } = await import("@/platform/billing/stripe");

		expect(getStripeLineItem()).toEqual({
			price: "price_250_managed",
			quantity: 1,
		});
	});

	it("returns inline price data using the canonical product price when STRIPE_PRICE_ID is absent", async () => {
		delete process.env.STRIPE_PRICE_ID;

		const { getStripeLineItem } = await import("@/platform/billing/stripe");

		expect(getStripeLineItem()).toEqual({
			price_data: {
				currency: productConfig.currency,
				product_data: {
					name: productConfig.name,
					description: productConfig.promise,
				},
				unit_amount: productConfig.priceUsdCents,
			},
			quantity: 1,
		});
	});

	it("returns the active checkout discount when STRIPE_PROMOTION_CODE_ID is configured", async () => {
		process.env.STRIPE_PROMOTION_CODE_ID = "promo_50_off";

		const { getStripeCheckoutDiscounts } =
			await import("@/platform/billing/stripe");

		expect(getStripeCheckoutDiscounts()).toEqual([
			{
				promotion_code: "promo_50_off",
			},
		]);
	});

	it("requires a promotion code when the public pricing offer is active", async () => {
		delete process.env.STRIPE_PROMOTION_CODE_ID;

		const { getStripeCheckoutDiscounts } =
			await import("@/platform/billing/stripe");

		expect(() => getStripeCheckoutDiscounts()).toThrow(
			"Missing STRIPE_PROMOTION_CODE_ID. The active pricing offer requires an auto-applied Stripe promotion code.",
		);
	});

	it("rejects a managed Stripe price when its amount drifts from the canonical product config", async () => {
		process.env.STRIPE_PRICE_ID = "price_wrong_amount";
		process.env.STRIPE_PRODUCT_ID = "prod_correct";

		const { assertManagedStripePriceMatchesProductConfig } =
			await import("@/platform/billing/stripe");
		const stripe = {
			prices: {
				retrieve: vi.fn().mockResolvedValue({
					id: "price_wrong_amount",
					unit_amount: 25000,
					currency: productConfig.currency,
					product: "prod_correct",
				} satisfies Pick<
					Stripe.Price,
					"id" | "unit_amount" | "currency" | "product"
				>),
			},
		} as unknown as Stripe;

		await expect(
			assertManagedStripePriceMatchesProductConfig(stripe),
		).rejects.toThrow(
			`Configured Stripe price price_wrong_amount charges 25000 cents, expected ${productConfig.priceUsdCents}.`,
		);
	});

	it("accepts a managed Stripe price when its amount, currency, and product match config", async () => {
		process.env.STRIPE_PRICE_ID = "price_correct";
		process.env.STRIPE_PRODUCT_ID = "prod_correct";

		const { assertManagedStripePriceMatchesProductConfig } =
			await import("@/platform/billing/stripe");
		const stripe = {
			prices: {
				retrieve: vi.fn().mockResolvedValue({
					id: "price_correct",
					unit_amount: productConfig.priceUsdCents,
					currency: productConfig.currency,
					product: "prod_correct",
				} satisfies Pick<
					Stripe.Price,
					"id" | "unit_amount" | "currency" | "product"
				>),
			},
		} as unknown as Stripe;

		await expect(
			assertManagedStripePriceMatchesProductConfig(stripe),
		).resolves.toBeUndefined();
	});

	it("rejects a managed Stripe price when it belongs to the wrong product", async () => {
		process.env.STRIPE_PRICE_ID = "price_wrong_product";
		process.env.STRIPE_PRODUCT_ID = "prod_expected";

		const { assertManagedStripePriceMatchesProductConfig } =
			await import("@/platform/billing/stripe");
		const stripe = {
			prices: {
				retrieve: vi.fn().mockResolvedValue({
					id: "price_wrong_product",
					unit_amount: productConfig.priceUsdCents,
					currency: productConfig.currency,
					product: "prod_other",
				} satisfies Pick<
					Stripe.Price,
					"id" | "unit_amount" | "currency" | "product"
				>),
			},
		} as unknown as Stripe;

		await expect(
			assertManagedStripePriceMatchesProductConfig(stripe),
		).rejects.toThrow(
			"Configured Stripe price price_wrong_product belongs to prod_other, expected prod_expected.",
		);
	});

	it("requires a managed price and product id for hosted release proof", async () => {
		delete process.env.STRIPE_PRICE_ID;
		delete process.env.STRIPE_PRODUCT_ID;
		delete process.env.STRIPE_PROMOTION_CODE_ID;

		const { assertManagedStripeEnvConfiguredForRelease } =
			await import("@/platform/billing/stripe");

		expect(() => assertManagedStripeEnvConfiguredForRelease()).toThrow(
			"Missing STRIPE_PRICE_ID. Hosted preview and production release proof require a managed Stripe price.",
		);
	});

	it("requires the active promotion code for hosted release proof when the offer is enabled", async () => {
		process.env.STRIPE_PRICE_ID = "price_correct";
		process.env.STRIPE_PRODUCT_ID = "prod_correct";
		delete process.env.STRIPE_PROMOTION_CODE_ID;

		const { assertManagedStripeEnvConfiguredForRelease } =
			await import("@/platform/billing/stripe");

		expect(() => assertManagedStripeEnvConfiguredForRelease()).toThrow(
			"Missing STRIPE_PROMOTION_CODE_ID. Hosted preview and production release proof require the active Stripe promotion code.",
		);
	});

	it("rejects the wrong stripe mode for hosted release proof", async () => {
		process.env.STRIPE_SECRET_KEY = "sk_live_123";

		const { assertStripeModeMatchesExpected } =
			await import("@/platform/billing/stripe");

		expect(() => assertStripeModeMatchesExpected("test")).toThrow(
			"Configured Stripe secret key is in live mode, expected test.",
		);
	});

	it("accepts a fully configured hosted release stripe environment", async () => {
		process.env.STRIPE_SECRET_KEY = "sk_test_123";
		process.env.STRIPE_PRICE_ID = "price_correct";
		process.env.STRIPE_PRODUCT_ID = "prod_correct";
		process.env.STRIPE_PROMOTION_CODE_ID = "promo_50_off";

		const { assertManagedStripeEnvReadyForRelease } =
			await import("@/platform/billing/stripe");
		const stripe = {
			coupons: {
				retrieve: vi.fn().mockResolvedValue({
					applies_to: {
						products: ["prod_correct"],
					},
					id: "coupon_50_off",
					percent_off: productConfig.activeOffer?.percentOff,
					valid: true,
				} satisfies Pick<
					Stripe.Coupon,
					"applies_to" | "id" | "percent_off" | "valid"
				>),
			},
			prices: {
				retrieve: vi.fn().mockResolvedValue({
					id: "price_correct",
					unit_amount: productConfig.priceUsdCents,
					currency: productConfig.currency,
					product: "prod_correct",
				} satisfies Pick<
					Stripe.Price,
					"id" | "unit_amount" | "currency" | "product"
				>),
			},
			promotionCodes: {
				retrieve: vi.fn().mockResolvedValue({
					active: true,
					id: "promo_50_off",
					promotion: {
						coupon: "coupon_50_off",
						type: "coupon",
					},
					restrictions: {
						first_time_transaction: false,
						minimum_amount: null,
						minimum_amount_currency: null,
					},
				} satisfies Pick<
					Stripe.PromotionCode,
					"active" | "id" | "promotion" | "restrictions"
				>),
			},
		} as unknown as Stripe;

		await expect(
			assertManagedStripeEnvReadyForRelease(stripe, { expectedMode: "test" }),
		).resolves.toBeUndefined();
	});

	it("rejects a managed promotion code when it does not apply to the configured product", async () => {
		process.env.STRIPE_SECRET_KEY = "sk_test_123";
		process.env.STRIPE_PRICE_ID = "price_correct";
		process.env.STRIPE_PRODUCT_ID = "prod_correct";
		process.env.STRIPE_PROMOTION_CODE_ID = "promo_wrong_product";

		const { assertManagedStripeEnvReadyForRelease } =
			await import("@/platform/billing/stripe");
		const stripe = {
			coupons: {
				retrieve: vi.fn().mockResolvedValue({
					applies_to: {
						products: ["prod_other"],
					},
					id: "coupon_wrong_product",
					percent_off: productConfig.activeOffer?.percentOff,
					valid: true,
				} satisfies Pick<
					Stripe.Coupon,
					"applies_to" | "id" | "percent_off" | "valid"
				>),
			},
			prices: {
				retrieve: vi.fn().mockResolvedValue({
					id: "price_correct",
					unit_amount: productConfig.priceUsdCents,
					currency: productConfig.currency,
					product: "prod_correct",
				} satisfies Pick<
					Stripe.Price,
					"id" | "unit_amount" | "currency" | "product"
				>),
			},
			promotionCodes: {
				retrieve: vi.fn().mockResolvedValue({
					active: true,
					id: "promo_wrong_product",
					promotion: {
						coupon: "coupon_wrong_product",
						type: "coupon",
					},
					restrictions: {
						first_time_transaction: false,
						minimum_amount: null,
						minimum_amount_currency: null,
					},
				} satisfies Pick<
					Stripe.PromotionCode,
					"active" | "id" | "promotion" | "restrictions"
				>),
			},
		} as unknown as Stripe;

		await expect(
			assertManagedStripeEnvReadyForRelease(stripe, { expectedMode: "test" }),
		).rejects.toThrow(
			"Configured Stripe promotion code promo_wrong_product does not apply to product prod_correct.",
		);
	});

	it("rejects a managed promotion code when its minimum order amount exceeds the configured price", async () => {
		process.env.STRIPE_SECRET_KEY = "sk_test_123";
		process.env.STRIPE_PRICE_ID = "price_correct";
		process.env.STRIPE_PRODUCT_ID = "prod_correct";
		process.env.STRIPE_PROMOTION_CODE_ID = "promo_high_minimum";

		const { assertManagedStripeEnvReadyForRelease } =
			await import("@/platform/billing/stripe");
		const stripe = {
			coupons: {
				retrieve: vi.fn().mockResolvedValue({
					applies_to: {
						products: ["prod_correct"],
					},
					id: "coupon_high_minimum",
					percent_off: productConfig.activeOffer?.percentOff,
					valid: true,
				} satisfies Pick<
					Stripe.Coupon,
					"applies_to" | "id" | "percent_off" | "valid"
				>),
			},
			prices: {
				retrieve: vi.fn().mockResolvedValue({
					id: "price_correct",
					unit_amount: productConfig.priceUsdCents,
					currency: productConfig.currency,
					product: "prod_correct",
				} satisfies Pick<
					Stripe.Price,
					"id" | "unit_amount" | "currency" | "product"
				>),
			},
			promotionCodes: {
				retrieve: vi.fn().mockResolvedValue({
					active: true,
					id: "promo_high_minimum",
					promotion: {
						coupon: "coupon_high_minimum",
						type: "coupon",
					},
					restrictions: {
						first_time_transaction: false,
						minimum_amount: productConfig.priceUsdCents + 100,
						minimum_amount_currency: productConfig.currency,
					},
				} satisfies Pick<
					Stripe.PromotionCode,
					"active" | "id" | "promotion" | "restrictions"
				>),
			},
		} as unknown as Stripe;

		await expect(
			assertManagedStripeEnvReadyForRelease(stripe, { expectedMode: "test" }),
		).rejects.toThrow(
			`Configured Stripe promotion code promo_high_minimum requires at least ${productConfig.priceUsdCents + 100} ${productConfig.currency} cents, but the current order is ${productConfig.priceUsdCents}.`,
		);
	});

	it("accepts an enabled Stripe webhook endpoint at the Convex HTTP-actions URL", async () => {
		setWebhookPreflightEnv();

		const { assertManagedStripeWebhookEndpointReadyForRelease } =
			await import("@/platform/billing/stripe");
		const stripe = buildStripeWithWebhookEndpoints([
			buildWebhookEndpoint({
				id: "we_live_ready",
			}),
		]);

		await expect(
			assertManagedStripeWebhookEndpointReadyForRelease(stripe, {
				expectedMode: "live",
			}),
		).resolves.toMatchObject({
			endpointId: "we_live_ready",
			expectedUrl: expectedConvexWebhookUrl,
			livemode: true,
			status: "enabled",
			url: expectedConvexWebhookUrl,
		});
	});

	it("rejects wildcard Stripe webhook event subscriptions", async () => {
		setWebhookPreflightEnv();

		const { assertManagedStripeWebhookEndpointReadyForRelease } =
			await import("@/platform/billing/stripe");
		const stripe = buildStripeWithWebhookEndpoints([
			buildWebhookEndpoint({
				enabled_events: ["*"],
				id: "we_wildcard_events",
			}),
		]);

		await expect(
			assertManagedStripeWebhookEndpointReadyForRelease(stripe, {
				expectedMode: "live",
			}),
		).rejects.toThrow(
			"Stripe webhook endpoint https://convex-site.example/stripe/webhook uses wildcard event subscriptions. Subscribe only to required event types: checkout.session.completed, checkout.session.async_payment_succeeded.",
		);
	});

	it("rejects a still-enabled app-origin Stripe webhook endpoint", async () => {
		setWebhookPreflightEnv();

		const { assertManagedStripeWebhookEndpointReadyForRelease } =
			await import("@/platform/billing/stripe");
		const stripe = buildStripeWithWebhookEndpoints([
			buildWebhookEndpoint(),
			buildWebhookEndpoint({
				id: "we_stale_app_origin",
				url: staleAppOriginWebhookUrl,
			}),
		]);

		await expect(
			assertManagedStripeWebhookEndpointReadyForRelease(stripe, {
				expectedMode: "live",
			}),
		).rejects.toThrow(
			"Stripe has enabled app-origin webhook endpoint(s) at https://www.example.com/api/stripe/webhook.",
		);
	});

	it("rejects a trailing-slash Stripe webhook endpoint at the Convex URL", async () => {
		setWebhookPreflightEnv();

		const { assertManagedStripeWebhookEndpointReadyForRelease } =
			await import("@/platform/billing/stripe");
		const stripe = buildStripeWithWebhookEndpoints([
			buildWebhookEndpoint({
				url: `${expectedConvexWebhookUrl}/`,
			}),
		]);

		await expect(
			assertManagedStripeWebhookEndpointReadyForRelease(stripe, {
				expectedMode: "live",
			}),
		).rejects.toThrow(
			"Missing enabled Stripe webhook endpoint at https://convex-site.example/stripe/webhook.",
		);
	});

	it("rejects a disabled Stripe webhook endpoint at the Convex URL", async () => {
		setWebhookPreflightEnv();

		const { assertManagedStripeWebhookEndpointReadyForRelease } =
			await import("@/platform/billing/stripe");
		const stripe = buildStripeWithWebhookEndpoints([
			buildWebhookEndpoint({
				status: "disabled",
			}),
		]);

		await expect(
			assertManagedStripeWebhookEndpointReadyForRelease(stripe, {
				expectedMode: "live",
			}),
		).rejects.toThrow(
			"Stripe webhook endpoint https://convex-site.example/stripe/webhook exists but is disabled.",
		);
	});

	it("rejects a Stripe webhook endpoint missing async checkout success events", async () => {
		setWebhookPreflightEnv();

		const { assertManagedStripeWebhookEndpointReadyForRelease } =
			await import("@/platform/billing/stripe");
		const stripe = buildStripeWithWebhookEndpoints([
			buildWebhookEndpoint({
				enabled_events: ["checkout.session.completed"],
			}),
		]);

		await expect(
			assertManagedStripeWebhookEndpointReadyForRelease(stripe, {
				expectedMode: "live",
			}),
		).rejects.toThrow(
			"Stripe webhook endpoint https://convex-site.example/stripe/webhook is missing required event subscription(s): checkout.session.async_payment_succeeded.",
		);
	});

	it("rejects a Stripe webhook endpoint in the wrong mode", async () => {
		setWebhookPreflightEnv();

		const { assertManagedStripeWebhookEndpointReadyForRelease } =
			await import("@/platform/billing/stripe");
		const stripe = buildStripeWithWebhookEndpoints([
			buildWebhookEndpoint({
				livemode: false,
			}),
		]);

		await expect(
			assertManagedStripeWebhookEndpointReadyForRelease(stripe, {
				expectedMode: "live",
			}),
		).rejects.toThrow(
			"Stripe webhook endpoint https://convex-site.example/stripe/webhook is in test mode, expected live.",
		);
	});

	it("rejects an explicit old webhook endpoint API version for no-cost checkout proof", async () => {
		setWebhookPreflightEnv();

		const { assertManagedStripeWebhookEndpointReadyForRelease } =
			await import("@/platform/billing/stripe");
		const stripe = buildStripeWithWebhookEndpoints([
			buildWebhookEndpoint({
				api_version: "2022-11-15",
				id: "we_old_api_version",
			}),
		]);

		await expect(
			assertManagedStripeWebhookEndpointReadyForRelease(stripe, {
				expectedMode: "live",
			}),
		).rejects.toThrow(
			"Stripe webhook endpoint we_old_api_version uses API version 2022-11-15, expected 2023-08-16 or later for no-cost Checkout orders.",
		);
	});

	it("rejects an unpinned webhook endpoint API version for no-cost checkout proof", async () => {
		setWebhookPreflightEnv();

		const { assertManagedStripeWebhookEndpointReadyForRelease } =
			await import("@/platform/billing/stripe");
		const stripe = buildStripeWithWebhookEndpoints([
			buildWebhookEndpoint({
				api_version: null,
				id: "we_account_default_api_version",
			}),
		]);

		await expect(
			assertManagedStripeWebhookEndpointReadyForRelease(stripe, {
				expectedMode: "live",
			}),
		).rejects.toThrow(
			"Stripe webhook endpoint we_account_default_api_version does not pin an API version. Pin the endpoint to 2023-08-16 or later so no-cost Checkout webhook payloads are proven compatible.",
		);
	});

	it("requires a Stripe webhook signing secret for webhook endpoint preflight", async () => {
		setWebhookPreflightEnv();
		delete process.env.STRIPE_WEBHOOK_SECRET;

		const { assertManagedStripeWebhookEndpointReadyForRelease } =
			await import("@/platform/billing/stripe");
		const stripe = buildStripeWithWebhookEndpoints([buildWebhookEndpoint()]);

		await expect(
			assertManagedStripeWebhookEndpointReadyForRelease(stripe, {
				expectedMode: "live",
			}),
		).rejects.toThrow(
			"Missing required environment variable: STRIPE_WEBHOOK_SECRET",
		);
	});

	it("normalizes newline-polluted stripe keys before mode detection", async () => {
		process.env.STRIPE_SECRET_KEY = "sk_test_123\\n";

		const { getNormalizedStripeSecretKey, getStripeModeLabel } =
			await import("@/platform/billing/stripe");

		expect(getNormalizedStripeSecretKey()).toBe("sk_test_123");
		expect(getStripeModeLabel()).toBe("test");
	});

	it("detects restricted Stripe key modes", async () => {
		process.env.STRIPE_SECRET_KEY = "rk_test_123";

		let stripeModule = await import("@/platform/billing/stripe");
		expect(stripeModule.getStripeModeLabel()).toBe("test");

		vi.resetModules();
		process.env.STRIPE_SECRET_KEY = "rk_live_123";
		stripeModule = await import("@/platform/billing/stripe");
		expect(stripeModule.getStripeModeLabel()).toBe("live");
	});

	it("rejects unknown Stripe secret key prefixes for mode detection", async () => {
		process.env.STRIPE_SECRET_KEY = "stripe_123";

		const { getStripeModeLabel } = await import("@/platform/billing/stripe");

		expect(() => getStripeModeLabel()).toThrow(
			"STRIPE_SECRET_KEY must start with sk_test_, rk_test_, sk_live_, or rk_live_.",
		);
	});
});
