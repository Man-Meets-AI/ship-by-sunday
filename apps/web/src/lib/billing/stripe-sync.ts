import "server-only";

import { fetchAction, fetchMutation, fetchQuery } from "convex/nextjs";
import type Stripe from "stripe";

import { api } from "@/convex/_generated/api";
import {
	readCheckoutMetadataClerkUserId,
	readCheckoutPurchaseMetadata,
} from "@/platform/billing/checkout/checkout-metadata";
import type { CheckoutOfferId } from "@/platform/billing/checkout/checkout-offers";
import { getStripe } from "@/platform/billing/stripe";
import { requireServerEnv } from "@/platform/env/server";
import {
	getStripeBillingSyncTargetFromWebhookEvent,
	type StripeBillingSyncTarget,
} from "@/lib/billing/stripe-webhooks";

type WorkersBillingCadence = "monthly" | "quarterly" | "annual";
type WorkersSubscriptionStatus =
	| "incomplete"
	| "incomplete_expired"
	| "trialing"
	| "active"
	| "past_due"
	| "unpaid"
	| "canceled"
	| "paused";

export type StripeBillingSyncResult =
	| {
			kind: "starter_synced";
			eventId: string;
			sessionId: string;
	  }
	| {
			kind: "workers_synced";
			eventId: string;
			stripeSubscriptionId: string;
	  }
	| {
			kind: "skipped";
			eventId: string;
			reason: string;
	  };

type StripeSubscriptionWithPeriods = Stripe.Subscription & {
	current_period_end?: number;
	current_period_start?: number;
};

type StripeSubscriptionItemWithPeriods = Stripe.SubscriptionItem & {
	current_period_end?: number;
	current_period_start?: number;
};

type StripeInvoiceWithAttemptContext = Stripe.Invoice & {
	attempt_count?: number;
	next_payment_attempt?: number | null;
	subscription?: string | Stripe.Subscription | null;
};

const workersSubscriptionStatuses = new Set<string>([
	"incomplete",
	"incomplete_expired",
	"trialing",
	"active",
	"past_due",
	"unpaid",
	"canceled",
	"paused",
]);
const workersFailedPaymentAccessWindowMs = 14 * 24 * 60 * 60 * 1000;

function getConvexWebhookMutationSecret() {
	return requireServerEnv("CONVEX_WEBHOOK_MUTATION_SECRET");
}

function getCheckoutFulfillmentToken() {
	return requireServerEnv("CHECKOUT_FULFILLMENT_RETRY_SECRET");
}

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

function getStripeCustomerEmail(
	customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
) {
	return typeof customer === "object" &&
		customer &&
		!("deleted" in customer && customer.deleted)
		? (customer.email ?? undefined)
		: undefined;
}

function getCheckoutCustomerEmail(session: Stripe.Checkout.Session) {
	return (
		session.customer_details?.email ?? getStripeCustomerEmail(session.customer)
	);
}

function getCheckoutPaymentIntentId(session: Stripe.Checkout.Session) {
	return getStripeId(session.payment_intent);
}

function getCheckoutPaymentIntentCreatedAt(session: Stripe.Checkout.Session) {
	return typeof session.payment_intent === "object" &&
		session.payment_intent &&
		"created" in session.payment_intent &&
		typeof session.payment_intent.created === "number"
		? session.payment_intent.created * 1000
		: undefined;
}

function getCheckoutSubscriptionId(session: Stripe.Checkout.Session) {
	return getStripeId(session.subscription);
}

function isPaidCheckoutSession(session: Stripe.Checkout.Session) {
	return (
		session.payment_status === "paid" ||
		session.payment_status === "no_payment_required"
	);
}

function getCheckoutOfferId(session: Stripe.Checkout.Session) {
	return readCheckoutPurchaseMetadata(session.metadata)?.offerId;
}

function getCheckoutSessionSyncCreatedAt(session: Stripe.Checkout.Session) {
	return getCheckoutPaymentIntentCreatedAt(session) ?? session.created * 1000;
}

function getWorkersSubscriptionStatus(
	status: Stripe.Subscription.Status,
): WorkersSubscriptionStatus {
	if (!workersSubscriptionStatuses.has(status)) {
		throw new Error(`Unsupported Workers subscription status: ${status}`);
	}

	return status as WorkersSubscriptionStatus;
}

export function getWorkersBillingCadenceFromStripePrice(
	price: Stripe.Price | undefined,
): WorkersBillingCadence {
	const recurring = price?.recurring;
	if (!recurring) {
		throw new Error("Workers subscription price must be recurring.");
	}

	if (recurring.interval === "month" && recurring.interval_count === 1) {
		return "monthly";
	}

	if (recurring.interval === "month" && recurring.interval_count === 3) {
		return "quarterly";
	}

	if (recurring.interval === "year" && recurring.interval_count === 1) {
		return "annual";
	}

	throw new Error(
		`Unsupported Workers subscription cadence: ${recurring.interval_count} ${recurring.interval}.`,
	);
}

