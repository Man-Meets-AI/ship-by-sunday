import Stripe from "stripe";

import { productConfig } from "@/config/product";
import { requireServerEnv, serverEnv } from "@/lib/env/server";
import { COURSE_SLUG } from "@/lib/course/registry";

export const STRIPE_API_VERSION = "2026-02-25.clover";

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
