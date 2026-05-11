"use node";

import Stripe from "stripe";
import { v } from "convex/values";

import { apiConfig } from "../config/product";
import { readCheckoutIntentFromMetadata } from "../platform/billing/checkout/checkout-intent";
import {
	isPaidAppCheckoutMetadata,
	readCheckoutPurchaseMetadata,
	readCheckoutMetadataClerkUserId,
} from "../platform/billing/checkout/checkout-metadata";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { requireConvexEnv } from "./env";
import { productAccessGrantResultValidator } from "./access/validators";

const supportedStripeEventTypes = new Set([
	"checkout.session.async_payment_succeeded",
	"checkout.session.completed",
]);

const stripeWebhookIgnoredResultValidator = v.object({
	kind: v.literal("ignored"),
	eventId: v.string(),
	eventType: v.string(),
});

const stripeWebhookGrantedResultValidator = v.object({
	kind: v.literal("granted"),
	eventId: v.string(),
	eventType: v.string(),
	clerkUserId: v.string(),
	grantResult: productAccessGrantResultValidator,
});

const stripeWebhookMissingCheckoutEmailResultValidator = v.object({
	kind: v.literal("missing_checkout_email"),
	eventId: v.string(),
	eventType: v.string(),
	sessionId: v.string(),
});

const stripeWebhookPaymentPendingResultValidator = v.object({
	kind: v.literal("payment_pending"),
	eventId: v.string(),
	eventType: v.string(),
	sessionId: v.string(),
	paymentStatus: v.string(),
});

const stripeWebhookDuplicateResultValidator = v.object({
	kind: v.literal("duplicate"),
	eventId: v.string(),
	eventType: v.string(),
	sessionId: v.string(),
	status: v.string(),
	resultKind: v.union(v.string(), v.null()),
});

const stripeWebhookQueuedResultValidator = v.object({
	kind: v.literal("queued"),
	eventId: v.string(),
	eventType: v.string(),
	sessionId: v.string(),
});

const stripeWebhookInvalidSignatureResultValidator = v.object({
	kind: v.literal("invalid_signature"),
	message: v.string(),
});

const stripeWebhookGrantFailedResultValidator = v.object({
	kind: v.literal("grant_failed"),
	eventId: v.string(),
	eventType: v.string(),
	sessionId: v.string(),
	clerkUserId: v.string(),
	stripeCustomerId: v.union(v.string(), v.null()),
	stripePaymentIntentId: v.union(v.string(), v.null()),
	message: v.string(),
});

const stripeWebhookFulfillmentFailedResultValidator = v.object({
	kind: v.literal("fulfillment_failed"),
	eventId: v.string(),
	eventType: v.string(),
	sessionId: v.string(),
	checkoutEmail: v.union(v.string(), v.null()),
	message: v.string(),
});

type StripeWebhookActionResult =
	| {
			kind: "ignored";
			eventId: string;
			eventType: string;
	  }
	| {
			kind: "granted";
			eventId: string;
			eventType: string;
			clerkUserId: string;
			grantResult: {
				granted: "inserted" | "patched";
			};
	  }
	| {
			kind: "missing_checkout_email";
			eventId: string;
			eventType: string;
			sessionId: string;
	  }
	| {
			kind: "payment_pending";
			eventId: string;
			eventType: string;
			sessionId: string;
			paymentStatus: string;
	  }
	| {
			kind: "duplicate";
			eventId: string;
			eventType: string;
			sessionId: string;
			status: string;
			resultKind: string | null;
	  }
	| {
			kind: "queued";
			eventId: string;
			eventType: string;
			sessionId: string;
	  }
	| {
			kind: "invalid_signature";
			message: string;
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
	  }
	| {
			kind: "fulfillment_failed";
			eventId: string;
			eventType: string;
			sessionId: string;
			checkoutEmail: string | null;
			message: string;
	  };

type StripeWebhookGrantResult = Extract<
	StripeWebhookActionResult,
	{ kind: "granted" }
>["grantResult"];
type StripeWebhookQueuedFulfillmentResult = Extract<
	StripeWebhookActionResult,
	{
		kind:
			| "granted"
			| "missing_checkout_email"
			| "payment_pending"
			| "grant_failed"
			| "fulfillment_failed";
	}
>;

