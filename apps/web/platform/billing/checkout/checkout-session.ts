import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import type Stripe from "stripe";

import {
	claimCheckoutSessionForViewer,
	clearPendingCheckoutSessionCookie,
	getCheckoutSessionForRecovery,
	isStripeCheckoutSessionForCourse,
	isStripeCheckoutSessionPaid,
} from "@/platform/billing/checkout/checkout-session-recovery";

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
			checkoutEmail?: string;
			currentAccountEmail?: string;
	  }
	| {
			kind: "wrong_account";
			sessionId: string;
			checkoutEmail?: string;
			currentAccountEmail?: string;
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

function getCheckoutStateFromClaimResult(
	claimResult: Awaited<ReturnType<typeof claimCheckoutSessionForViewer>>,
	sessionId: string,
	safeCheckoutEmail: string | undefined,
	currentAccountEmail: string | undefined,
): CheckoutSessionState {
	switch (claimResult.kind) {
		case "validated":
			return {
				kind: "validated",
				sessionId,
			};
		case "wrong_account":
			return {
				kind: "wrong_account",
				sessionId,
				checkoutEmail: claimResult.checkoutEmail ?? safeCheckoutEmail,
				currentAccountEmail:
					claimResult.currentAccountEmail ?? currentAccountEmail,
			};
		case "payment_pending":
			return {
				kind: "payment_pending",
				sessionId,
				paymentStatus: claimResult.paymentStatus,
			};
		case "sign_in_required":
			return {
				kind: "sign_in_required",
				sessionId,
				checkoutEmail: claimResult.checkoutEmail ?? safeCheckoutEmail,
				currentAccountEmail:
					claimResult.currentAccountEmail ?? currentAccountEmail,
			};
		case "invalid_session":
		case "missing_checkout_email":
			return {
				kind: "invalid_session",
				sessionId,
			};
		default:
			return claimResult satisfies never;
	}
}

async function getCurrentAccountEmail() {
	const user = await currentUser();
	return user?.primaryEmailAddress?.emailAddress ?? undefined;
}

export async function getCheckoutSessionState(
	sessionId: string | undefined,
): Promise<CheckoutSessionState> {
	if (!sessionId) {
		return { kind: "missing_session_id" };
	}

	const session = await getCheckoutSessionForRecovery(sessionId);
	if (!session) {
		await clearPendingCheckoutSessionCookie();
		return {
			kind: "invalid_session",
			sessionId,
		};
	}

	const clerkUserId =
		session.metadata?.clerkUserId ?? session.client_reference_id ?? null;
	if (!isStripeCheckoutSessionForCourse(session)) {
		await clearPendingCheckoutSessionCookie();
		return {
			kind: "invalid_session",
			sessionId,
		};
	}

	const safeCheckoutEmail = isStripeCheckoutSessionPaid(session)
		? (session.customer_details?.email ?? undefined)
		: undefined;

	if (!clerkUserId) {
		if (!isStripeCheckoutSessionPaid(session)) {
			return {
				kind: "payment_pending",
				sessionId,
				paymentStatus: session.payment_status,
			};
		}

		const authState = await auth();
		if (!authState.userId) {
			return {
				kind: "sign_in_required",
				sessionId,
				checkoutEmail: safeCheckoutEmail,
			};
		}

		const currentAccountEmail = await getCurrentAccountEmail();
		const claimResult = await claimCheckoutSessionForViewer(sessionId);
		return getCheckoutStateFromClaimResult(
			claimResult,
			sessionId,
			safeCheckoutEmail,
			currentAccountEmail,
		);
	}

	const authState = await auth();
	if (!authState.userId) {
		return {
			kind: "sign_in_required",
			sessionId,
			checkoutEmail: safeCheckoutEmail,
		};
	}

	if (authState.userId !== clerkUserId) {
		return {
			kind: "wrong_account",
			sessionId,
			checkoutEmail: safeCheckoutEmail,
			currentAccountEmail: await getCurrentAccountEmail(),
		};
	}

	if (isStripeCheckoutSessionPaid(session)) {
		const claimResult = await claimCheckoutSessionForViewer(sessionId);
		return getCheckoutStateFromClaimResult(
			claimResult,
			sessionId,
			safeCheckoutEmail,
			await getCurrentAccountEmail(),
		);
	}

	return {
		kind: "payment_pending",
		sessionId,
		paymentStatus: session.payment_status,
	};
}
