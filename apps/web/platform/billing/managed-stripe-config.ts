import type Stripe from "stripe";

import { productConfig } from "@/config/product";

export type StripeModeLabel = "test" | "live";

type ManagedStripeEnvironmentKey =
	| "STRIPE_SECRET_KEY"
	| "STRIPE_PRICE_ID"
	| "STRIPE_PRODUCT_ID"
	| "STRIPE_PROMOTION_CODE_ID";

export type ManagedStripeEnvironment = Readonly<
	Record<string, string | undefined>
> &
	Partial<Record<ManagedStripeEnvironmentKey, string>>;

export type ManagedStripeConfig = {
	readonly secretKey: string | undefined;
	readonly priceId: string | undefined;
	readonly productId: string | undefined;
	readonly promotionCodeId: string | undefined;
};

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
		secretKey: normalizeManagedStripeEnvValue(env.STRIPE_SECRET_KEY),
		priceId: normalizeManagedStripeEnvValue(env.STRIPE_PRICE_ID),
		productId: normalizeManagedStripeEnvValue(env.STRIPE_PRODUCT_ID),
		promotionCodeId: normalizeManagedStripeEnvValue(
			env.STRIPE_PROMOTION_CODE_ID,
		),
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

export function getStripeModeLabel(config: ManagedStripeConfig) {
	return getNormalizedStripeSecretKey(config).startsWith("sk_test_")
		? "test"
		: "live";
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