function getWebhookStripe() {
	return new Stripe(requireConvexEnv("STRIPE_SECRET_KEY"), {
		apiVersion: apiConfig.stripeApiVersion,
	});
}

function getStripeCheckoutEmail(session: Stripe.Checkout.Session) {
	const checkoutEmail = session.customer_details?.email;
	return typeof checkoutEmail === "string" && checkoutEmail.length > 0
		? checkoutEmail
		: null;
}

function isFulfillableCheckoutSession(session: Stripe.Checkout.Session) {
	if (session.payment_status === "paid") {
		return true;
	}

	if (session.payment_status === "no_payment_required") {
		return session.mode === "payment";
	}

	return false;
}

function stripeWebhookEventLedgerArgs({
	event,
	session,
}: {
	event: { id: string; type: string };
	session: Stripe.Checkout.Session;
}) {
	return {
		stripeEventId: event.id,
		eventType: event.type,
		stripeObjectId: session.id,
		courseSlug: session.metadata?.courseSlug,
	};
}

async function recordStripeWebhookEventResult(
	ctx: Pick<ActionCtx, "runMutation">,
	args: ReturnType<typeof stripeWebhookEventLedgerArgs> & {
		status: "processed" | "failed" | "ignored" | "payment_pending";
		attemptCount: number;
		resultKind: string;
		errorMessage?: string;
	},
) {
	await ctx.runMutation(
		internal.stripeWebhookEvents.recordStripeWebhookEventResult,
		args,
	);
}

async function recordPurchaseIntentFulfillment(
	ctx: Pick<ActionCtx, "runMutation">,
	{
		clerkUserId,
		session,
	}: {
		clerkUserId: string;
		session: Stripe.Checkout.Session;
	},
) {
	const checkoutMetadata = readCheckoutPurchaseMetadata(session.metadata);
	if (!checkoutMetadata) {
		return;
	}

	try {
		await ctx.runMutation(
			internal.checkoutClaims.recordCheckoutPurchaseIntentFulfillment,
			{
				purchaseIntentId:
					checkoutMetadata.purchaseIntentId as Id<"checkoutPurchaseIntents">,
				stripeCheckoutSessionId: session.id,
				clerkUserId,
			},
		);
	} catch (error) {
		console.warn("unable to mark checkout purchase intent fulfilled", error);
	}
}