function getSubscriptionItemPeriodMs(
	subscription: StripeSubscriptionWithPeriods,
	fieldName: "current_period_end" | "current_period_start",
) {
	const firstItem = subscription.items.data[0] as
		| StripeSubscriptionItemWithPeriods
		| undefined;
	const seconds = subscription[fieldName] ?? firstItem?.[fieldName];
	return seconds ? seconds * 1000 : undefined;
}

function getExpandedLatestInvoice(subscription: Stripe.Subscription) {
	return typeof subscription.latest_invoice === "object" &&
		subscription.latest_invoice
		? (subscription.latest_invoice as StripeInvoiceWithAttemptContext)
		: undefined;
}

async function recordProcessedStripeEvent(args: {
	errorMessage?: string;
	eventId: string;
	eventType: string;
	ownerClerkUserId?: string;
	status: "applied" | "skipped" | "failed";
	stripeObjectId?: string;
}) {
	return await fetchMutation(api.billing.recordProcessedStripeEventFromServer, {
		convexWebhookMutationSecret: getConvexWebhookMutationSecret(),
		stripeEventId: args.eventId,
		eventType: args.eventType,
		status: args.status,
		...(args.ownerClerkUserId
			? { ownerClerkUserId: args.ownerClerkUserId }
			: {}),
		...(args.stripeObjectId ? { stripeObjectId: args.stripeObjectId } : {}),
		...(args.errorMessage ? { errorMessage: args.errorMessage } : {}),
	});
}

async function recordSkippedStripeEvent(args: {
	eventId: string;
	eventType: string;
	reason: string;
	stripeObjectId?: string;
}) {
	await recordProcessedStripeEvent({
		eventId: args.eventId,
		eventType: args.eventType,
		status: "skipped",
		stripeObjectId: args.stripeObjectId,
		errorMessage: args.reason,
	});

	return {
		kind: "skipped" as const,
		eventId: args.eventId,
		reason: args.reason,
	};
}

async function resolveCheckoutOwner(session: Stripe.Checkout.Session) {
	const metadataOwnerClerkUserId = readCheckoutMetadataClerkUserId({
		metadata: session.metadata,
		clientReferenceId: session.client_reference_id,
	});
	if (metadataOwnerClerkUserId) {
		return {
			ownerClerkUserId: metadataOwnerClerkUserId,
			customerEmail: getCheckoutCustomerEmail(session),
		};
	}

	const fulfillment = await fetchAction(
		api.checkoutClaimsActions.fulfillCheckoutSessionFromSuccessPage,
		{
			fulfillmentToken: getCheckoutFulfillmentToken(),
			sessionId: session.id,
		},
	);

	if (fulfillment.kind !== "fulfilled") {
		throw new Error(
			`Checkout compatibility fulfillment returned ${fulfillment.kind}.`,
		);
	}

	return {
		ownerClerkUserId: fulfillment.clerkUserId,
		customerEmail: fulfillment.checkoutEmail,
	};
}

async function lookupStripeCustomerOwner(stripeCustomerId: string) {
	return await fetchQuery(api.billing.lookupStripeCustomerOwnerFromServer, {
		convexWebhookMutationSecret: getConvexWebhookMutationSecret(),
		stripeCustomerId,
	});
}

async function retrieveCheckoutSession(sessionId: string) {
	return await getStripe().checkout.sessions.retrieve(sessionId, {
		expand: ["customer", "payment_intent", "subscription"],
	});
}

async function retrieveSubscription(stripeSubscriptionId: string) {
	return (await getStripe().subscriptions.retrieve(stripeSubscriptionId, {
		expand: ["customer", "items.data.price.product", "latest_invoice"],
	})) as StripeSubscriptionWithPeriods;
}

async function syncStarterCheckoutSession(args: {
	eventCreatedAt: number;
	eventId: string;
	eventType: string;
	ownerClerkUserId: string;
	session: Stripe.Checkout.Session;
	customerEmail?: string;
}) {
	const stripeCustomerId = getStripeId(args.session.customer);
	const stripePaymentIntentId = getCheckoutPaymentIntentId(args.session);

	await fetchMutation(api.billing.syncStarterLicenseTermFromServer, {
		convexWebhookMutationSecret: getConvexWebhookMutationSecret(),
		ownerClerkUserId: args.ownerClerkUserId,
		stripeCheckoutSessionId: args.session.id,
		purchasedAt: args.eventCreatedAt,
		...(stripeCustomerId ? { stripeCustomerId } : {}),
		...(args.customerEmail ? { customerEmail: args.customerEmail } : {}),
		...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
	});
	await recordProcessedStripeEvent({
		eventId: args.eventId,
		eventType: args.eventType,
		status: "applied",
		ownerClerkUserId: args.ownerClerkUserId,
		stripeObjectId: args.session.id,
	});

	return {
		kind: "starter_synced" as const,
		eventId: args.eventId,
		sessionId: args.session.id,
	};
}

