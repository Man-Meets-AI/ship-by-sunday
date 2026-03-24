"use node";

import Stripe from "stripe";
import { v } from "convex/values";

import { apiConfig } from "../config/product";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
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

const stripeWebhookMissingUserResultValidator = v.object({
	kind: v.literal("missing_clerk_user"),
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
			kind: "missing_clerk_user";
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

function getWebhookStripe() {
	return new Stripe(requireConvexEnv("STRIPE_SECRET_KEY"), {
		apiVersion: apiConfig.stripeApiVersion,
	});
}

export const processStripeWebhook = internalAction({
	args: {
		body: v.string(),
		signature: v.string(),
	},
	returns: v.union(
		stripeWebhookIgnoredResultValidator,
		stripeWebhookGrantedResultValidator,
		stripeWebhookMissingUserResultValidator,
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
		const clerkUserId =
			session.metadata?.clerkUserId ?? session.client_reference_id ?? undefined;

		if (!clerkUserId) {
			return {
				kind: "missing_clerk_user" as const,
				eventId: event.id,
				eventType: event.type,
				sessionId: session.id,
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
