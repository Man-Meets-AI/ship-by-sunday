import type Stripe from "stripe";

import { productConfig } from "@/config/product";

export type StripeModeLabel = "test" | "live";

type ManagedStripeEnvironmentKey =
	| "APP_BASE_URL"
	| "NEXT_PUBLIC_CONVEX_SITE_URL"
	| "STRIPE_SECRET_KEY"
	| "STRIPE_PRICE_ID"
	| "STRIPE_PRODUCT_ID"
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
	readonly promotionCodeId: string | undefined;
	readonly webhookSecret: string | undefined;
};

export const managedStripeRequiredWebhookEventTypes = [
	"checkout.session.completed",
	"checkout.session.async_payment_succeeded",
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
	return {
		appBaseUrl: normalizeManagedStripeEnvValue(env.APP_BASE_URL),
		convexSiteUrl: normalizeManagedStripeEnvValue(
			env.NEXT_PUBLIC_CONVEX_SITE_URL,
		),
		secretKey: normalizeManagedStripeEnvValue(env.STRIPE_SECRET_KEY),
		priceId: normalizeManagedStripeEnvValue(env.STRIPE_PRICE_ID),
		productId: normalizeManagedStripeEnvValue(env.STRIPE_PRODUCT_ID),
		promotionCodeId: normalizeManagedStripeEnvValue(
			env.STRIPE_PROMOTION_CODE_ID,
		),
		webhookSecret: normalizeManagedStripeEnvValue(env.STRIPE_WEBHOOK_SECRET),
	};
}

function requireManagedStripeConfigValue(
	config: ManagedStripeConfig,
	key: keyof ManagedStripeConfig,
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

function getCouponIdFromPromotionCode(promotionCode: Stripe.PromotionCode) {
	return typeof promotionCode.promotion.coupon === "string"
		? promotionCode.promotion.coupon
		: (promotionCode.promotion.coupon?.id ?? null);
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
		return true;
	}

	return requiredEvents.every((eventType) =>
		endpoint.enabled_events.includes(eventType),
	);
}

function getMissingStripeWebhookEvents(
	endpoint: Pick<Stripe.WebhookEndpoint, "enabled_events">,
	requiredEvents: readonly string[],
) {
	if (endpoint.enabled_events.includes("*")) {
		return [];
	}

	return requiredEvents.filter(
		(eventType) => !endpoint.enabled_events.includes(eventType),
	);
}

export function getManagedStripeWebhookEndpointUrl(
	config: ManagedStripeConfig,
) {
	const convexSiteUrl = requireManagedStripeConfigValue(
		config,
		"convexSiteUrl",
		"NEXT_PUBLIC_CONVEX_SITE_URL",
	);

	return `${normalizeBaseUrl(convexSiteUrl, "NEXT_PUBLIC_CONVEX_SITE_URL")}/stripe/webhook`;
}

