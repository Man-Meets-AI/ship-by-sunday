import "server-only";

import type Stripe from "stripe";

import {
	getCheckoutSuccessHref,
	productConfig,
	routeConfig,
} from "@/config/product";
import {
	getStripeCheckoutDiscounts,
	getStripeLineItem,
} from "@/platform/billing/stripe";

type BuildStripeCheckoutSessionCreateParamsInput = {
	readonly appBaseUrl: string;
	readonly clerkUserId: string | null;
	readonly customerEmail: string | null;
};

export function buildStripeCheckoutSessionCreateParams({
	appBaseUrl,
	clerkUserId,
	customerEmail,
}: BuildStripeCheckoutSessionCreateParamsInput): Stripe.Checkout.SessionCreateParams {
	const checkoutDiscounts = getStripeCheckoutDiscounts();
	const checkoutMetadata = {
		...(clerkUserId ? { clerkUserId } : {}),
		courseSlug: productConfig.courseSlug,
	};

	return {
		mode: "payment",
		...(checkoutDiscounts ? {} : { allow_promotion_codes: true }),
		billing_address_collection: "auto",
		customer_creation: "always",
		cancel_url: `${appBaseUrl}${routeConfig.checkoutCancel}`,
		success_url: `${appBaseUrl}${getCheckoutSuccessHref("{CHECKOUT_SESSION_ID}")}`,
		client_reference_id: clerkUserId ?? undefined,
		customer_email: customerEmail ?? undefined,
		...(checkoutDiscounts ? { discounts: checkoutDiscounts } : {}),
		line_items: [getStripeLineItem()],
		metadata: checkoutMetadata,
		payment_intent_data: {
			metadata: checkoutMetadata,
		},
	};
}

export function buildStripeExpressCheckoutSessionCreateParams({
	appBaseUrl,
	clerkUserId,
	customerEmail,
}: BuildStripeCheckoutSessionCreateParamsInput): Stripe.Checkout.SessionCreateParams {
	const checkoutDiscounts = getStripeCheckoutDiscounts();
	const checkoutMetadata = {
		...(clerkUserId ? { clerkUserId } : {}),
		courseSlug: productConfig.courseSlug,
	};

	return {
		mode: "payment",
		ui_mode: "custom",
		...(checkoutDiscounts ? {} : { allow_promotion_codes: true }),
		billing_address_collection: "auto",
		customer_creation: "always",
		return_url: `${appBaseUrl}${getCheckoutSuccessHref("{CHECKOUT_SESSION_ID}")}`,
		client_reference_id: clerkUserId ?? undefined,
		customer_email: customerEmail ?? undefined,
		...(checkoutDiscounts ? { discounts: checkoutDiscounts } : {}),
		line_items: [getStripeLineItem()],
		metadata: checkoutMetadata,
		payment_intent_data: {
			metadata: checkoutMetadata,
		},
	};
}
