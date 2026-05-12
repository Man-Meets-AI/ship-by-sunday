import "server-only";

import Stripe from "stripe";
import { fetchAction, fetchQuery } from "convex/nextjs";
import { cookies } from "next/headers";

import { api } from "@/convex/_generated/api";
import { PENDING_CHECKOUT_SESSION_COOKIE_NAME } from "@/platform/billing/checkout/pending-checkout-session-cookie";
import { isPaidAppCheckoutMetadata } from "@/platform/billing/checkout/checkout-metadata";
import { getConvexServerSession } from "@/platform/auth/convex-auth";
import { getStripe } from "@/platform/billing/stripe";
import { requireServerEnv } from "@/platform/env/server";

const stripeCheckoutSessionIdPattern = /^cs_(?:test|live)_[A-Za-z0-9]+$/;

export type CheckoutSessionClaimResult =
	| {
			kind: "sign_in_required";
			sessionId: string;
			checkoutEmail?: string;
			currentAccountEmail?: string;
	  }
	| {
			kind: "invalid_session";
			sessionId: string;
	  }
	| {
			kind: "payment_pending";
			sessionId: string;
			paymentStatus: Stripe.Checkout.Session.PaymentStatus;
	  }
	| {
			kind: "missing_checkout_email";
			sessionId: string;
	  }
	| {
			kind: "wrong_account";
			sessionId: string;
			checkoutEmail?: string;
			currentAccountEmail?: string;
	  }
	| {
			kind: "validated";
			sessionId: string;
			claimResult: object | null;
	  };

export type CheckoutSessionFulfillmentResult =
	| {
			kind: "fulfilled";
			sessionId: string;
			checkoutEmail: string;
			clerkUserId: string;
			clerkUserStatus: "exists" | "created";
			grantResult: {
				granted: "inserted" | "patched";
			};
	  }
	| {
			kind: "invalid_session";
			sessionId: string;
	  }
	| {
			kind: "payment_pending";
			sessionId: string;
			paymentStatus: Stripe.Checkout.Session.PaymentStatus;
	  }
	| {
			kind: "missing_checkout_email";
			sessionId: string;
	  }
	| {
			kind: "clerk_lookup_failed" | "clerk_create_failed";
			sessionId: string;
			checkoutEmail: string;
			message: string;
	  }
	| {
			kind: "grant_failed";
			sessionId: string;
			checkoutEmail: string;
			clerkUserId: string;
			message: string;
	  }
	| {
			kind: "clerk_user_conflict";
			sessionId: string;
			checkoutEmail: string;
			matchingUserCount: number;
	  };

export type CheckoutEmailClaimResult =
	| {
			kind: "sign_in_required";
			checkoutEmail?: string;
			currentAccountEmail?: string;
	  }
	| {
			kind: "no_pending_claim";
	  }
	| {
			kind: "email_not_verified";
	  }
	| {
			kind: "wrong_account";
			sessionId: string;
			checkoutEmail?: string;
			currentAccountEmail?: string;
	  }
	| {
			kind: "validated";
			sessionId: string;
			claimResult: object | null;
	  };

export function getStripeCheckoutSessionEmail(
	session: Stripe.Checkout.Session,
): string | null {
	const checkoutEmail = session.customer_details?.email;
	return typeof checkoutEmail === "string" && checkoutEmail.length > 0
		? checkoutEmail
		: null;
}

export function isStripeCheckoutSessionPaid(
	session: Stripe.Checkout.Session,
): boolean {
	return (
		session.payment_status === "paid" ||
		session.payment_status === "no_payment_required"
	);
}

export function isStripeCheckoutSessionForCourse(
	session: Stripe.Checkout.Session,
): boolean {
	return isPaidAppCheckoutMetadata(session.metadata);
}

export async function getCheckoutSessionForRecovery(
	sessionId: string,
): Promise<Stripe.Checkout.Session | null> {
	if (!stripeCheckoutSessionIdPattern.test(sessionId)) {
		return null;
	}

	try {
		return await getStripe().checkout.sessions.retrieve(sessionId);
	} catch (error) {
		if (
			error instanceof Stripe.errors.StripeError &&
			error.type === "StripeInvalidRequestError"
		) {
			return null;
		}

		throw error;
	}
}

export async function getPendingCheckoutSessionIdFromCookie() {
	const cookieStore = await cookies();
	return cookieStore.get(PENDING_CHECKOUT_SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getValidatedPendingCheckoutEmailFromCookie() {
	const pendingCheckoutSessionId =
		await getPendingCheckoutSessionIdFromCookie();
	if (!pendingCheckoutSessionId) {
		return null;
	}

	const session = await getCheckoutSessionForRecovery(pendingCheckoutSessionId);
	if (!session) {
		return null;
	}

	if (
		!isStripeCheckoutSessionForCourse(session) ||
		!isStripeCheckoutSessionPaid(session)
	) {
		return null;
	}

	return getStripeCheckoutSessionEmail(session);
}

export async function claimCheckoutSessionForViewer(
	sessionId: string,
): Promise<CheckoutSessionClaimResult> {
	if (!stripeCheckoutSessionIdPattern.test(sessionId)) {
		return {
			kind: "invalid_session",
			sessionId,
		};
	}

	const session = await getConvexServerSession();
	if (!session.token) {
		return {
			kind: "sign_in_required",
			sessionId,
		};
	}

	const result = (await fetchAction(
		api.checkoutClaimsActions.claimCheckoutSessionForViewer,
		{ sessionId },
		{ token: session.token },
	)) as CheckoutSessionClaimResult;

	return result;
}

export async function fulfillCheckoutSessionFromSuccessPage(
	sessionId: string,
): Promise<CheckoutSessionFulfillmentResult> {
	if (!stripeCheckoutSessionIdPattern.test(sessionId)) {
		return {
			kind: "invalid_session",
			sessionId,
		};
	}

	return (await fetchAction(
		api.checkoutClaimsActions.fulfillCheckoutSessionFromSuccessPage,
		{
			fulfillmentToken: requireServerEnv("CHECKOUT_FULFILLMENT_RETRY_SECRET"),
			sessionId,
		},
	)) as CheckoutSessionFulfillmentResult;
}

export async function claimLatestPendingCheckoutForViewer(): Promise<CheckoutEmailClaimResult> {
	const session = await getConvexServerSession();
	if (!session.token) {
		return {
			kind: "sign_in_required",
		};
	}

	return (await fetchAction(
		api.checkoutClaimsActions.claimLatestPendingCheckoutForViewer,
		{},
		{ token: session.token },
	)) as CheckoutEmailClaimResult;
}

export async function fetchViewerProductAccess() {
	const session = await getConvexServerSession();
	if (!session.token) {
		return null;
	}

	return await fetchQuery(
		api.access.viewerProductAccess,
		{},
		{ token: session.token },
	);
}
