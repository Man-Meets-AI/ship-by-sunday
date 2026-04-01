import {
	getCheckoutSuccessHref,
	getSignInRedirectHref,
	routeConfig,
} from "@/config/product";
import { buildSignUpHref } from "@/features/auth/sign-in/sign-in-route-utils";
import { assertNever } from "@/features/course/lesson/lib/assert";
import type { CheckoutSessionState } from "@/features/checkout/server/checkout-session";
import { workspaceDisplayConfig } from "@/features/starter/lib/starter-selectors";

export type CheckoutProgressState = "complete" | "active" | "pending";

export type CheckoutProgressStep = {
	label: string;
	state: CheckoutProgressState;
	detail: string;
};

export type CheckoutViewModel = {
	shellTitle: string;
	shellSubtitle: string;
	statusLabel: string;
	heading: string;
	body: string;
	progressSteps: readonly CheckoutProgressStep[];
	helpTitle: string;
	helpLeadCopy: string;
	helpItems: readonly string[];
	primaryActionLabel: string;
	primaryActionHref: string;
	alternateActionLabel?: string;
	alternateActionHref?: string;
	primaryActionBody: string;
	secondaryActionBody: string;
};

const workspaceOpenLabel = workspaceDisplayConfig.openHomeActionLabel;
const workspaceNoun = workspaceDisplayConfig.homeNoun;
const workspaceRouteStepLabel = workspaceDisplayConfig.firstStepLabel;

export const validatedStatusCopy = [
	"Confirming your product access.",
	"Unlocking your workspace.",
	`Preparing your first ${workspaceRouteStepLabel}.`,
] as const;

