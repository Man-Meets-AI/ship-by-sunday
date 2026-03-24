import Stripe from "stripe";

import { apiConfig, productConfig } from "@/config/product";
import { COURSE_SLUG } from "@/features/course/lesson/model/registry";
import { requireServerEnv, serverEnv } from "@/platform/env/server";

export const STRIPE_API_VERSION = apiConfig.stripeApiVersion;

let stripeClient: Stripe | null = null;

export function getStripe() {
	if (!stripeClient) {
		stripeClient = new Stripe(requireServerEnv("STRIPE_SECRET_KEY"), {
			apiVersion: STRIPE_API_VERSION,
		});
	}

	return stripeClient;
}

export function getStripeLineItem() {
	if (serverEnv.STRIPE_PRICE_ID) {
		return {
			price: serverEnv.STRIPE_PRICE_ID,
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
					courseSlug: COURSE_SLUG,
				},
			},
			unit_amount: productConfig.priceUsdCents,
		},
		quantity: 1,
	};
}

export function getStripeModeLabel() {
	return requireServerEnv("STRIPE_SECRET_KEY").startsWith("sk_test_")
		? "test"
		: "live";
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
	if (serverEnv.STRIPE_PRODUCT_ID) {
		return getStripeDashboardUrl(`products/${serverEnv.STRIPE_PRODUCT_ID}`);
	}

	return getStripeDashboardUrl("products");
}
