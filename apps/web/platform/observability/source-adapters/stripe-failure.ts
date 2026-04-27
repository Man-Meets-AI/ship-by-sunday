import {
	getCheckoutSuccessHref,
	productConfig,
	routeConfig,
} from "@/config/product";
import type { IncidentEventInput } from "@/lib/observability/incident";
import {
	getStripeDashboardUrl,
	getStripeModeLabel,
	getStripeProductDashboardUrl,
} from "@/platform/billing/stripe";
import { serverEnv } from "@/platform/env/server";
import {
	buildStripeWebhookResultIncidentEvent,
	type StripeWebhookIncidentResult,
} from "@/lib/observability/stripe-webhook-incident";

export type { StripeWebhookIncidentResult };

export function buildStripeCheckoutFailureContext({
	appBaseUrl,
	userId,
}: {
	appBaseUrl: string;
	userId: string;
}): Pick<
	IncidentEventInput,
	"details" | "nativeUrl" | "logsUrl" | "nextAction"
> {
	return {
		details: {
			appBaseUrl,
			cancelUrl: `${appBaseUrl}${routeConfig.checkoutCancel}`,
			successUrl: `${appBaseUrl}${getCheckoutSuccessHref("{CHECKOUT_SESSION_ID}")}`,
			clerkUserId: userId,
			courseSlug: productConfig.courseSlug,
			stripeMode: getStripeModeLabel(),
			stripePriceId: serverEnv.STRIPE_PRICE_ID ?? null,
			stripeProductId: serverEnv.STRIPE_PRODUCT_ID ?? null,
		},
		nativeUrl: getStripeProductDashboardUrl(),
		logsUrl: getStripeDashboardUrl("events"),
		nextAction:
			"Check the Stripe product, price, and recent dashboard events before retrying checkout.",
	};
}

export function buildStripeWebhookResultIncident(
	result: StripeWebhookIncidentResult,
): IncidentEventInput {
	return buildStripeWebhookResultIncidentEvent({
		result,
		stripeMode: getStripeModeLabel(),
	});
}
