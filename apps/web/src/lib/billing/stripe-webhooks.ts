import type Stripe from "stripe";

export const trackedStripeBillingEventTypes = [
	"checkout.session.completed",
	"checkout.session.async_payment_succeeded",
	"customer.subscription.created",
	"customer.subscription.updated",
	"customer.subscription.deleted",
	"invoice.payment_failed",
	"invoice.paid",
	"charge.refunded",
] as const;

export type TrackedStripeBillingEventType =
	(typeof trackedStripeBillingEventTypes)[number];

export type StripeBillingSyncTarget =
	| {
			kind: "checkout_session";
			eventCreatedAt: number;
			eventId: string;
			eventType: TrackedStripeBillingEventType;
			sessionId: string;
	  }
	| {
			kind: "subscription";
			eventCreatedAt: number;
			eventId: string;
			eventType: TrackedStripeBillingEventType;
			stripeCustomerId: string | null;
			stripeSubscriptionId: string;
	  }
	| {
			kind: "invoice_subscription";
			eventCreatedAt: number;
			eventId: string;
			eventType: TrackedStripeBillingEventType;
			stripeCustomerId: string | null;
			stripeInvoiceId: string;
			stripeSubscriptionId: string | null;
	  }
	| {
			kind: "charge_refund";
			eventCreatedAt: number;
			eventId: string;
			eventType: TrackedStripeBillingEventType;
			stripeChargeId: string;
			stripePaymentIntentId: string | null;
	  }
	| {
			kind: "ignored";
			eventCreatedAt: number;
			eventId: string;
			eventType: string;
			reason: string;
			stripeObjectId?: string;
	  };

const trackedStripeBillingEventTypeSet = new Set<string>(
	trackedStripeBillingEventTypes,
);

type StripeInvoiceWithSubscription = Stripe.Invoice & {
	subscription?: string | Stripe.Subscription | null;
};

function getStripeId(
	value:
		| string
		| {
				id?: string | null;
		  }
		| null
		| undefined,
) {
	if (typeof value === "string") {
		return value;
	}

	return typeof value?.id === "string" ? value.id : null;
}

function isTrackedStripeBillingEventType(
	eventType: string,
): eventType is TrackedStripeBillingEventType {
	return trackedStripeBillingEventTypeSet.has(eventType);
}

export function getStripeBillingSyncTargetFromWebhookEvent(
	event: Stripe.Event,
): StripeBillingSyncTarget {
	const eventCreatedAt = event.created * 1000;
	if (!isTrackedStripeBillingEventType(event.type)) {
		return {
			kind: "ignored",
			eventCreatedAt,
			eventId: event.id,
			eventType: event.type,
			reason: "unsupported_event_type",
		};
	}

	if (
		event.type === "checkout.session.completed" ||
		event.type === "checkout.session.async_payment_succeeded"
	) {
		const session = event.data.object as Stripe.Checkout.Session;
		return {
			kind: "checkout_session",
			eventCreatedAt,
			eventId: event.id,
			eventType: event.type,
			sessionId: session.id,
		};
	}

	if (
		event.type === "customer.subscription.created" ||
		event.type === "customer.subscription.updated" ||
		event.type === "customer.subscription.deleted"
	) {
		const subscription = event.data.object as Stripe.Subscription;
		return {
			kind: "subscription",
			eventCreatedAt,
			eventId: event.id,
			eventType: event.type,
			stripeCustomerId: getStripeId(subscription.customer),
			stripeSubscriptionId: subscription.id,
		};
	}

	if (
		event.type === "invoice.payment_failed" ||
		event.type === "invoice.paid"
	) {
		const invoice = event.data.object as StripeInvoiceWithSubscription;
		return {
			kind: "invoice_subscription",
			eventCreatedAt,
			eventId: event.id,
			eventType: event.type,
			stripeCustomerId: getStripeId(invoice.customer),
			stripeInvoiceId: invoice.id,
			stripeSubscriptionId: getStripeId(invoice.subscription),
		};
	}

	if (event.type === "charge.refunded") {
		const charge = event.data.object as Stripe.Charge;
		return {
			kind: "charge_refund",
			eventCreatedAt,
			eventId: event.id,
			eventType: event.type,
			stripeChargeId: charge.id,
			stripePaymentIntentId: getStripeId(charge.payment_intent),
		};
	}

	return {
		kind: "ignored",
		eventCreatedAt,
		eventId: event.id,
		eventType: event.type,
		reason: "unhandled_tracked_event_type",
	};
}