async function syncWorkersSubscriptionSnapshot(args: {
	eventCreatedAt: number;
	eventId: string;
	eventType: string;
	stripeSubscriptionId: string;
	customerEmail?: string;
	ownerClerkUserId?: string;
}) {
	const subscription = await retrieveSubscription(args.stripeSubscriptionId);
	const stripeCustomerId = getStripeId(subscription.customer);
	if (!stripeCustomerId) {
		return await recordSkippedStripeEvent({
			eventId: args.eventId,
			eventType: args.eventType,
			reason: "missing_stripe_customer",
			stripeObjectId: args.stripeSubscriptionId,
		});
	}

	const storedCustomer = args.ownerClerkUserId
		? null
		: await lookupStripeCustomerOwner(stripeCustomerId);
	const ownerClerkUserId =
		args.ownerClerkUserId ??
		subscription.metadata.ownerClerkUserId ??
		subscription.metadata.clerkUserId ??
		storedCustomer?.ownerClerkUserId;
	if (!ownerClerkUserId) {
		return await recordSkippedStripeEvent({
			eventId: args.eventId,
			eventType: args.eventType,
			reason: "missing_billing_owner",
			stripeObjectId: args.stripeSubscriptionId,
		});
	}

	const firstItem = subscription.items.data[0];
	const latestInvoice = getExpandedLatestInvoice(subscription);
	const customerEmail =
		args.customerEmail ??
		getStripeCustomerEmail(subscription.customer) ??
		storedCustomer?.email;
	const stripeProductId = getStripeId(firstItem?.price.product);
	const currentPeriodStartAt = getSubscriptionItemPeriodMs(
		subscription,
		"current_period_start",
	);
	const currentPeriodEndAt = getSubscriptionItemPeriodMs(
		subscription,
		"current_period_end",
	);
	const status = getWorkersSubscriptionStatus(subscription.status);

	await fetchMutation(api.billing.syncWorkersSubscriptionFromServer, {
		convexWebhookMutationSecret: getConvexWebhookMutationSecret(),
		ownerClerkUserId,
		stripeCustomerId,
		stripeSubscriptionId: subscription.id,
		cadence: getWorkersBillingCadenceFromStripePrice(firstItem?.price),
		status,
		cancelAtPeriodEnd: subscription.cancel_at_period_end,
		...(customerEmail ? { customerEmail } : {}),
		...(firstItem?.price.id ? { stripePriceId: firstItem.price.id } : {}),
		...(stripeProductId ? { stripeProductId } : {}),
		...(currentPeriodStartAt ? { currentPeriodStartAt } : {}),
		...(currentPeriodEndAt ? { currentPeriodEndAt } : {}),
		...(status === "past_due"
			? {
					accessThroughAt:
						args.eventCreatedAt + workersFailedPaymentAccessWindowMs,
				}
			: {}),
		...(latestInvoice?.id ? { latestInvoiceId: latestInvoice.id } : {}),
		...(latestInvoice?.hosted_invoice_url
			? {
					latestInvoiceHostedUrl: latestInvoice.hosted_invoice_url,
					paymentRecoveryUrl: latestInvoice.hosted_invoice_url,
				}
			: {}),
		...(args.eventType === "invoice.payment_failed"
			? { failedPaymentStartedAt: args.eventCreatedAt }
			: {}),
		...(typeof latestInvoice?.attempt_count === "number"
			? { failedPaymentAttemptCount: latestInvoice.attempt_count }
			: {}),
		...(latestInvoice?.next_payment_attempt
			? { nextPaymentAttemptAt: latestInvoice.next_payment_attempt * 1000 }
			: {}),
		...(args.eventType === "invoice.paid"
			? { recoveredFromPastDueAt: args.eventCreatedAt }
			: {}),
		...(status === "unpaid" || status === "canceled"
			? { terminalFailureAt: args.eventCreatedAt }
			: {}),
	});
	await recordProcessedStripeEvent({
		eventId: args.eventId,
		eventType: args.eventType,
		status: "applied",
		ownerClerkUserId,
		stripeObjectId: subscription.id,
	});

	return {
		kind: "workers_synced" as const,
		eventId: args.eventId,
		stripeSubscriptionId: subscription.id,
	};
}

