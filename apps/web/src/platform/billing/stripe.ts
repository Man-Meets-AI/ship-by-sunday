import Stripe from "stripe";

import { apiConfig } from "@/config/product";
import {
	assertManagedStripeEnvConfiguredForRelease as assertManagedStripeConfigConfiguredForRelease,
	assertManagedStripeEnvReadyForRelease as assertManagedStripeConfigReadyForRelease,
	assertManagedStripePriceMatchesProductConfig as assertManagedStripeConfigPriceMatchesProductConfig,
	assertManagedStripePromotionCodeMatchesProductConfig as assertManagedStripeConfigPromotionCodeMatchesProductConfig,
	assertManagedStripeWebhookEndpointReadyForRelease as assertManagedStripeConfigWebhookEndpointReadyForRelease,
	assertStripeModeMatchesExpected as assertStripeConfigModeMatchesExpected,
	getManagedStripeConfigFromEnv,
	getNormalizedStripeSecretKey as getNormalizedStripeConfigSecretKey,
	getStripeCheckoutDiscounts as getStripeConfigCheckoutDiscounts,
	getStripeLineItem as getStripeConfigLineItem,
	getStripeModeLabel as getStripeConfigModeLabel,
	type ManagedStripeConfig,
	type ManagedStripeWebhookEndpointPreflightResult,
	type StripeModeLabel,
} from "@/platform/billing/managed-stripe-config";
import type { CheckoutOfferId } from "@/platform/billing/checkout/checkout-offers";
import { requireServerEnv, serverEnv } from "@/platform/env/server";

export const STRIPE_API_VERSION = apiConfig.stripeApiVersion;
export { normalizeStripeSecretKey } from "@/platform/billing/managed-stripe-config";
export type { StripeModeLabel };
export type { ManagedStripeWebhookEndpointPreflightResult };

let stripeClient: Stripe | null = null;

function getManagedStripeConfig(): ManagedStripeConfig {
	return getManagedStripeConfigFromEnv(serverEnv);
}

export function getNormalizedStripeSecretKey() {
	return getNormalizedStripeConfigSecretKey(getManagedStripeConfig());
}

export function getStripe() {
	if (!stripeClient) {
		stripeClient = new Stripe(getNormalizedStripeSecretKey(), {
			apiVersion: STRIPE_API_VERSION,
		});
	}

	return stripeClient;
}

export function getStripePublishableKey() {
	return requireServerEnv("STRIPE_PUBLISHABLE_KEY");
}

export function getStripeLineItem(offerId: CheckoutOfferId) {
	return getStripeConfigLineItem(getManagedStripeConfig(), offerId);
}

export function getStripeCheckoutDiscounts(offerId: CheckoutOfferId) {
	return getStripeConfigCheckoutDiscounts(getManagedStripeConfig(), offerId);
}

export async function assertManagedStripePriceMatchesProductConfig(
	stripe: Stripe,
	offerId?: CheckoutOfferId,
) {
	await assertManagedStripeConfigPriceMatchesProductConfig(
		stripe,
		getManagedStripeConfig(),
		offerId,
	);
}

export async function assertManagedStripePromotionCodeMatchesProductConfig(
	stripe: Stripe,
) {
	await assertManagedStripeConfigPromotionCodeMatchesProductConfig(
		stripe,
		getManagedStripeConfig(),
	);
}

export async function assertManagedStripeWebhookEndpointReadyForRelease(
	stripe: Stripe,
	options: {
		expectedMode?: StripeModeLabel;
		expectedWebhookUrl?: string;
		requiredEvents?: readonly string[];
	} = {},
) {
	return await assertManagedStripeConfigWebhookEndpointReadyForRelease(
		stripe,
		getManagedStripeConfig(),
		options,
	);
}

export function getStripeModeLabel() {
	return getStripeConfigModeLabel(getManagedStripeConfig());
}

export function assertManagedStripeEnvConfiguredForRelease() {
	assertManagedStripeConfigConfiguredForRelease(getManagedStripeConfig());
}

export function assertStripeModeMatchesExpected(expectedMode: StripeModeLabel) {
	return assertStripeConfigModeMatchesExpected(
		getManagedStripeConfig(),
		expectedMode,
	);
}

export async function assertManagedStripeEnvReadyForRelease(
	stripe: Stripe,
	{ expectedMode }: { expectedMode?: StripeModeLabel } = {},
) {
	await assertManagedStripeConfigReadyForRelease(
		stripe,
		getManagedStripeConfig(),
		{
			expectedMode,
		},
	);
}

export function getStripeDashboardUrl(path?: string | null) {
	const normalizedPath =
		typeof path === "string" ? path.replace(/^\/+/, "") : "";
	const baseUrl =
		getStripeModeLabel() === "test"
			? "https://dashboard.stripe.com/test"
			: "https://dashboard.stripe.com";

	return normalizedPath.length > 0 ? `${baseUrl}/${normalizedPath}` : baseUrl;
}

export function getStripeEventDashboardUrl(eventId?: string | null) {
	return getStripeDashboardUrl(eventId ? `events/${eventId}` : "events");
}

export function getStripeWebhookDashboardUrl() {
	return getStripeDashboardUrl("webhooks");
}

export function getStripeProductDashboardUrl() {
	const config = getManagedStripeConfig();
	const productId =
		config.offerProductIds.starter ??
		config.offerProductIds.workers ??
		config.productId;
	if (productId) {
		return getStripeDashboardUrl(`products/${productId}`);
	}

	return getStripeDashboardUrl("products");
}
