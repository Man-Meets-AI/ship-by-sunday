import Stripe from "stripe";

import { COURSE_SLUG } from "@/lib/course/registry";

export const STRIPE_API_VERSION = "2026-02-25.clover";
export const STRIPE_PRODUCT_NAME = "Ship by Sunday";
export const STRIPE_PRICE_AMOUNT = 50000;

let stripeClient: Stripe | null = null;

export function getStripe() {
	if (!process.env.STRIPE_SECRET_KEY) {
		throw new Error("Missing STRIPE_SECRET_KEY");
	}

	if (!stripeClient) {
		stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
			apiVersion: STRIPE_API_VERSION,
		});
	}

	return stripeClient;
}

export function getStripeLineItem() {
	if (process.env.STRIPE_PRICE_ID) {
		return {
			price: process.env.STRIPE_PRICE_ID,
			quantity: 1,
		};
	}

	return {
		price_data: {
			currency: "usd",
			product_data: {
				name: STRIPE_PRODUCT_NAME,
				description: "Go from idea to v1 this weekend.",
				metadata: {
					courseSlug: COURSE_SLUG,
				},
			},
			unit_amount: STRIPE_PRICE_AMOUNT,
		},
		quantity: 1,
	};
}
