import "server-only";

import type Stripe from "stripe";

import { getCheckoutSuccessHref, routeConfig } from "@/config/product";
import { buildCheckoutPurchaseMetadata } from "@/platform/billing/checkout/checkout-metadata";
import type { CheckoutOfferId } from "@/platform/billing/checkout/checkout-offers";
import {
	getStripeCheckoutDiscounts,
	getStripeLineItem,
} from "@/platform/billing/stripe";

type BuildStripeCheckoutSessionCreateParamsInput = {
	readonly appBaseUrl: string;
	readonly clerkUserId: string | null;
	readonly customerEmail: string | null;
	readonly offerId: CheckoutOfferId;
	readonly purchaseIntentId: string;
};

function requirePurchaseIntentId(purchaseIntentId: string) {
	const trimmedPurchaseIntentId = purchaseIntentId.trim();
	if (!trimmedPurchaseIntentId) {
		throw new Error(
			"purchaseIntentId is required for Stripe checkout metadata",
		);
	}

	return trimmedPurchaseIntentId;
}

export function buildStripeCheckoutSessionCreateParams({
	appBaseUrl,
	clerkUserId,
	customerEmail,
	offerId,
	purchaseIntentId,
}: BuildStripeCheckoutSessionCreateParamsInput): Stripe.Checkout.SessionCreateParams {
	const checkoutDiscounts = getStripeCheckoutDiscounts(offerId);
	const checkoutMetadata = buildCheckoutPurchaseMetadata({
		checkoutSurface: "hosted_checkout",
		clerkUserId,
		offerId,
		purchaseIntentId: requirePurchaseIntentId(purchaseIntentId),
	});

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
		line_items: [getStripeLineItem(offerId)],
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
	offerId,
	purchaseIntentId,
}: BuildStripeCheckoutSessionCreateParamsInput): Stripe.Checkout.SessionCreateParams {
	const checkoutDiscounts = getStripeCheckoutDiscounts(offerId);
	const checkoutMetadata = buildCheckoutPurchaseMetadata({
		checkoutSurface: "express_checkout",
		clerkUserId,
		offerId,
		purchaseIntentId: requirePurchaseIntentId(purchaseIntentId),
	});

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
		line_items: [getStripeLineItem(offerId)],
		metadata: checkoutMetadata,
		payment_intent_data: {
			metadata: checkoutMetadata,
		},
	};
}
