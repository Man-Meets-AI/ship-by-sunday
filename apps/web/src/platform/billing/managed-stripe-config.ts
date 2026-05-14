import type Stripe from "stripe";

import {
	checkoutOfferIds,
	getCheckoutOffer,
	type CheckoutOfferId,
} from "@/platform/billing/checkout/checkout-offers";

export type StripeModeLabel = "test" | "live";

type ManagedStripeEnvironmentKey =
	| "APP_BASE_URL"
	| "NEXT_PUBLIC_CONVEX_SITE_URL"
	| "STRIPE_SECRET_KEY"
	| "STRIPE_PRICE_ID"
	| "STRIPE_PRODUCT_ID"
	| "STRIPE_STARTER_PRICE_ID"
	| "STRIPE_STARTER_PRODUCT_ID"
	| "STRIPE_WORKERS_PRICE_ID"
	| "STRIPE_WORKERS_PRODUCT_ID"
	| "STRIPE_PROMOTION_CODE_ID"
	| "STRIPE_WEBHOOK_SECRET";

export type ManagedStripeEnvironment = Readonly<
	Record<string, string | undefined>
> &
	Partial<Record<ManagedStripeEnvironmentKey, string>>;

export type ManagedStripeConfig = {
	readonly appBaseUrl: string | undefined;
	readonly convexSiteUrl: string | undefined;
	readonly secretKey: string | undefined;
	readonly priceId: string | undefined;
	readonly productId: string | undefined;
	readonly offerPriceIds: Readonly<Record<CheckoutOfferId, string | undefined>>;
	readonly offerProductIds: Readonly<
		Record<CheckoutOfferId, string | undefined>
	>;
	readonly promotionCodeId: string | undefined;
	readonly webhookSecret: string | undefined;
};

type ManagedStripeStringConfigKey =
	| "appBaseUrl"
	| "convexSiteUrl"
	| "secretKey"
	| "priceId"
	| "productId"
	| "promotionCodeId"
	| "webhookSecret";

export const managedStripeRequiredWebhookEventTypes = [
	"checkout.session.completed",
	"checkout.session.async_payment_succeeded",
	"customer.subscription.created",
	"customer.subscription.updated",
	"customer.subscription.deleted",
	"invoice.payment_failed",
	"invoice.paid",
	"charge.refunded",
] as const;

export type ManagedStripeWebhookEndpointPreflightResult = {
	readonly apiVersion: string | null;
	readonly endpointId: string;
	readonly enabledEvents: readonly string[];
	readonly expectedUrl: string;
	readonly livemode: boolean;
	readonly requiredEvents: readonly string[];
	readonly status: string;
	readonly url: string;
};

const minimumNoCostCheckoutWebhookApiDate = "2023-08-16";

function normalizeManagedStripeEnvValue(value: string | undefined) {
	if (typeof value !== "string") {
		return undefined;
	}

	const normalized = value.trim().replace(/\\n+$/g, "").replace(/\n+$/g, "");
	return normalized.length > 0 ? normalized : undefined;
}

export function getManagedStripeConfigFromEnv(
	env: ManagedStripeEnvironment,
): ManagedStripeConfig {
	const legacyPriceId = normalizeManagedStripeEnvValue(env.STRIPE_PRICE_ID);
	const legacyProductId = normalizeManagedStripeEnvValue(env.STRIPE_PRODUCT_ID);

	return {
		appBaseUrl: normalizeManagedStripeEnvValue(env.APP_BASE_URL),
		convexSiteUrl: normalizeManagedStripeEnvValue(
			env.NEXT_PUBLIC_CONVEX_SITE_URL,
		),
		secretKey: normalizeManagedStripeEnvValue(env.STRIPE_SECRET_KEY),
		priceId: legacyPriceId,
		productId: legacyProductId,
		offerPriceIds: {
			starter:
				normalizeManagedStripeEnvValue(env.STRIPE_STARTER_PRICE_ID) ??
				legacyPriceId,
			workers: normalizeManagedStripeEnvValue(env.STRIPE_WORKERS_PRICE_ID),
		},
		offerProductIds: {
			starter:
				normalizeManagedStripeEnvValue(env.STRIPE_STARTER_PRODUCT_ID) ??
				legacyProductId,
			workers: normalizeManagedStripeEnvValue(env.STRIPE_WORKERS_PRODUCT_ID),
		},
		promotionCodeId: normalizeManagedStripeEnvValue(
			env.STRIPE_PROMOTION_CODE_ID,
		),
		webhookSecret: normalizeManagedStripeEnvValue(env.STRIPE_WEBHOOK_SECRET),
	};
}

