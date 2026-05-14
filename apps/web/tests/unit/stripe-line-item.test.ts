import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { checkoutOffers } from "@/platform/billing/checkout/checkout-offers";

vi.mock("server-only", () => ({}));

describe("getStripeLineItem", () => {
	const originalEnv = { ...process.env };
	const expectedWebhookUrl = "https://www.example.com/api/stripe/webhook";
	const staleLegacyConvexWebhookUrl =
		"https://convex-site.example/stripe/webhook";
	const requiredWebhookEvents = [
		"checkout.session.completed",
		"checkout.session.async_payment_succeeded",
		"customer.subscription.created",
		"customer.subscription.updated",
		"customer.subscription.deleted",
		"invoice.payment_failed",
		"invoice.paid",
		"charge.refunded",
	];

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
			enabled_events: requiredWebhookEvents,
			id: "we_ready",
			livemode: true,
			metadata: {},
			object: "webhook_endpoint",
			status: "enabled",
			url: expectedWebhookUrl,
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

	it("returns the managed Starter Stripe price when the Starter price id is configured", async () => {
		process.env.STRIPE_STARTER_PRICE_ID = "price_297_managed";

		const { getStripeLineItem } = await import("@/platform/billing/stripe");

		expect(getStripeLineItem("starter")).toEqual({
			price: "price_297_managed",
			quantity: 1,
		});
	});

	it("uses the legacy managed Stripe price as the Starter fallback", async () => {
		process.env.STRIPE_PRICE_ID = "price_legacy_starter";

		const { getStripeLineItem } = await import("@/platform/billing/stripe");

		expect(getStripeLineItem("starter")).toEqual({
			price: "price_legacy_starter",
			quantity: 1,
		});
	});

	it("normalizes trailing newline escapes on managed Stripe ids", async () => {
		process.env.STRIPE_WORKERS_PRICE_ID = "price_600_managed\\n";

		const { getStripeLineItem } = await import("@/platform/billing/stripe");

		expect(getStripeLineItem("workers")).toEqual({
			price: "price_600_managed",
			quantity: 1,
		});
	});

	it("returns inline price data using the selected offer when its managed price is absent", async () => {
		delete process.env.STRIPE_STARTER_PRICE_ID;
		delete process.env.STRIPE_PRICE_ID;

		const { getStripeLineItem } = await import("@/platform/billing/stripe");

		expect(getStripeLineItem("starter")).toEqual({
			price_data: {
				currency: checkoutOffers.starter.currency,
				product_data: {
					name: checkoutOffers.starter.name,
					description: checkoutOffers.starter.description,
				},
				unit_amount: checkoutOffers.starter.priceUsdCents,
			},
			quantity: 1,
		});
	});

	it("does not auto-apply a shared promotion code to either checkout offer", async () => {
		process.env.STRIPE_PROMOTION_CODE_ID = "promo_50_off";

		const { getStripeCheckoutDiscounts } =
			await import("@/platform/billing/stripe");

		expect(getStripeCheckoutDiscounts("starter")).toBeUndefined();
		expect(getStripeCheckoutDiscounts("workers")).toBeUndefined();
	});

	it("rejects a managed Stripe price when its amount drifts from the canonical product config", async () => {
		process.env.STRIPE_WORKERS_PRICE_ID = "price_wrong_amount";
		process.env.STRIPE_WORKERS_PRODUCT_ID = "prod_correct";

		const { assertManagedStripePriceMatchesProductConfig } =
			await import("@/platform/billing/stripe");
		const stripe = {
			prices: {
				retrieve: vi.fn().mockResolvedValue({
					id: "price_wrong_amount",
					unit_amount: 25000,
					currency: checkoutOffers.workers.currency,
					product: "prod_correct",
				} satisfies Pick<
					Stripe.Price,
					"id" | "unit_amount" | "currency" | "product"
				>),
			},
		} as unknown as Stripe;

		await expect(
			assertManagedStripePriceMatchesProductConfig(stripe, "workers"),
		).rejects.toThrow(
			`Configured Stripe workers price price_wrong_amount charges 25000 cents, expected ${checkoutOffers.workers.priceUsdCents}.`,
		);
	});

	it("accepts a managed Stripe price when its amount, currency, and product match config", async () => {
		process.env.STRIPE_STARTER_PRICE_ID = "price_correct";
		process.env.STRIPE_STARTER_PRODUCT_ID = "prod_correct";

		const { assertManagedStripePriceMatchesProductConfig } =
			await import("@/platform/billing/stripe");
		const stripe = {
			prices: {
				retrieve: vi.fn().mockResolvedValue({
					id: "price_correct",
					unit_amount: checkoutOffers.starter.priceUsdCents,
					currency: checkoutOffers.starter.currency,
					product: "prod_correct",
				} satisfies Pick<
					Stripe.Price,
					"id" | "unit_amount" | "currency" | "product"
				>),
			},
		} as unknown as Stripe;

		await expect(
			assertManagedStripePriceMatchesProductConfig(stripe, "starter"),
		).resolves.toBeUndefined();
	});

	it("rejects a one-time managed Stripe price for Workers subscription checkout", async () => {
		process.env.STRIPE_WORKERS_PRICE_ID = "price_workers_once";
		process.env.STRIPE_WORKERS_PRODUCT_ID = "prod_workers";

		const { assertManagedStripePriceMatchesProductConfig } =
			await import("@/platform/billing/stripe");
		const stripe = {
			prices: {
				retrieve: vi.fn().mockResolvedValue({
					id: "price_workers_once",
					unit_amount: checkoutOffers.workers.priceUsdCents,
					currency: checkoutOffers.workers.currency,
					product: "prod_workers",
					recurring: null,
				} satisfies Pick<
					Stripe.Price,
					"id" | "unit_amount" | "currency" | "product" | "recurring"
				>),
			},
		} as unknown as Stripe;

		await expect(
			assertManagedStripePriceMatchesProductConfig(stripe, "workers"),
		).rejects.toThrow(
			"Configured Stripe workers price price_workers_once must be recurring for subscription checkout.",
		);
	});

	it("rejects a managed Stripe price when it belongs to the wrong product", async () => {
		process.env.STRIPE_STARTER_PRICE_ID = "price_wrong_product";
		process.env.STRIPE_STARTER_PRODUCT_ID = "prod_expected";

		const { assertManagedStripePriceMatchesProductConfig } =
			await import("@/platform/billing/stripe");
		const stripe = {
			prices: {
				retrieve: vi.fn().mockResolvedValue({
					id: "price_wrong_product",
					unit_amount: checkoutOffers.starter.priceUsdCents,
					currency: checkoutOffers.starter.currency,
					product: "prod_other",
				} satisfies Pick<
					Stripe.Price,
					"id" | "unit_amount" | "currency" | "product"
				>),
			},
		} as unknown as Stripe;

		await expect(
			assertManagedStripePriceMatchesProductConfig(stripe, "starter"),
		).rejects.toThrow(
			"Configured Stripe starter price price_wrong_product belongs to prod_other, expected prod_expected.",
		);
	});

	it("requires managed price ids for both checkout offers in hosted release proof", async () => {
		delete process.env.STRIPE_PRICE_ID;
		delete process.env.STRIPE_STARTER_PRICE_ID;
		delete process.env.STRIPE_WORKERS_PRICE_ID;

		const { assertManagedStripeEnvConfiguredForRelease } =
			await import("@/platform/billing/stripe");

		expect(() => assertManagedStripeEnvConfiguredForRelease()).toThrow(
			"Missing STRIPE_STARTER_PRICE_ID. Hosted preview and production release proof require managed Stripe prices for both checkout offers.",
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
		process.env.STRIPE_STARTER_PRICE_ID = "price_starter";
		process.env.STRIPE_STARTER_PRODUCT_ID = "prod_starter";
		process.env.STRIPE_WORKERS_PRICE_ID = "price_workers";
		process.env.STRIPE_WORKERS_PRODUCT_ID = "prod_workers";

		const { assertManagedStripeEnvReadyForRelease } =
			await import("@/platform/billing/stripe");
		const stripe = {
			prices: {
				retrieve: vi.fn(async (priceId: string) => {
					if (priceId === "price_starter") {
						return {
							id: "price_starter",
							unit_amount: checkoutOffers.starter.priceUsdCents,
							currency: checkoutOffers.starter.currency,
							product: "prod_starter",
						} satisfies Pick<
							Stripe.Price,
							"id" | "unit_amount" | "currency" | "product"
						>;
					}

					return {
						id: "price_workers",
						unit_amount: checkoutOffers.workers.priceUsdCents,
						currency: checkoutOffers.workers.currency,
						product: "prod_workers",
						recurring: {
							interval: "month",
							interval_count: 1,
							meter: null,
							trial_period_days: null,
							usage_type: "licensed",
						},
					} satisfies Pick<
						Stripe.Price,
						"id" | "unit_amount" | "currency" | "product" | "recurring"
					>;
				}),
			},
		} as unknown as Stripe;

		await expect(
			assertManagedStripeEnvReadyForRelease(stripe, { expectedMode: "test" }),
		).resolves.toBeUndefined();
	});

	it("accepts an enabled Stripe webhook endpoint at the app-origin URL", async () => {
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
			expectedUrl: expectedWebhookUrl,
			livemode: true,
			status: "enabled",
			url: expectedWebhookUrl,
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
			"Stripe webhook endpoint https://www.example.com/api/stripe/webhook uses wildcard event subscriptions. Subscribe only to required event types: checkout.session.completed, checkout.session.async_payment_succeeded, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed, invoice.paid, charge.refunded.",
		);
	});

	it("rejects a still-enabled legacy Convex Stripe webhook endpoint", async () => {
		setWebhookPreflightEnv();

		const { assertManagedStripeWebhookEndpointReadyForRelease } =
			await import("@/platform/billing/stripe");
		const stripe = buildStripeWithWebhookEndpoints([
			buildWebhookEndpoint(),
			buildWebhookEndpoint({
				id: "we_stale_convex_origin",
				url: staleLegacyConvexWebhookUrl,
			}),
		]);

		await expect(
			assertManagedStripeWebhookEndpointReadyForRelease(stripe, {
				expectedMode: "live",
			}),
		).rejects.toThrow(
			"Stripe has enabled legacy Convex webhook endpoint(s) at https://convex-site.example/stripe/webhook.",
		);
	});

	it("rejects a trailing-slash Stripe webhook endpoint at the app-origin URL", async () => {
		setWebhookPreflightEnv();

		const { assertManagedStripeWebhookEndpointReadyForRelease } =
			await import("@/platform/billing/stripe");
		const stripe = buildStripeWithWebhookEndpoints([
			buildWebhookEndpoint({
				url: `${expectedWebhookUrl}/`,
			}),
		]);

		await expect(
			assertManagedStripeWebhookEndpointReadyForRelease(stripe, {
				expectedMode: "live",
			}),
		).rejects.toThrow(
			"Missing enabled Stripe webhook endpoint at https://www.example.com/api/stripe/webhook.",
		);
	});

	it("rejects a disabled Stripe webhook endpoint at the app-origin URL", async () => {
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
			"Stripe webhook endpoint https://www.example.com/api/stripe/webhook exists but is disabled.",
		);
	});

	it("rejects a Stripe webhook endpoint missing subscription lifecycle events", async () => {
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
			"Stripe webhook endpoint https://www.example.com/api/stripe/webhook is missing required event subscription(s): checkout.session.async_payment_succeeded, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed, invoice.paid, charge.refunded.",
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
			"Stripe webhook endpoint https://www.example.com/api/stripe/webhook is in test mode, expected live.",
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
