import "server-only";

import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

import { COURSE_SLUG } from "@/features/course/lesson/model/registry";
import { getStripe } from "@/platform/billing/stripe";

export type CheckoutSessionState =
	| {
			kind: "missing_session_id";
	  }
	| {
			kind: "invalid_session";
			sessionId: string;
	  }
	| {
			kind: "sign_in_required";
			sessionId: string;
	  }
	| {
			kind: "wrong_account";
			sessionId: string;
	  }
	| {
			kind: "payment_pending";
			sessionId: string;
			paymentStatus: Stripe.Checkout.Session.PaymentStatus;
	  }
	| {
			kind: "validated";
			sessionId: string;
	  };

export async function getCheckoutSessionState(
	sessionId: string | undefined,
): Promise<CheckoutSessionState> {
	if (!sessionId) {
		return { kind: "missing_session_id" };
	}

	let session: Stripe.Checkout.Session;
	try {
		session = await getStripe().checkout.sessions.retrieve(sessionId);
	} catch (error) {
		if (
			error instanceof Stripe.errors.StripeError &&
			error.type === "StripeInvalidRequestError"
		) {
			return {
				kind: "invalid_session",
				sessionId,
			};
		}

		throw error;
	}

	const sessionCourseSlug = session.metadata?.courseSlug ?? COURSE_SLUG;
	const clerkUserId =
		session.metadata?.clerkUserId ?? session.client_reference_id ?? null;
	if (!clerkUserId || sessionCourseSlug !== COURSE_SLUG) {
		return {
			kind: "invalid_session",
			sessionId,
		};
	}

	const authState = await auth();
	if (!authState.userId) {
		return {
			kind: "sign_in_required",
			sessionId,
		};
	}

	if (authState.userId !== clerkUserId) {
		return {
			kind: "wrong_account",
			sessionId,
		};
	}

	if (
		session.payment_status !== "paid" &&
		session.payment_status !== "no_payment_required"
	) {
		return {
			kind: "payment_pending",
			sessionId,
			paymentStatus: session.payment_status,
		};
	}

	return {
		kind: "validated",
		sessionId,
	};
}
