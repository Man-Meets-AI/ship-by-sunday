import "server-only";

import Stripe from "stripe";
import { fetchAction, fetchQuery } from "convex/nextjs";
import { cookies } from "next/headers";

import { api } from "@/convex/_generated/api";
import { PENDING_CHECKOUT_SESSION_COOKIE_NAME } from "@/platform/billing/checkout/pending-checkout-session-cookie";
import { COURSE_SLUG } from "@/lib/course/lesson/model/registry";
import { getConvexServerSession } from "@/platform/auth/convex-auth";
import { getStripe } from "@/platform/billing/stripe";

export type CheckoutSessionClaimResult =
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
			paymentStatus: Stripe.Checkout.Session.PaymentStatus;
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
			claimResult: unknown;
	  };

export type CheckoutEmailClaimResult =
	| {
			kind: "sign_in_required";
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
	  }
	| {
			kind: "validated";
			sessionId: string;
			claimResult: unknown;
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
	return (session.metadata?.courseSlug ?? COURSE_SLUG) === COURSE_SLUG;
}

export async function getCheckoutSessionForRecovery(
	sessionId: string,
): Promise<Stripe.Checkout.Session | null> {
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

export async function clearPendingCheckoutSessionCookie() {
	try {
		const cookieStore = await cookies();
		cookieStore.delete(PENDING_CHECKOUT_SESSION_COOKIE_NAME);
	} catch {
		// Unit tests and non-request code paths do not always have a request-bound cookie store.
	}
}

export async function claimCheckoutSessionForViewer(
	sessionId: string,
): Promise<CheckoutSessionClaimResult> {
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

	if (result.kind === "validated" || result.kind === "invalid_session") {
		await clearPendingCheckoutSessionCookie();
	}

	return result;
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
