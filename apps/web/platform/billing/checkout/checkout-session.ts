import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import type Stripe from "stripe";

import {
	claimCheckoutSessionForViewer,
	getCheckoutSessionForRecovery,
	isStripeCheckoutSessionForCourse,
	isStripeCheckoutSessionPaid,
} from "@/platform/billing/checkout/checkout-session-recovery";
import {
	readCheckoutIntentFromMetadata,
	type FulfillmentTrack,
} from "@/platform/billing/checkout/checkout-intent";

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
			kind: "checkout_email_handoff_required";
			sessionId: string;
			checkoutEmail: string;
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
			fulfillmentTrack: FulfillmentTrack;
	  };

function getCheckoutStateFromClaimResult(
	claimResult: Awaited<ReturnType<typeof claimCheckoutSessionForViewer>>,
	sessionId: string,
	fulfillmentTrack: FulfillmentTrack,
	safeCheckoutEmail: string | undefined,
	currentAccountEmail: string | undefined,
): CheckoutSessionState {
	switch (claimResult.kind) {
		case "validated":
			return {
				kind: "validated",
				sessionId,
				fulfillmentTrack,
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
		/* c8 ignore next 2 */
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
		return {
			kind: "invalid_session",
			sessionId,
		};
	}

	const clerkUserId =
		session.metadata?.clerkUserId ?? session.client_reference_id ?? null;
	if (!isStripeCheckoutSessionForCourse(session)) {
		return {
			kind: "invalid_session",
			sessionId,
		};
	}

	const safeCheckoutEmail = isStripeCheckoutSessionPaid(session)
		? (session.customer_details?.email ?? undefined)
		: undefined;
	const fulfillmentTrack = readCheckoutIntentFromMetadata(
		session.metadata,
	).fulfillmentTrack;

	if (!clerkUserId) {
		if (!isStripeCheckoutSessionPaid(session)) {
			return {
				kind: "payment_pending",
				sessionId,
				paymentStatus: session.payment_status,
			};
		}

		const authState = await auth();
		const currentAccountEmail = authState.userId
			? await getCurrentAccountEmail()
			: undefined;
		if (!authState.userId) {
			if (safeCheckoutEmail) {
				return {
					kind: "checkout_email_handoff_required",
					sessionId,
					checkoutEmail: safeCheckoutEmail,
				};
			}

			return {
				kind: "sign_in_required",
				sessionId,
				checkoutEmail: safeCheckoutEmail,
				currentAccountEmail,
			};
		}

		const claimResult = await claimCheckoutSessionForViewer(sessionId);
		return getCheckoutStateFromClaimResult(
			claimResult,
			sessionId,
			fulfillmentTrack,
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
			fulfillmentTrack,
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