export function getCheckoutViewModel(
	checkoutSessionState: CheckoutSessionState,
	isAccessReady: boolean,
	validatedStatusLabel: string,
): CheckoutViewModel {
	switch (checkoutSessionState.kind) {
		case "validated":
			return {
				shellTitle: "Payment received",
				shellSubtitle: "We’re unlocking your access now.",
				statusLabel: isAccessReady ? "Access ready" : validatedStatusLabel,
				heading: isAccessReady
					? `Opening ${workspaceNoun}`
					: "Finalizing access",
				body: isAccessReady
					? `Your access is live. Sending you into the ${workspaceNoun} now.`
					: `This page will send you into the ${workspaceNoun} automatically as soon as access is ready. If it takes longer than a few seconds, use one of the buttons below.`,
				progressSteps: [
					{
						label: "Payment confirmed",
						state: "complete",
						detail: "Stripe marked the checkout as paid.",
					},
					{
						label: "Access handoff",
						state: isAccessReady ? "complete" : "active",
						detail: isAccessReady
							? "Product access is attached to this account."
							: "We are polling for the access grant now.",
					},
					{
						label: workspaceOpenLabel,
						state: isAccessReady ? "active" : "pending",
						detail: isAccessReady
							? "Redirect is ready."
							: `${workspaceDisplayConfig.homeLabel} opens once access confirms.`,
					},
				],
				helpTitle: isAccessReady ? "Access confirmed" : "What happens next",
				helpLeadCopy: isAccessReady
					? "Your purchase and product access are both confirmed. The next step is just getting you into the workspace."
					: "Stripe is done. This page is checking your account access and will forward you automatically once product access is ready.",
				helpItems: isAccessReady
					? [
							`Use ${workspaceOpenLabel} if the redirect has not fired yet.`,
							"Refresh this page if the redirect feels stalled.",
							"Keep this tab if you want a clean post-purchase handoff.",
						]
					: [
							"Keep this tab open for a few seconds while the access grant catches up.",
							"If you signed in with a different email, fix that first before retrying.",
							`Use ${workspaceOpenLabel} if you want to retry the ${workspaceNoun} gate now.`,
						],
				primaryActionLabel: workspaceOpenLabel,
				primaryActionHref: routeConfig.start,
				primaryActionBody: isAccessReady
					? `Your access is ready. Open the ${workspaceNoun} now if you do not want to wait for the redirect.`
					: `If the handoff already finished in the background, this will take you into the ${workspaceNoun}. Otherwise it will re-run the ${workspaceNoun} gate.`,
				secondaryActionBody: `Use ${workspaceOpenLabel} to retry the ${workspaceNoun} gate if the handoff feels stalled.`,
			};
		case "sign_in_required":
			return {
				shellTitle: "Finish access handoff",
				shellSubtitle:
					"Sign in with the same account you used at checkout so we can attach access.",
				statusLabel: "Sign in required",
				heading: "Sign in to continue",
				body: "We found the checkout session, but this browser is not signed in. Use the same email you used during checkout, then we can finish the access handoff.",
				progressSteps: [
					{
						label: "Checkout found",
						state: "complete",
						detail: "We located the Stripe session from this success URL.",
					},
					{
						label: "Sign in",
						state: "active",
						detail: "Use the same email used during checkout.",
					},
					{
						label: "Unlock access",
						state: "pending",
						detail: "Product access attaches after account auth.",
					},
				],
				helpTitle: "Use the checkout account",
				helpLeadCopy:
					"This browser is not signed in, so we cannot attach the completed checkout to an account yet.",
				helpItems: [
					"Sign in with the same email you used during payment.",
					"If you paid before creating an account, use Create account instead.",
					"Return to this tab after sign-in so the access handoff can finish.",
					"Do not start a second checkout unless payment actually failed.",
				],
				primaryActionLabel: "Sign in",
				primaryActionHref: getSignInRedirectHref(
					getCheckoutSuccessHref(checkoutSessionState.sessionId),
				),
				alternateActionLabel: "Create account",
				alternateActionHref: buildSignUpHref({
					redirectPath: getCheckoutSuccessHref(checkoutSessionState.sessionId),
					sessionId: checkoutSessionState.sessionId,
				}),
				primaryActionBody:
					"Use the exact email from checkout so we can attach the purchase to the right account.",
				secondaryActionBody: `After sign-in, come back here or use ${workspaceOpenLabel} to retry the ${workspaceNoun} gate.`,
			};
		case "wrong_account":
			return {
				shellTitle: "Wrong account for this checkout",
				shellSubtitle:
					"This browser is signed into a different account than the one used at checkout.",
				statusLabel: "Account mismatch",
				heading: "Use the checkout account",
				body: `The checkout session belongs to a different Clerk account. Sign in with the same email you used during payment, then retry this page or use ${workspaceOpenLabel.toLowerCase()}.`,
				progressSteps: [
					{
						label: "Checkout found",
						state: "complete",
						detail: "The payment session exists and looks valid.",
					},
					{
						label: "Account match",
						state: "active",
						detail: "Switch to the email used at checkout.",
					},
					{
						label: "Unlock access",
						state: "pending",
						detail: "Access can only attach after the account matches.",
					},
				],
				helpTitle: "Account mismatch",
				helpLeadCopy:
					"The purchase exists, but it belongs to a different signed-in account than the one currently open here.",
				helpItems: [
					"Switch to the email used at checkout.",
					`Then use ${workspaceOpenLabel} to retry the ${workspaceNoun} gate.`,
					`${workspaceOpenLabel} only after the correct account is attached.`,
				],
				primaryActionLabel: workspaceOpenLabel,
				primaryActionHref: routeConfig.start,
				primaryActionBody: `If the handoff already finished in the background, this will take you into the ${workspaceNoun}. Otherwise it will re-run the ${workspaceNoun} gate.`,
				secondaryActionBody: `Use ${workspaceOpenLabel} after switching accounts to retry the ${workspaceNoun} gate.`,
			};
		case "payment_pending":
			return {
				shellTitle: "Payment still processing",
				shellSubtitle:
					"We found the checkout session, but Stripe has not marked payment complete yet.",
				statusLabel: `Payment status: ${checkoutSessionState.paymentStatus}`,
				heading: "Payment pending",
				body: "Stripe has not finalized this payment yet. Wait for payment confirmation, then return here to finish the access handoff.",
				progressSteps: [
					{
						label: "Checkout found",
						state: "complete",
						detail: "The Stripe session was located successfully.",
					},
					{
						label: "Payment confirm",
						state: "active",
						detail: "Stripe has not finalized this payment yet.",
					},
					{
						label: "Unlock access",
						state: "pending",
						detail: "Product access waits for Stripe confirmation.",
					},
				],
				helpTitle: "Waiting on Stripe",
				helpLeadCopy:
					"The success URL resolved, but Stripe still has the payment in a non-final state.",
				helpItems: [
					"Give Stripe another moment to settle the payment.",
					"Come back to this page from the same browser after payment confirms.",
					"Do not retry checkout unless Stripe shows the payment failed.",
				],
				primaryActionLabel: workspaceOpenLabel,
				primaryActionHref: routeConfig.start,
				primaryActionBody: `If the handoff already finished in the background, this will take you into the ${workspaceNoun}. Otherwise it will re-run the ${workspaceNoun} gate.`,
				secondaryActionBody: `Use ${workspaceOpenLabel} once payment settles to retry the ${workspaceNoun} gate.`,
			};
		case "invalid_session":
			return {
				shellTitle: "Checkout session not found",
				shellSubtitle:
					"We could not verify the Stripe checkout session attached to this URL.",
				statusLabel: "Session invalid",
				heading: "Unable to confirm payment",
				body: `This page needs a valid Stripe success URL to confirm payment. If you already bought access, use ${workspaceOpenLabel.toLowerCase()} from the same account used at checkout.`,
				progressSteps: [
					{
						label: "Checkout found",
						state: "active",
						detail: "This URL did not resolve to a valid Stripe session.",
					},
					{
						label: "Access handoff",
						state: "pending",
						detail: "We need a verified checkout session first.",
					},
					{
						label: workspaceOpenLabel,
						state: "pending",
						detail: `${workspaceDisplayConfig.homeLabel} stays locked until purchase is confirmed.`,
					},
				],
				helpTitle: "Session could not be verified",
				helpLeadCopy:
					"This URL does not include a Stripe session we can trust for the access handoff.",
				helpItems: [
					"Return to checkout from the offer page if you still need to buy.",
					`Use ${workspaceOpenLabel} if you already paid in this account.`,
					"Keep the success URL intact when testing the live handoff.",
				],
				primaryActionLabel: workspaceOpenLabel,
				primaryActionHref: routeConfig.start,
				primaryActionBody: `If the handoff already finished in the background, this will take you into the ${workspaceNoun}. Otherwise it will re-run the ${workspaceNoun} gate.`,
				secondaryActionBody: `Use ${workspaceOpenLabel} to retry the ${workspaceNoun} gate if payment was already confirmed.`,
			};
		case "missing_session_id":
			return {
				shellTitle: "Complete your access check",
				shellSubtitle:
					"This page works best when you arrive from Stripe with a checkout session attached.",
				statusLabel: "Missing checkout session",
				heading: "Verify access",
				body: `If you already bought access, use ${workspaceOpenLabel.toLowerCase()} from the same signed-in account. Otherwise, return home and start checkout again.`,
				progressSteps: [
					{
						label: "Checkout found",
						state: "pending",
						detail: "No Stripe session is attached to this URL.",
					},
					{
						label: "Access handoff",
						state: "pending",
						detail: `Use ${workspaceDisplayConfig.homeNoun} if you already paid.`,
					},
					{
						label: workspaceOpenLabel,
						state: "pending",
						detail: "Start checkout first if access has not been purchased.",
					},
				],
				helpTitle: "No checkout session attached",
				helpLeadCopy:
					"This page works as a recovery surface, but it is strongest when it arrives directly from Stripe.",
				helpItems: [
					`Use ${workspaceOpenLabel} if you already completed purchase on this account.`,
					"Return home if you still need to start checkout.",
					"Keep the same browser session for the cleanest handoff.",
				],
				primaryActionLabel: workspaceOpenLabel,
				primaryActionHref: routeConfig.start,
				primaryActionBody: `If the handoff already finished in the background, this will take you into the ${workspaceNoun}. Otherwise it will re-run the ${workspaceNoun} gate.`,
				secondaryActionBody: `Use ${workspaceOpenLabel} to retry the ${workspaceNoun} gate if access should already be live.`,
			};
	}

	return assertNever(checkoutSessionState, "Unhandled checkout session state");
}
