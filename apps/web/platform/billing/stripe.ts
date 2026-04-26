import Stripe from "stripe";

import { apiConfig } from "@/config/product";
import {
	assertManagedStripeEnvConfiguredForRelease as assertManagedStripeConfigConfiguredForRelease,
	assertManagedStripeEnvReadyForRelease as assertManagedStripeConfigReadyForRelease,
	assertManagedStripePriceMatchesProductConfig as assertManagedStripeConfigPriceMatchesProductConfig,
	assertManagedStripePromotionCodeMatchesProductConfig as assertManagedStripeConfigPromotionCodeMatchesProductConfig,
	assertStripeModeMatchesExpected as assertStripeConfigModeMatchesExpected,
	getManagedStripeConfigFromEnv,
	getNormalizedStripeSecretKey as getNormalizedStripeConfigSecretKey,
	getStripeCheckoutDiscounts as getStripeConfigCheckoutDiscounts,
	getStripeLineItem as getStripeConfigLineItem,
	getStripeModeLabel as getStripeConfigModeLabel,
	type ManagedStripeConfig,
	type StripeModeLabel,
} from "@/platform/billing/managed-stripe-config";
import { serverEnv } from "@/platform/env/server";

export const STRIPE_API_VERSION = apiConfig.stripeApiVersion;
export { normalizeStripeSecretKey } from "@/platform/billing/managed-stripe-config";
export type { StripeModeLabel };

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

export function getStripeLineItem() {
	return getStripeConfigLineItem(getManagedStripeConfig());
}

export function getStripeCheckoutDiscounts() {
	return getStripeConfigCheckoutDiscounts(getManagedStripeConfig());
}

export async function assertManagedStripePriceMatchesProductConfig(
	stripe: Stripe,
) {
	await assertManagedStripeConfigPriceMatchesProductConfig(
		stripe,
		getManagedStripeConfig(),
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
	if (config.productId) {
		return getStripeDashboardUrl(`products/${config.productId}`);
	}

	return getStripeDashboardUrl("products");
}
