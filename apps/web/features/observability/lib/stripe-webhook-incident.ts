import type { IncidentEventInput } from "@/features/observability/lib/incident";

export type StripeModeLabel = "test" | "live";

export type StripeWebhookIncidentResult =
	| {
			kind: "invalid_signature";
			message: string;
	  }
	| {
			kind: "missing_checkout_email";
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

export function getStripeModeLabelFromSecretKey(
	secretKey: string,
): StripeModeLabel {
	const normalizedSecretKey = secretKey
		.replaceAll("\\n", "")
		.replaceAll("\n", "")
		.trim();
	return normalizedSecretKey.startsWith("sk_test_") ? "test" : "live";
}

function getStripeDashboardUrl({
	path,
	stripeMode,
}: {
	path?: string | null;
	stripeMode: StripeModeLabel;
}) {
	const normalizedPath =
		typeof path === "string" ? path.replace(/^\/+/, "") : "";
	const baseUrl =
		stripeMode === "test"
			? "https://dashboard.stripe.com/test"
			: "https://dashboard.stripe.com";

	return normalizedPath.length > 0 ? `${baseUrl}/${normalizedPath}` : baseUrl;
}

function getStripeEventDashboardUrl({
	eventId,
	stripeMode,
}: {
	eventId?: string | null;
	stripeMode: StripeModeLabel;
}) {
	return getStripeDashboardUrl({
		path: eventId ? `events/${eventId}` : "events",
		stripeMode,
	});
}

function getStripeWebhookDashboardUrl(stripeMode: StripeModeLabel) {
	return getStripeDashboardUrl({ path: "webhooks", stripeMode });
}

export function buildStripeWebhookResultIncidentEvent({
	result,
	stripeMode,
}: {
	result: StripeWebhookIncidentResult;
	stripeMode: StripeModeLabel;
}): IncidentEventInput {
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
					stripeMode,
					verifierMessage: result.message,
				},
				nativeUrl: getStripeWebhookDashboardUrl(stripeMode),
				logsUrl: getStripeDashboardUrl({ path: "events", stripeMode }),
				nextAction:
					"Check the Stripe webhook signing secret and recent webhook deliveries before replaying the event.",
			};
		case "missing_checkout_email":
			return {
				source: "stripe",
				error: new Error("Stripe webhook payload was missing checkout email."),
				code: "stripe_webhook_missing_checkout_email",
				severity: "high",
				surface: "webhook",
				externalEventId: result.eventId,
				details: {
					path: "/stripe/webhook",
					stripeMode,
					eventId: result.eventId,
					eventType: result.eventType,
					sessionId: result.sessionId,
				},
				nativeUrl: getStripeEventDashboardUrl({
					eventId: result.eventId,
					stripeMode,
				}),
				logsUrl: getStripeEventDashboardUrl({
					eventId: result.eventId,
					stripeMode,
				}),
				nextAction:
					"Open the Stripe event and confirm the Checkout Session collected a buyer email before retrying the webhook flow.",
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
					stripeMode,
					eventId: result.eventId,
					eventType: result.eventType,
					sessionId: result.sessionId,
					clerkUserId: result.clerkUserId,
					stripeCustomerId: result.stripeCustomerId,
					stripePaymentIntentId: result.stripePaymentIntentId,
					persistenceMessage: result.message,
				},
				nativeUrl: getStripeEventDashboardUrl({
					eventId: result.eventId,
					stripeMode,
				}),
				logsUrl: getStripeEventDashboardUrl({
					eventId: result.eventId,
					stripeMode,
				}),
				nextAction:
					"Open the Stripe event and the product-access grant state, then fix persistence before replaying the webhook.",
			};
	}
}
