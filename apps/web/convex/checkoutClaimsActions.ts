"use node";

import Stripe from "stripe";
import { v } from "convex/values";

import { apiConfig, PRODUCT_COURSE_SLUG } from "../config/product";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { productAccessGrantResultValidator } from "./access/validators";
import { requireConvexEnv } from "./env";

const checkoutClaimActionResultValidator = v.union(
	v.object({
		kind: v.literal("sign_in_required"),
		sessionId: v.string(),
	}),
	v.object({
		kind: v.literal("invalid_session"),
		sessionId: v.string(),
	}),
	v.object({
		kind: v.literal("payment_pending"),
		sessionId: v.string(),
		paymentStatus: v.string(),
	}),
	v.object({
		kind: v.literal("missing_checkout_email"),
		sessionId: v.string(),
	}),
	v.object({
		kind: v.literal("wrong_account"),
		sessionId: v.string(),
	}),
	v.object({
		kind: v.literal("validated"),
		sessionId: v.string(),
		claimResult: v.union(
			productAccessGrantResultValidator,
			v.object({
				claim: v.literal("claimed"),
				grantResult: productAccessGrantResultValidator,
			}),
			v.object({
				claim: v.literal("already_claimed"),
				grantResult: productAccessGrantResultValidator,
			}),
		),
	}),
);

type CheckoutClaimActionResult =
	| {
			kind: "sign_in_required";
			sessionId: string;
	  }
	| {
			kind: "invalid_session";
			sessionId: string;
	  }
	| {
			kind: "payment_pending";
			sessionId: string;
			paymentStatus: string;
	  }
	| {
			kind: "missing_checkout_email";
			sessionId: string;
	  }
	| {
			kind: "wrong_account";
			sessionId: string;
	  }
	| {
			kind: "validated";
			sessionId: string;
			claimResult:
				| {
						granted: "inserted" | "patched";
				  }
				| {
						claim: "claimed" | "already_claimed";
						grantResult: {
							granted: "inserted" | "patched";
						};
				  };
	  };

function getStripeClient() {
	return new Stripe(requireConvexEnv("STRIPE_SECRET_KEY"), {
		apiVersion: apiConfig.stripeApiVersion,
	});
}

function getCheckoutEmail(session: Stripe.Checkout.Session) {
	const checkoutEmail = session.customer_details?.email;
	return typeof checkoutEmail === "string" && checkoutEmail.length > 0
		? checkoutEmail
		: null;
}

export const claimCheckoutSessionForViewer = action({
	args: {
		sessionId: v.string(),
	},
	returns: checkoutClaimActionResultValidator,
	handler: async (ctx, args): Promise<CheckoutClaimActionResult> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return {
				kind: "sign_in_required" as const,
				sessionId: args.sessionId,
			};
		}

		let session: Stripe.Checkout.Session;
		try {
			session = await getStripeClient().checkout.sessions.retrieve(
				args.sessionId,
			);
		} catch (error) {
			if (
				error instanceof Stripe.errors.StripeError &&
				error.type === "StripeInvalidRequestError"
			) {
				return {
					kind: "invalid_session" as const,
					sessionId: args.sessionId,
				};
			}

			throw error;
		}

		const sessionCourseSlug =
			session.metadata?.courseSlug ?? PRODUCT_COURSE_SLUG;
		if (sessionCourseSlug !== PRODUCT_COURSE_SLUG) {
			return {
				kind: "invalid_session" as const,
				sessionId: session.id,
			};
		}

		if (
			session.payment_status !== "paid" &&
			session.payment_status !== "no_payment_required"
		) {
			return {
				kind: "payment_pending" as const,
				sessionId: session.id,
				paymentStatus: session.payment_status,
			};
		}

		const checkoutSessionClerkUserId =
			session.metadata?.clerkUserId ?? session.client_reference_id ?? null;

		if (checkoutSessionClerkUserId) {
			if (checkoutSessionClerkUserId !== identity.subject) {
				return {
					kind: "wrong_account" as const,
					sessionId: session.id,
				};
			}

			const grantResult: { granted: "inserted" | "patched" } =
				await ctx.runMutation(internal.access.grantProductAccessFromStripe, {
					clerkUserId: identity.subject,
					stripeCustomerId:
						typeof session.customer === "string" ? session.customer : undefined,
					stripeCheckoutSessionId: session.id,
					stripePaymentIntentId:
						typeof session.payment_intent === "string"
							? session.payment_intent
							: undefined,
				});

			return {
				kind: "validated" as const,
				sessionId: session.id,
				claimResult: grantResult,
			};
		}

		const checkoutEmail = getCheckoutEmail(session);
		if (!checkoutEmail) {
			return {
				kind: "missing_checkout_email" as const,
				sessionId: session.id,
			};
		}

		await ctx.runMutation(
			internal.checkoutClaims.upsertPendingCheckoutClaimFromStripe,
			{
				stripeCheckoutSessionId: session.id,
				checkoutEmail,
				courseSlug: sessionCourseSlug,
				paymentStatus: session.payment_status,
				stripeCustomerId:
					typeof session.customer === "string" ? session.customer : undefined,
				stripePaymentIntentId:
					typeof session.payment_intent === "string"
						? session.payment_intent
						: undefined,
				stripeEventId: `claim:${session.id}`,
				stripeEventType: "checkout.success.claim",
			},
		);

		const claimResult:
			| {
					claim: "claimed" | "already_claimed";
					grantResult: {
						granted: "inserted" | "patched";
					};
			  }
			| {
					claim:
						| "claimed_by_other_user"
						| "email_mismatch"
						| "email_not_verified"
						| "missing_claim";
			  } = await ctx.runMutation(
			internal.checkoutClaims.claimPendingCheckoutClaim,
			{
				stripeCheckoutSessionId: session.id,
			},
		);

		switch (claimResult.claim) {
			case "claimed":
			case "already_claimed":
				return {
					kind: "validated" as const,
					sessionId: session.id,
					claimResult,
				};
			case "claimed_by_other_user":
			case "email_mismatch":
			case "email_not_verified":
				return {
					kind: "wrong_account" as const,
					sessionId: session.id,
				};
			case "missing_claim":
				return {
					kind: "invalid_session" as const,
					sessionId: session.id,
				};
			default:
				return claimResult satisfies never;
		}
	},
});
