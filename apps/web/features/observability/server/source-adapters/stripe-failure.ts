import {
	getCheckoutSuccessHref,
	productConfig,
	routeConfig,
} from "@/config/product";
import type { IncidentEventInput } from "@/features/observability/lib/incident";
import {
	getStripeDashboardUrl,
	getStripeEventDashboardUrl,
	getStripeModeLabel,
	getStripeProductDashboardUrl,
	getStripeWebhookDashboardUrl,
} from "@/platform/billing/stripe";
import { serverEnv } from "@/platform/env/server";

export type StripeWebhookIncidentResult =
	| {
			kind: "invalid_signature";
			message: string;
	  }
	| {
			kind: "missing_clerk_user";
			eventId: string;
			eventType: string;
			sessionId: string;
	  }
	| {
			kind: "grant_failed";
			eventId: string;
			eventType: string;
			sessionId: string;
			clerkUserId: string;
			stripeCustomerId: string | null;
			stripePaymentIntentId: string | null;
			message: string;
	  };

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
	switch (result.kind) {
		case "invalid_signature":
			return {
				source: "stripe",
				error: new Error("Stripe webhook signature verification failed."),
				code: "stripe_webhook_invalid_signature",
				severity: "high",
				surface: "webhook",
				details: {
					path: "/stripe/webhook",
					stripeMode: getStripeModeLabel(),
					verifierMessage: result.message,
				},
				nativeUrl: getStripeWebhookDashboardUrl(),
				logsUrl: getStripeDashboardUrl("events"),
				nextAction:
					"Check the Stripe webhook signing secret and recent webhook deliveries before replaying the event.",
			};
		case "missing_clerk_user":
			return {
				source: "stripe",
				error: new Error("Stripe webhook payload was missing clerkUserId."),
				code: "stripe_webhook_missing_clerk_user",
				severity: "high",
				surface: "webhook",
				externalEventId: result.eventId,
				details: {
					path: "/stripe/webhook",
					stripeMode: getStripeModeLabel(),
					eventId: result.eventId,
					eventType: result.eventType,
					sessionId: result.sessionId,
				},
				nativeUrl: getStripeEventDashboardUrl(result.eventId),
				logsUrl: getStripeEventDashboardUrl(result.eventId),
				nextAction:
					"Open the Stripe event and ensure checkout metadata includes clerkUserId before replaying the webhook.",
			};
		case "grant_failed":
			return {
				source: "stripe",
				error: new Error("Stripe webhook grant persistence failed."),
				code: "stripe_webhook_grant_failed",
				severity: "high",
				surface: "webhook",
				externalEventId: result.eventId,
				userId: result.clerkUserId,
				details: {
					path: "/stripe/webhook",
					stripeMode: getStripeModeLabel(),
					eventId: result.eventId,
					eventType: result.eventType,
					sessionId: result.sessionId,
					clerkUserId: result.clerkUserId,
					stripeCustomerId: result.stripeCustomerId,
					stripePaymentIntentId: result.stripePaymentIntentId,
					persistenceMessage: result.message,
				},
				nativeUrl: getStripeEventDashboardUrl(result.eventId),
				logsUrl: getStripeEventDashboardUrl(result.eventId),
				nextAction:
					"Open the Stripe event and the product-access grant state, then fix persistence before replaying the webhook.",
			};
	}
}
