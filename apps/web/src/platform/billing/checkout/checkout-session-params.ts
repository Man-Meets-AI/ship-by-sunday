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

function getCheckoutMode(
	offerId: CheckoutOfferId,
): Stripe.Checkout.SessionCreateParams.Mode {
	return offerId === "workers" ? "subscription" : "payment";
}

function getCheckoutLineItem(
	offerId: CheckoutOfferId,
): Stripe.Checkout.SessionCreateParams.LineItem {
	const lineItem = getStripeLineItem(offerId);
	if (offerId !== "workers" || !("price_data" in lineItem)) {
		return lineItem;
	}

	const priceData = lineItem.price_data;
	if (!priceData) {
		return lineItem;
	}

	return {
		...lineItem,
		price_data: {
			...priceData,
			recurring: {
				interval: "month",
			},
		},
	};
}

export function buildStripeCheckoutSessionCreateParams({
	appBaseUrl,
	clerkUserId,
	customerEmail,
	offerId,
	purchaseIntentId,
}: BuildStripeCheckoutSessionCreateParamsInput): Stripe.Checkout.SessionCreateParams {
	const checkoutDiscounts = getStripeCheckoutDiscounts(offerId);
	const checkoutMode = getCheckoutMode(offerId);
	const checkoutMetadata = buildCheckoutPurchaseMetadata({
		checkoutSurface: "hosted_checkout",
		clerkUserId,
		offerId,
		purchaseIntentId: requirePurchaseIntentId(purchaseIntentId),
	});

	return {
		mode: checkoutMode,
		...(checkoutDiscounts ? {} : { allow_promotion_codes: true }),
		billing_address_collection: "auto",
		...(checkoutMode === "payment" ? { customer_creation: "always" } : {}),
		cancel_url: `${appBaseUrl}${routeConfig.checkoutCancel}`,
		success_url: `${appBaseUrl}${getCheckoutSuccessHref("{CHECKOUT_SESSION_ID}")}`,
		client_reference_id: clerkUserId ?? undefined,
		customer_email: customerEmail ?? undefined,
		...(checkoutDiscounts ? { discounts: checkoutDiscounts } : {}),
		line_items: [getCheckoutLineItem(offerId)],
		metadata: checkoutMetadata,
		...(checkoutMode === "payment"
			? {
					payment_intent_data: {
						metadata: checkoutMetadata,
					},
				}
			: {
					subscription_data: {
						metadata: checkoutMetadata,
					},
				}),
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
	const checkoutMode = getCheckoutMode(offerId);
	const checkoutMetadata = buildCheckoutPurchaseMetadata({
		checkoutSurface: "express_checkout",
		clerkUserId,
		offerId,
		purchaseIntentId: requirePurchaseIntentId(purchaseIntentId),
	});

	return {
		mode: checkoutMode,
		ui_mode: "custom",
		...(checkoutDiscounts ? {} : { allow_promotion_codes: true }),
		billing_address_collection: "auto",
		...(checkoutMode === "payment" ? { customer_creation: "always" } : {}),
		return_url: `${appBaseUrl}${getCheckoutSuccessHref("{CHECKOUT_SESSION_ID}")}`,
		client_reference_id: clerkUserId ?? undefined,
		customer_email: customerEmail ?? undefined,
		...(checkoutDiscounts ? { discounts: checkoutDiscounts } : {}),
		line_items: [getCheckoutLineItem(offerId)],
		metadata: checkoutMetadata,
		...(checkoutMode === "payment"
			? {
					payment_intent_data: {
						metadata: checkoutMetadata,
					},
				}
			: {
					subscription_data: {
						metadata: checkoutMetadata,
					},
				}),
	};
}