async function fulfillStripeCheckoutSessionEvent({
	ctx,
	eventId,
	eventType,
	ledgerAttemptCount,
	session,
}: {
	ctx: Pick<ActionCtx, "runAction" | "runMutation">;
	eventId: string;
	eventType: string;
	ledgerAttemptCount: number;
	session: Stripe.Checkout.Session;
}): Promise<StripeWebhookQueuedFulfillmentResult> {
	const ledgerArgs = stripeWebhookEventLedgerArgs({
		event: { id: eventId, type: eventType } as Stripe.Event,
		session,
	});
	const clerkUserId =
		readCheckoutMetadataClerkUserId({
			metadata: session.metadata,
			clientReferenceId: session.client_reference_id,
		}) ?? undefined;

	if (!clerkUserId) {
		const checkoutEmail = getStripeCheckoutEmail(session);
		if (!checkoutEmail) {
			await recordStripeWebhookEventResult(ctx, {
				...ledgerArgs,
				status: "failed",
				attemptCount: ledgerAttemptCount,
				resultKind: "missing_checkout_email",
				errorMessage: "Paid guest checkout session had no buyer email.",
			});

			return {
				kind: "missing_checkout_email" as const,
				eventId,
				eventType,
				sessionId: session.id,
			};
		}

		const fulfillmentResult = await ctx.runAction(
			internal.checkoutClaimsActions.fulfillCheckoutSessionByEmail,
			{
				sessionId: session.id,
				stripeEventId: eventId,
				stripeEventType: eventType,
			},
		);

		if (fulfillmentResult.kind === "fulfilled") {
			await recordPurchaseIntentFulfillment(ctx, {
				clerkUserId: fulfillmentResult.clerkUserId,
				session,
			});
			await recordStripeWebhookEventResult(ctx, {
				...ledgerArgs,
				status: "processed",
				attemptCount: ledgerAttemptCount,
				resultKind: "granted",
			});

			return {
				kind: "granted" as const,
				eventId,
				eventType,
				clerkUserId: fulfillmentResult.clerkUserId,
				grantResult: fulfillmentResult.grantResult,
			};
		}

		if (fulfillmentResult.kind === "missing_checkout_email") {
			await recordStripeWebhookEventResult(ctx, {
				...ledgerArgs,
				status: "failed",
				attemptCount: ledgerAttemptCount,
				resultKind: "missing_checkout_email",
				errorMessage: "Paid guest checkout fulfillment found no buyer email.",
			});

			return {
				kind: "missing_checkout_email" as const,
				eventId,
				eventType,
				sessionId: session.id,
			};
		}

		await recordStripeWebhookEventResult(ctx, {
			...ledgerArgs,
			status: "failed",
			attemptCount: ledgerAttemptCount,
			resultKind: "fulfillment_failed",
			errorMessage: `Paid checkout fulfillment returned ${fulfillmentResult.kind}.`,
		});

		return {
			kind: "fulfillment_failed" as const,
			eventId,
			eventType,
			sessionId: session.id,
			checkoutEmail,
			message: `Paid checkout fulfillment returned ${fulfillmentResult.kind}.`,
		};
	}

	let grantResult: StripeWebhookGrantResult;
	try {
		grantResult = (await ctx.runMutation(
			internal.access.grantProductAccessFromStripe,
			{
				clerkUserId,
				stripeCustomerId:
					typeof session.customer === "string" ? session.customer : undefined,
				stripeCheckoutSessionId: session.id,
				stripePaymentIntentId:
					typeof session.payment_intent === "string"
						? session.payment_intent
						: undefined,
				...readCheckoutIntentFromMetadata(session.metadata),
			},
		)) as StripeWebhookGrantResult;
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Unable to persist the Stripe webhook grant.";
		await recordStripeWebhookEventResult(ctx, {
			...ledgerArgs,
			status: "failed",
			attemptCount: ledgerAttemptCount,
			resultKind: "grant_failed",
			errorMessage: message,
		});

		return {
			kind: "grant_failed" as const,
			eventId,
			eventType,
			sessionId: session.id,
			clerkUserId,
			stripeCustomerId:
				typeof session.customer === "string" ? session.customer : null,
			stripePaymentIntentId:
				typeof session.payment_intent === "string"
					? session.payment_intent
					: null,
			message,
		};
	}

	await recordStripeWebhookEventResult(ctx, {
		...ledgerArgs,
		status: "processed",
		attemptCount: ledgerAttemptCount,
		resultKind: "granted",
	});
	await recordPurchaseIntentFulfillment(ctx, {
		clerkUserId,
		session,
	});

	return {
		kind: "granted" as const,
		eventId,
		eventType,
		clerkUserId,
		grantResult,
	};
}

export const processStripeWebhook = internalAction({
	args: {
		body: v.string(),
		signature: v.string(),
	},
	returns: v.union(
		stripeWebhookIgnoredResultValidator,
		stripeWebhookGrantedResultValidator,
		stripeWebhookMissingCheckoutEmailResultValidator,
		stripeWebhookPaymentPendingResultValidator,
		stripeWebhookDuplicateResultValidator,
		stripeWebhookQueuedResultValidator,
		stripeWebhookInvalidSignatureResultValidator,
		stripeWebhookGrantFailedResultValidator,
		stripeWebhookFulfillmentFailedResultValidator,
	),
	handler: async (ctx, args): Promise<StripeWebhookActionResult> => {
		let event: Stripe.Event;

		try {
			event = getWebhookStripe().webhooks.constructEvent(
				args.body,
				args.signature,
				requireConvexEnv("STRIPE_WEBHOOK_SECRET"),
			);
		} catch (error) {
			return {
				kind: "invalid_signature" as const,
				message:
					error instanceof Error ? error.message : "Unknown signature error",
			};
		}

		if (!supportedStripeEventTypes.has(event.type)) {
			return {
				kind: "ignored" as const,
				eventId: event.id,
				eventType: event.type,
			};
		}

		const session = event.data.object as Stripe.Checkout.Session;
		if (!isPaidAppCheckoutMetadata(session.metadata)) {
			return {
				kind: "ignored" as const,
				eventId: event.id,
				eventType: event.type,
			};
		}

		const ledgerArgs = stripeWebhookEventLedgerArgs({ event, session });
		const ledgerDecision = await ctx.runMutation(
			internal.stripeWebhookEvents.beginStripeWebhookEventProcessing,
			ledgerArgs,
		);
		if (ledgerDecision.decision === "skip") {
			return {
				kind: "duplicate" as const,
				eventId: event.id,
				eventType: event.type,
				sessionId: session.id,
				status: ledgerDecision.status,
				resultKind: ledgerDecision.resultKind,
			};
		}
		const ledgerAttemptCount = ledgerDecision.attemptCount;

		if (!isFulfillableCheckoutSession(session)) {
			await recordStripeWebhookEventResult(ctx, {
				...ledgerArgs,
				status: "payment_pending",
				attemptCount: ledgerAttemptCount,
				resultKind: "payment_pending",
			});

			return {
				kind: "payment_pending" as const,
				eventId: event.id,
				eventType: event.type,
				sessionId: session.id,
				paymentStatus: session.payment_status ?? "unknown",
			};
		}

		await ctx.runMutation(
			internal.stripeWebhookEvents.queueStripeWebhookEventFulfillment,
			{
				...ledgerArgs,
				stripeObjectId: session.id,
				attemptCount: ledgerAttemptCount,
			},
		);

		return {
			kind: "queued" as const,
			eventId: event.id,
			eventType: event.type,
			sessionId: session.id,
		};
	},
});

