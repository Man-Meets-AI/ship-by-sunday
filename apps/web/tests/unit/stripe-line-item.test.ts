import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { productConfig } from "@/config/product";

vi.mock("server-only", () => ({}));

describe("getStripeLineItem", () => {
	const originalEnv = { ...process.env };

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
					metadata: {
						courseSlug: productConfig.courseSlug,
					},
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
					valid: true,
				} satisfies Pick<Stripe.Coupon, "applies_to" | "id" | "valid">),
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
					valid: true,
				} satisfies Pick<Stripe.Coupon, "applies_to" | "id" | "valid">),
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
					valid: true,
				} satisfies Pick<Stripe.Coupon, "applies_to" | "id" | "valid">),
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

	it("normalizes newline-polluted stripe keys before mode detection", async () => {
		process.env.STRIPE_SECRET_KEY = "sk_test_123\\n";

		const { getNormalizedStripeSecretKey, getStripeModeLabel } =
			await import("@/platform/billing/stripe");

		expect(getNormalizedStripeSecretKey()).toBe("sk_test_123");
		expect(getStripeModeLabel()).toBe("test");
	});
});