async function syncCheckoutSessionTarget(
	target: Extract<StripeBillingSyncTarget, { kind: "checkout_session" }>,
) {
	const session = await retrieveCheckoutSession(target.sessionId);
	if (!isPaidCheckoutSession(session)) {
		return await recordSkippedStripeEvent({
			eventId: target.eventId,
			eventType: target.eventType,
			reason: `checkout_payment_${session.payment_status}`,
			stripeObjectId: session.id,
		});
	}

	const offerId = getCheckoutOfferId(session);
	if (!offerId) {
		return await recordSkippedStripeEvent({
			eventId: target.eventId,
			eventType: target.eventType,
			reason: "missing_checkout_offer",
			stripeObjectId: session.id,
		});
	}

	const owner = await resolveCheckoutOwner(session);
	return await syncPaidCheckoutSession({
		eventCreatedAt: target.eventCreatedAt,
		eventId: target.eventId,
		eventType: target.eventType,
		offerId,
		ownerClerkUserId: owner.ownerClerkUserId,
		session,
		customerEmail: owner.customerEmail ?? getCheckoutCustomerEmail(session),
	});
}

async function syncPaidCheckoutSession(args: {
	customerEmail?: string;
	eventCreatedAt: number;
	eventId: string;
	eventType: string;
	offerId: CheckoutOfferId;
	ownerClerkUserId: string;
	session: Stripe.Checkout.Session;
}): Promise<StripeBillingSyncResult> {
	if (args.offerId === "starter") {
		return await syncStarterCheckoutSession(args);
	}

	const stripeSubscriptionId = getCheckoutSubscriptionId(args.session);
	if (!stripeSubscriptionId) {
		return await recordSkippedStripeEvent({
			eventId: args.eventId,
			eventType: args.eventType,
			reason: "workers_checkout_missing_subscription",
			stripeObjectId: args.session.id,
		});
	}

	return await syncWorkersSubscriptionSnapshot({
		eventCreatedAt: args.eventCreatedAt,
		eventId: args.eventId,
		eventType: args.eventType,
		stripeSubscriptionId,
		customerEmail: args.customerEmail,
		ownerClerkUserId: args.ownerClerkUserId,
	});
}

async function syncSubscriptionTarget(
	target: Extract<StripeBillingSyncTarget, { kind: "subscription" }>,
) {
	return await syncWorkersSubscriptionSnapshot({
		eventCreatedAt: target.eventCreatedAt,
		eventId: target.eventId,
		eventType: target.eventType,
		stripeSubscriptionId: target.stripeSubscriptionId,
	});
}

async function syncInvoiceTarget(
	target: Extract<StripeBillingSyncTarget, { kind: "invoice_subscription" }>,
) {
	if (!target.stripeSubscriptionId) {
		return await recordSkippedStripeEvent({
			eventId: target.eventId,
			eventType: target.eventType,
			reason: "invoice_missing_subscription",
			stripeObjectId: target.stripeInvoiceId,
		});
	}

	return await syncWorkersSubscriptionSnapshot({
		eventCreatedAt: target.eventCreatedAt,
		eventId: target.eventId,
		eventType: target.eventType,
		stripeSubscriptionId: target.stripeSubscriptionId,
	});
}

export async function syncStripeWebhookEventToConvex(event: Stripe.Event) {
	const target = getStripeBillingSyncTargetFromWebhookEvent(event);
	switch (target.kind) {
		case "checkout_session":
			return await syncCheckoutSessionTarget(target);
		case "subscription":
			return await syncSubscriptionTarget(target);
		case "invoice_subscription":
			return await syncInvoiceTarget(target);
		case "ignored":
			return await recordSkippedStripeEvent({
				eventId: target.eventId,
				eventType: target.eventType,
				reason: target.reason,
				stripeObjectId: target.stripeObjectId,
			});
		default:
			return target satisfies never;
	}
}

export async function syncStripeCheckoutSessionToConvex(args: {
	sessionId: string;
	source: "checkout_success";
}) {
	const session = await retrieveCheckoutSession(args.sessionId);
	if (!isPaidCheckoutSession(session)) {
		return {
			kind: "skipped" as const,
			eventId: `checkout-success:${session.id}`,
			reason: `checkout_payment_${session.payment_status}`,
		};
	}

	const offerId = getCheckoutOfferId(session);
	if (!offerId) {
		return {
			kind: "skipped" as const,
			eventId: `checkout-success:${session.id}`,
			reason: "missing_checkout_offer",
		};
	}

	const owner = await resolveCheckoutOwner(session);
	return await syncPaidCheckoutSession({
		eventCreatedAt: getCheckoutSessionSyncCreatedAt(session),
		eventId: `${args.source}:${session.id}`,
		eventType: args.source,
		offerId,
		ownerClerkUserId: owner.ownerClerkUserId,
		session,
		customerEmail: owner.customerEmail ?? getCheckoutCustomerEmail(session),
	});
}