export const fulfillQueuedStripeWebhookEvent = internalAction({
	args: {
		stripeEventId: v.string(),
		eventType: v.string(),
		sessionId: v.string(),
		attemptCount: v.number(),
	},
	returns: v.union(
		stripeWebhookGrantedResultValidator,
		stripeWebhookMissingCheckoutEmailResultValidator,
		stripeWebhookPaymentPendingResultValidator,
		stripeWebhookGrantFailedResultValidator,
		stripeWebhookFulfillmentFailedResultValidator,
	),
	handler: async (ctx, args): Promise<StripeWebhookQueuedFulfillmentResult> => {
		let session: Stripe.Checkout.Session;
		try {
			session = await getWebhookStripe().checkout.sessions.retrieve(
				args.sessionId,
			);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Unable to retrieve queued Stripe Checkout Session.";
			await recordStripeWebhookEventResult(ctx, {
				stripeEventId: args.stripeEventId,
				eventType: args.eventType,
				stripeObjectId: args.sessionId,
				courseSlug: undefined,
				status: "failed",
				attemptCount: args.attemptCount,
				resultKind: "fulfillment_failed",
				errorMessage: message,
			});

			return {
				kind: "fulfillment_failed" as const,
				eventId: args.stripeEventId,
				eventType: args.eventType,
				sessionId: args.sessionId,
				checkoutEmail: null,
				message,
			};
		}

		const ledgerArgs = stripeWebhookEventLedgerArgs({
			event: {
				id: args.stripeEventId,
				type: args.eventType,
			} as Stripe.Event,
			session,
		});

		if (!isFulfillableCheckoutSession(session)) {
			await recordStripeWebhookEventResult(ctx, {
				...ledgerArgs,
				status: "payment_pending",
				attemptCount: args.attemptCount,
				resultKind: "payment_pending",
			});

			return {
				kind: "payment_pending" as const,
				eventId: args.stripeEventId,
				eventType: args.eventType,
				sessionId: session.id,
				paymentStatus: session.payment_status ?? "unknown",
			};
		}

		try {
			return await fulfillStripeCheckoutSessionEvent({
				ctx,
				eventId: args.stripeEventId,
				eventType: args.eventType,
				ledgerAttemptCount: args.attemptCount,
				session,
			});
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Queued Stripe webhook fulfillment failed.";
			await recordStripeWebhookEventResult(ctx, {
				...ledgerArgs,
				status: "failed",
				attemptCount: args.attemptCount,
				resultKind: "fulfillment_failed",
				errorMessage: message,
			});

			return {
				kind: "fulfillment_failed" as const,
				eventId: args.stripeEventId,
				eventType: args.eventType,
				sessionId: session.id,
				checkoutEmail: getStripeCheckoutEmail(session),
				message,
			};
		}
	},
});
