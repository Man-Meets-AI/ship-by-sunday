"use node";

import Stripe from "stripe";
import { v } from "convex/values";

import { apiConfig, PRODUCT_COURSE_SLUG } from "../config/product";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { requireConvexEnv } from "./env";
import { productAccessGrantResultValidator } from "./access/validators";
import { pendingCheckoutClaimWriteResultValidator } from "./checkoutClaims";

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

const stripeWebhookPendingClaimSavedResultValidator = v.object({
	kind: v.literal("pending_claim_saved"),
	eventId: v.string(),
	eventType: v.string(),
	sessionId: v.string(),
	checkoutEmail: v.string(),
	saveResult: pendingCheckoutClaimWriteResultValidator,
});

const stripeWebhookMissingCheckoutEmailResultValidator = v.object({
	kind: v.literal("missing_checkout_email"),
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
			kind: "pending_claim_saved";
			eventId: string;
			eventType: string;
			sessionId: string;
			checkoutEmail: string;
			saveResult: {
				saved: "inserted" | "patched";
			};
	  }
	| {
			kind: "missing_checkout_email";
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
	  };

type StripeWebhookGrantResult = Extract<
	StripeWebhookActionResult,
	{ kind: "granted" }
>["grantResult"];

type StripeWebhookPendingClaimSaveResult = Extract<
	StripeWebhookActionResult,
	{ kind: "pending_claim_saved" }
>["saveResult"];

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

export const processStripeWebhook = internalAction({
	args: {
		body: v.string(),
		signature: v.string(),
	},
	returns: v.union(
		stripeWebhookIgnoredResultValidator,
		stripeWebhookGrantedResultValidator,
		stripeWebhookPendingClaimSavedResultValidator,
		stripeWebhookMissingCheckoutEmailResultValidator,
		stripeWebhookInvalidSignatureResultValidator,
		stripeWebhookGrantFailedResultValidator,
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
		const sessionCourseSlug =
			session.metadata?.courseSlug ?? PRODUCT_COURSE_SLUG;
		if (sessionCourseSlug !== PRODUCT_COURSE_SLUG) {
			return {
				kind: "ignored" as const,
				eventId: event.id,
				eventType: event.type,
			};
		}

		const clerkUserId =
			session.metadata?.clerkUserId ?? session.client_reference_id ?? undefined;

		if (!clerkUserId) {
			const checkoutEmail = getStripeCheckoutEmail(session);
			if (!checkoutEmail) {
				return {
					kind: "missing_checkout_email" as const,
					eventId: event.id,
					eventType: event.type,
					sessionId: session.id,
				};
			}

			let saveResult: StripeWebhookPendingClaimSaveResult;
			try {
				saveResult = (await ctx.runMutation(
					internal.checkoutClaims.upsertPendingCheckoutClaimFromStripe,
					{
						stripeCheckoutSessionId: session.id,
						checkoutEmail,
						courseSlug: sessionCourseSlug,
						paymentStatus:
							session.payment_status === "no_payment_required"
								? "no_payment_required"
								: "paid",
						stripeCustomerId:
							typeof session.customer === "string"
								? session.customer
								: undefined,
						stripePaymentIntentId:
							typeof session.payment_intent === "string"
								? session.payment_intent
								: undefined,
						stripeEventId: event.id,
						stripeEventType: event.type,
					},
				)) as StripeWebhookPendingClaimSaveResult;
			} catch (error) {
				throw error;
			}

			return {
				kind: "pending_claim_saved" as const,
				eventId: event.id,
				eventType: event.type,
				sessionId: session.id,
				checkoutEmail,
				saveResult,
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
				},
			)) as StripeWebhookGrantResult;
		} catch (error) {
			return {
				kind: "grant_failed" as const,
				eventId: event.id,
				eventType: event.type,
				sessionId: session.id,
				clerkUserId,
				stripeCustomerId:
					typeof session.customer === "string" ? session.customer : null,
				stripePaymentIntentId:
					typeof session.payment_intent === "string"
						? session.payment_intent
						: null,
				message:
					error instanceof Error
						? error.message
						: "Unable to persist the Stripe webhook grant.",
			};
		}

		return {
			kind: "granted" as const,
			eventId: event.id,
			eventType: event.type,
			clerkUserId,
			grantResult,
		};
	},
});