function requireManagedStripeConfigValue(
	config: ManagedStripeConfig,
	key: ManagedStripeStringConfigKey,
	envKey: ManagedStripeEnvironmentKey,
) {
	const value = config[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${envKey}`);
	}

	return value;
}

export function normalizeStripeSecretKey(secretKey: string) {
	return secretKey.replaceAll("\\n", "").replaceAll("\n", "").trim();
}

export function getNormalizedStripeSecretKey(config: ManagedStripeConfig) {
	return normalizeStripeSecretKey(
		requireManagedStripeConfigValue(config, "secretKey", "STRIPE_SECRET_KEY"),
	);
}

function getStripePriceProductId(
	priceProduct: string | Stripe.Product | Stripe.DeletedProduct,
) {
	return typeof priceProduct === "string" ? priceProduct : priceProduct.id;
}

function normalizeAbsoluteUrlWithoutQueryOrHash(value: string, label: string) {
	try {
		const url = new URL(value);
		url.hash = "";
		url.search = "";
		return url.toString();
	} catch {
		throw new Error(`${label} must be an absolute URL. Received: ${value}`);
	}
}

function normalizeBaseUrl(value: string, label: string) {
	return normalizeAbsoluteUrlWithoutQueryOrHash(value, label).replace(
		/\/+$/g,
		"",
	);
}

function normalizeStripeWebhookEndpointUrl(value: string, label: string) {
	try {
		return new URL(value).toString();
	} catch {
		throw new Error(`${label} must be an absolute URL. Received: ${value}`);
	}
}

function hasRequiredStripeWebhookEvents(
	endpoint: Pick<Stripe.WebhookEndpoint, "enabled_events">,
	requiredEvents: readonly string[],
) {
	if (endpoint.enabled_events.includes("*")) {
		return false;
	}

	return requiredEvents.every((eventType) =>
		endpoint.enabled_events.includes(eventType),
	);
}

function getMissingStripeWebhookEvents(
	endpoint: Pick<Stripe.WebhookEndpoint, "enabled_events">,
	requiredEvents: readonly string[],
) {
	return requiredEvents.filter(
		(eventType) => !endpoint.enabled_events.includes(eventType),
	);
}

export function getManagedStripeWebhookEndpointUrl(
	config: ManagedStripeConfig,
) {
	const appBaseUrl = requireManagedStripeConfigValue(
		config,
		"appBaseUrl",
		"APP_BASE_URL",
	);

	return `${normalizeBaseUrl(appBaseUrl, "APP_BASE_URL")}/api/stripe/webhook`;
}

function getManagedStripeLegacyConvexWebhookUrl(config: ManagedStripeConfig) {
	if (!config.convexSiteUrl) {
		return null;
	}

	return `${normalizeBaseUrl(config.convexSiteUrl, "NEXT_PUBLIC_CONVEX_SITE_URL")}/stripe/webhook`;
}

export function assertManagedStripeWebhookSecretConfigured(
	config: ManagedStripeConfig,
) {
	const webhookSecret = requireManagedStripeConfigValue(
		config,
		"webhookSecret",
		"STRIPE_WEBHOOK_SECRET",
	);

	if (!webhookSecret.startsWith("whsec_")) {
		throw new Error(
			"STRIPE_WEBHOOK_SECRET must be a Stripe webhook signing secret starting with whsec_.",
		);
	}
}

function getStripeApiVersionDate(apiVersion: string) {
	const match = apiVersion.match(/^\d{4}-\d{2}-\d{2}/);
	return match?.[0] ?? null;
}

function assertStripeWebhookEndpointApiVersionSupportsNoCostCheckout(
	endpoint: Pick<Stripe.WebhookEndpoint, "api_version" | "id">,
) {
	if (endpoint.api_version === null) {
		throw new Error(
			`Stripe webhook endpoint ${endpoint.id} does not pin an API version. Pin the endpoint to ${minimumNoCostCheckoutWebhookApiDate} or later so no-cost Checkout webhook payloads are proven compatible.`,
		);
	}

	const endpointApiDate = getStripeApiVersionDate(endpoint.api_version);
	if (
		!endpointApiDate ||
		endpointApiDate < minimumNoCostCheckoutWebhookApiDate
	) {
		throw new Error(
			`Stripe webhook endpoint ${endpoint.id} uses API version ${endpoint.api_version}, expected ${minimumNoCostCheckoutWebhookApiDate} or later for no-cost Checkout orders.`,
		);
	}
}

function getStripeModeLabelFromSecretKey(secretKey: string): StripeModeLabel {
	const normalizedSecretKey = normalizeStripeSecretKey(secretKey);
	if (
		normalizedSecretKey.startsWith("sk_test_") ||
		normalizedSecretKey.startsWith("rk_test_")
	) {
		return "test";
	}

	if (
		normalizedSecretKey.startsWith("sk_live_") ||
		normalizedSecretKey.startsWith("rk_live_")
	) {
		return "live";
	}

	throw new Error(
		"STRIPE_SECRET_KEY must start with sk_test_, rk_test_, sk_live_, or rk_live_.",
	);
}

export function getStripeLineItem(
	config: ManagedStripeConfig,
	offerId: CheckoutOfferId,
) {
	const offer = getCheckoutOffer(offerId);
	const priceId = config.offerPriceIds[offerId];

	if (priceId) {
		return {
			price: priceId,
			quantity: 1,
		};
	}

	return {
		price_data: {
			currency: offer.currency,
			product_data: {
				name: offer.name,
				description: offer.description,
			},
			unit_amount: offer.priceUsdCents,
		},
		quantity: 1,
	};
}

export function getStripeCheckoutDiscounts(
	_config: ManagedStripeConfig,
	_offerId: CheckoutOfferId,
) {
	return undefined;
}

export async function assertManagedStripePriceMatchesProductConfig(
	stripe: Stripe,
	config: ManagedStripeConfig,
	offerId?: CheckoutOfferId,
) {
	const targetOfferIds = offerId ? [offerId] : checkoutOfferIds;

	for (const targetOfferId of targetOfferIds) {
		const offer = getCheckoutOffer(targetOfferId);
		const configuredPriceId = config.offerPriceIds[targetOfferId];
		if (!configuredPriceId) {
			continue;
		}

		const configuredPrice = await stripe.prices.retrieve(configuredPriceId);
		const configuredProductId = getStripePriceProductId(
			configuredPrice.product,
		);

		if (configuredPrice.unit_amount !== offer.priceUsdCents) {
			throw new Error(
				`Configured Stripe ${targetOfferId} price ${configuredPriceId} charges ${configuredPrice.unit_amount} cents, expected ${offer.priceUsdCents}.`,
			);
		}

		if (configuredPrice.currency !== offer.currency) {
			throw new Error(
				`Configured Stripe ${targetOfferId} price ${configuredPriceId} uses ${configuredPrice.currency}, expected ${offer.currency}.`,
			);
		}

		if (targetOfferId === "workers" && !configuredPrice.recurring) {
			throw new Error(
				`Configured Stripe workers price ${configuredPriceId} must be recurring for subscription checkout.`,
			);
		}

		const configuredOfferProductId = config.offerProductIds[targetOfferId];
		if (
			configuredOfferProductId &&
			configuredProductId !== configuredOfferProductId
		) {
			throw new Error(
				`Configured Stripe ${targetOfferId} price ${configuredPriceId} belongs to ${configuredProductId}, expected ${configuredOfferProductId}.`,
			);
		}
	}
}

export async function assertManagedStripePromotionCodeMatchesProductConfig(
	_stripe: Stripe,
	_config: ManagedStripeConfig,
) {
	return;
}

export async function assertManagedStripeWebhookEndpointReadyForRelease(
	stripe: Stripe,
	config: ManagedStripeConfig,
	{
		expectedMode,
		expectedWebhookUrl,
		requiredEvents = managedStripeRequiredWebhookEventTypes,
	}: {
		expectedMode?: StripeModeLabel;
		expectedWebhookUrl?: string;
		requiredEvents?: readonly string[];
	} = {},
): Promise<ManagedStripeWebhookEndpointPreflightResult> {
	assertManagedStripeWebhookSecretConfigured(config);

	const expectedUrl = normalizeStripeWebhookEndpointUrl(
		expectedWebhookUrl ?? getManagedStripeWebhookEndpointUrl(config),
		"Expected Stripe webhook endpoint URL",
	);
	const staleLegacyConvexWebhookUrl =
		getManagedStripeLegacyConvexWebhookUrl(config);
	const expectedLivemode =
		(expectedMode ?? getStripeModeLabel(config)) === "live";
	const endpoints = await stripe.webhookEndpoints
		.list({ limit: 100 })
		.autoPagingToArray({ limit: 200 });
	const enabledLegacyConvexEndpoints = staleLegacyConvexWebhookUrl
		? endpoints.filter(
				(endpoint) =>
					endpoint.status === "enabled" &&
					normalizeStripeWebhookEndpointUrl(
						endpoint.url,
						`Stripe webhook endpoint ${endpoint.id} URL`,
					) === staleLegacyConvexWebhookUrl,
			)
		: [];

	if (enabledLegacyConvexEndpoints.length > 0) {
		throw new Error(
			`Stripe has enabled legacy Convex webhook endpoint(s) at ${staleLegacyConvexWebhookUrl}. Disable stale Convex endpoints; this repo fulfills billing sync through ${expectedUrl}.`,
		);
	}

	const endpointsAtExpectedUrl = endpoints.filter(
		(endpoint) =>
			normalizeStripeWebhookEndpointUrl(
				endpoint.url,
				`Stripe webhook endpoint ${endpoint.id} URL`,
			) === expectedUrl,
	);
	const enabledEndpointsAtExpectedUrl = endpointsAtExpectedUrl.filter(
		(endpoint) => endpoint.status === "enabled",
	);

	if (
		endpointsAtExpectedUrl.length > 0 &&
		enabledEndpointsAtExpectedUrl.length === 0
	) {
		throw new Error(
			`Stripe webhook endpoint ${expectedUrl} exists but is disabled.`,
		);
	}

	const modeMatchingEndpoints = enabledEndpointsAtExpectedUrl.filter(
		(endpoint) => endpoint.livemode === expectedLivemode,
	);
	if (
		enabledEndpointsAtExpectedUrl.length > 0 &&
		modeMatchingEndpoints.length === 0
	) {
		const actualModes = enabledEndpointsAtExpectedUrl
			.map((endpoint) => (endpoint.livemode ? "live" : "test"))
			.join(", ");
		throw new Error(
			`Stripe webhook endpoint ${expectedUrl} is in ${actualModes} mode, expected ${expectedLivemode ? "live" : "test"}.`,
		);
	}

	const wildcardEndpoint = modeMatchingEndpoints.find((endpoint) =>
		endpoint.enabled_events.includes("*"),
	);
	if (wildcardEndpoint) {
		throw new Error(
			`Stripe webhook endpoint ${expectedUrl} uses wildcard event subscriptions. Subscribe only to required event types: ${requiredEvents.join(", ")}.`,
		);
	}

	const readyEndpoint = modeMatchingEndpoints.find((endpoint) =>
		hasRequiredStripeWebhookEvents(endpoint, requiredEvents),
	);

	if (!readyEndpoint) {
		if (modeMatchingEndpoints.length > 0) {
			const missingEvents = getMissingStripeWebhookEvents(
				modeMatchingEndpoints[0],
				requiredEvents,
			);
			throw new Error(
				`Stripe webhook endpoint ${expectedUrl} is missing required event subscription(s): ${missingEvents.join(", ")}.`,
			);
		}

		throw new Error(
			`Missing enabled Stripe webhook endpoint at ${expectedUrl}.`,
		);
	}

	assertStripeWebhookEndpointApiVersionSupportsNoCostCheckout(readyEndpoint);

	return {
		apiVersion: readyEndpoint.api_version,
		endpointId: readyEndpoint.id,
		enabledEvents: readyEndpoint.enabled_events,
		expectedUrl,
		livemode: readyEndpoint.livemode,
		requiredEvents,
		status: readyEndpoint.status,
		url: readyEndpoint.url,
	};
}

export function getStripeModeLabel(config: ManagedStripeConfig) {
	return getStripeModeLabelFromSecretKey(getNormalizedStripeSecretKey(config));
}

export function assertManagedStripeEnvConfiguredForRelease(
	config: ManagedStripeConfig,
) {
	for (const offerId of checkoutOfferIds) {
		if (!config.offerPriceIds[offerId]) {
			const envKey =
				offerId === "starter"
					? "STRIPE_STARTER_PRICE_ID"
					: "STRIPE_WORKERS_PRICE_ID";
			throw new Error(
				`Missing ${envKey}. Hosted preview and production release proof require managed Stripe prices for both checkout offers.`,
			);
		}
	}
}

export function assertStripeModeMatchesExpected(
	config: ManagedStripeConfig,
	expectedMode: StripeModeLabel,
) {
	const actualMode = getStripeModeLabel(config);
	if (actualMode !== expectedMode) {
		throw new Error(
			`Configured Stripe secret key is in ${actualMode} mode, expected ${expectedMode}.`,
		);
	}

	return actualMode;
}

export async function assertManagedStripeEnvReadyForRelease(
	stripe: Stripe,
	config: ManagedStripeConfig,
	{ expectedMode }: { expectedMode?: StripeModeLabel } = {},
) {
	assertManagedStripeEnvConfiguredForRelease(config);

	if (expectedMode) {
		assertStripeModeMatchesExpected(config, expectedMode);
	}

	await assertManagedStripePriceMatchesProductConfig(stripe, config);
	await assertManagedStripePromotionCodeMatchesProductConfig(stripe, config);
}
