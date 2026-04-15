import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { productConfig } from "@/config/product";
import { COURSE_SLUG } from "@/features/course/lesson/model/registry";

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
						courseSlug: COURSE_SLUG,
					},
				},
				unit_amount: productConfig.priceUsdCents,
			},
			quantity: 1,
		});
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
					unit_amount: 50000,
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
			`Configured Stripe price price_wrong_amount charges 50000 cents, expected ${productConfig.priceUsdCents}.`,
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
});