function getManagedStripeAppOriginWebhookUrl(config: ManagedStripeConfig) {
	if (!config.appBaseUrl) {
		return null;
	}

	return `${normalizeBaseUrl(config.appBaseUrl, "APP_BASE_URL")}/api/stripe/webhook`;
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
		return;
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

export function getStripeLineItem(config: ManagedStripeConfig) {
	if (config.priceId) {
		return {
			price: config.priceId,
			quantity: 1,
		};
	}

	return {
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
	};
}

export function getStripeCheckoutDiscounts(config: ManagedStripeConfig) {
	if (!productConfig.activeOffer) {
		return undefined;
	}

	if (!config.promotionCodeId) {
		throw new Error(
			"Missing STRIPE_PROMOTION_CODE_ID. The active pricing offer requires an auto-applied Stripe promotion code.",
		);
	}

	return [
		{
			promotion_code: config.promotionCodeId,
		},
	];
}

export async function assertManagedStripePriceMatchesProductConfig(
	stripe: Stripe,
	config: ManagedStripeConfig,
) {
	if (!config.priceId) {
		return;
	}

	const configuredPrice = await stripe.prices.retrieve(config.priceId);
	const configuredProductId = getStripePriceProductId(configuredPrice.product);

	if (configuredPrice.unit_amount !== productConfig.priceUsdCents) {
		throw new Error(
			`Configured Stripe price ${config.priceId} charges ${configuredPrice.unit_amount} cents, expected ${productConfig.priceUsdCents}.`,
		);
	}

	if (configuredPrice.currency !== productConfig.currency) {
		throw new Error(
			`Configured Stripe price ${config.priceId} uses ${configuredPrice.currency}, expected ${productConfig.currency}.`,
		);
	}

	if (config.productId && configuredProductId !== config.productId) {
		throw new Error(
			`Configured Stripe price ${config.priceId} belongs to ${configuredProductId}, expected ${config.productId}.`,
		);
	}
}

export async function assertManagedStripePromotionCodeMatchesProductConfig(
	stripe: Stripe,
	config: ManagedStripeConfig,
) {
	if (!productConfig.activeOffer || !config.promotionCodeId) {
		return;
	}

	const configuredProductId = requireManagedStripeConfigValue(
		config,
		"productId",
		"STRIPE_PRODUCT_ID",
	);
	const promotionCode = await stripe.promotionCodes.retrieve(
		config.promotionCodeId,
	);

	if (!promotionCode.active) {
		throw new Error(
			`Configured Stripe promotion code ${config.promotionCodeId} is not active.`,
		);
	}

	const couponId = getCouponIdFromPromotionCode(promotionCode);
	if (!couponId) {
		throw new Error(
			`Configured Stripe promotion code ${config.promotionCodeId} is missing its coupon relationship.`,
		);
	}

	const coupon = await stripe.coupons.retrieve(couponId);
	if (coupon.valid === false) {
		throw new Error(
			`Configured Stripe promotion code ${config.promotionCodeId} uses invalid coupon ${coupon.id}.`,
		);
	}

	const applicableProducts = coupon.applies_to?.products ?? [];
	if (
		applicableProducts.length > 0 &&
		!applicableProducts.includes(configuredProductId)
	) {
		throw new Error(
			`Configured Stripe promotion code ${config.promotionCodeId} does not apply to product ${configuredProductId}.`,
		);
	}

	const currencySpecificMinimum =
		promotionCode.restrictions.currency_options?.[productConfig.currency]
			?.minimum_amount ?? null;
	const genericMinimumAmount =
		promotionCode.restrictions.minimum_amount_currency ===
		productConfig.currency
			? promotionCode.restrictions.minimum_amount
			: null;
	const minimumAmount = currencySpecificMinimum ?? genericMinimumAmount;

	if (
		promotionCode.restrictions.minimum_amount !== null &&
		currencySpecificMinimum === null &&
		genericMinimumAmount === null
	) {
		throw new Error(
			`Configured Stripe promotion code ${config.promotionCodeId} has minimum-amount restrictions that do not cover ${productConfig.currency} orders.`,
		);
	}

	if (
		typeof minimumAmount === "number" &&
		minimumAmount > productConfig.priceUsdCents
	) {
		throw new Error(
			`Configured Stripe promotion code ${config.promotionCodeId} requires at least ${minimumAmount} ${productConfig.currency} cents, but the current order is ${productConfig.priceUsdCents}.`,
		);
	}
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
	const staleAppOriginWebhookUrl = getManagedStripeAppOriginWebhookUrl(config);
	const expectedLivemode =
		(expectedMode ?? getStripeModeLabel(config)) === "live";
	const endpoints = await stripe.webhookEndpoints
		.list({ limit: 100 })
		.autoPagingToArray({ limit: 200 });
	const enabledStaleAppOriginEndpoints = staleAppOriginWebhookUrl
		? endpoints.filter(
				(endpoint) =>
					endpoint.status === "enabled" &&
					normalizeStripeWebhookEndpointUrl(
						endpoint.url,
						`Stripe webhook endpoint ${endpoint.id} URL`,
					) === staleAppOriginWebhookUrl,
			)
		: [];

	if (enabledStaleAppOriginEndpoints.length > 0) {
		throw new Error(
			`Stripe has enabled app-origin webhook endpoint(s) at ${staleAppOriginWebhookUrl}. Disable stale app-origin endpoints; this repo fulfills checkout through ${expectedUrl}.`,
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
	if (!config.priceId) {
		throw new Error(
			"Missing STRIPE_PRICE_ID. Hosted preview and production release proof require a managed Stripe price.",
		);
	}

	if (!config.productId) {
		throw new Error(
			"Missing STRIPE_PRODUCT_ID. Hosted preview and production release proof require a managed Stripe product.",
		);
	}

	if (productConfig.activeOffer && !config.promotionCodeId) {
		throw new Error(
			"Missing STRIPE_PROMOTION_CODE_ID. Hosted preview and production release proof require the active Stripe promotion code.",
		);
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
