import { getSignInRedirectHref, routeConfig } from "@/config/product";
import { assertNever } from "@/lib/assert";
import type { CheckoutSessionState } from "@/platform/billing/checkout/checkout-session";
import type { FulfillmentTrack } from "@/platform/billing/checkout/checkout-intent";
import { workspaceDisplayConfig } from "@/config/starter-selectors";

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
	primaryActionKind?: "link" | "sign_out";
	primaryActionBody: string;
	secondaryActionBody: string;
};

const workspaceOpenLabel = workspaceDisplayConfig.openHomeActionLabel;
const workspaceNoun = workspaceDisplayConfig.homeNoun;
const workspaceRouteStepLabel = workspaceDisplayConfig.firstStepLabel;
const checkoutWelcomePath = `${routeConfig.workspaceChoice}?welcome=checkout`;

type ValidatedFulfillmentRouteModel = {
	actionHref: string;
	openLabel: string;
	noun: string;
	stepLabel: string;
};

function getValidatedFulfillmentRouteModel(
	fulfillmentTrack: FulfillmentTrack,
): ValidatedFulfillmentRouteModel {
	switch (fulfillmentTrack) {
		case "generated_codebase":
			return {
				actionHref: routeConfig.codebase,
				openLabel: workspaceOpenLabel,
				noun: workspaceNoun,
				stepLabel: workspaceRouteStepLabel,
			};
		case "existing_codebase_doctor":
			return {
				actionHref: routeConfig.workspaceSetup,
				openLabel: "Open setup",
				noun: "codebase setup",
				stepLabel: "setup step",
			};
		case "unspecified":
			return {
				actionHref: checkoutWelcomePath,
				openLabel: "Choose path",
				noun: "fulfillment choice",
				stepLabel: "workspace path",
			};
	}
}

function getCheckoutEmailLabel(checkoutEmail: string | undefined) {
	return checkoutEmail ?? "the email used at checkout";
}

function getCurrentAccountLabel(currentAccountEmail: string | undefined) {
	return currentAccountEmail ?? "the account currently signed in here";
}

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
		case "validated": {
			const fulfillmentRoute = getValidatedFulfillmentRouteModel(
				checkoutSessionState.fulfillmentTrack,
			);
			return {
				shellTitle: "Payment received",
				shellSubtitle: "We’re unlocking your access now.",
				statusLabel: isAccessReady ? "Access ready" : validatedStatusLabel,
				heading: isAccessReady
					? `Opening ${fulfillmentRoute.noun}`
					: "Finalizing access",
				body: isAccessReady
					? `Your access is live. Sending you into the ${fulfillmentRoute.noun} now.`
					: `This page will send you into the ${fulfillmentRoute.noun} automatically as soon as access is ready. If it takes longer than a few seconds, use one of the buttons below.`,
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
						label: fulfillmentRoute.openLabel,
						state: isAccessReady ? "active" : "pending",
						detail: isAccessReady
							? "Redirect is ready."
							: `${fulfillmentRoute.stepLabel} opens once access confirms.`,
					},
				],
				helpTitle: isAccessReady ? "Access confirmed" : "What happens next",
				helpLeadCopy: isAccessReady
					? `Your purchase and product access are both confirmed. The next step is just getting you into the ${fulfillmentRoute.noun}.`
					: "Stripe is done. This page is checking your account access and will forward you automatically once product access is ready.",
				helpItems: isAccessReady
					? [
							`Use ${fulfillmentRoute.openLabel} if the redirect has not fired yet.`,
							"Refresh this page if the redirect feels stalled.",
							"Keep this tab if you want a clean post-purchase handoff.",
						]
					: [
							"Keep this tab open for a few seconds while the access grant catches up.",
							"If you signed in with a different email, fix that first before retrying.",
							`Use ${fulfillmentRoute.openLabel} if you want to retry the ${fulfillmentRoute.noun} gate now.`,
						],
				primaryActionLabel: fulfillmentRoute.openLabel,
				primaryActionHref: fulfillmentRoute.actionHref,
				primaryActionBody: isAccessReady
					? `Your access is ready. Open the ${fulfillmentRoute.noun} now if you do not want to wait for the redirect.`
					: `If the handoff already finished in the background, this will take you into the ${fulfillmentRoute.noun}. Otherwise it will re-run the ${fulfillmentRoute.noun} gate.`,
				secondaryActionBody: `Use ${fulfillmentRoute.openLabel} to retry the ${fulfillmentRoute.noun} gate if the handoff feels stalled.`,
			};
		}
		case "sign_in_required": {
			const signInCheckoutEmail = getCheckoutEmailLabel(
				checkoutSessionState.checkoutEmail,
			);
			return {
				shellTitle: "Finish access handoff",
				shellSubtitle: checkoutSessionState.checkoutEmail
					? `Payment is confirmed for ${checkoutSessionState.checkoutEmail}. Sign in with the email code for that account.`
					: "Sign in with the same account you used at checkout so we can attach access.",
				statusLabel: "Sign in required",
				heading: "Sign in to continue",
				body: checkoutSessionState.checkoutEmail
					? `We found a paid checkout session for ${signInCheckoutEmail}. Use the normal email-code sign-in for that address so we can continue to workspace choice. Do not buy again while this paid checkout is waiting.`
					: `We found a paid checkout session, but this browser is not signed in. Use ${signInCheckoutEmail}, then we can finish the access handoff. Do not buy again while this paid checkout is waiting.`,
				progressSteps: [
					{
						label: "Checkout found",
						state: "complete",
						detail: checkoutSessionState.checkoutEmail
							? `Payment is confirmed for ${checkoutSessionState.checkoutEmail}.`
							: "We located the paid Stripe session from this success URL.",
					},
					{
						label: "Sign in",
						state: "active",
						detail: `Use ${signInCheckoutEmail}.`,
					},
					{
						label: "Unlock access",
						state: "pending",
						detail: "Product access attaches after account auth.",
					},
				],
				helpTitle: "Use the checkout account",
				helpLeadCopy: checkoutSessionState.checkoutEmail
					? `This browser is not signed in, so we need the code Clerk sends to ${signInCheckoutEmail} before opening the paid product.`
					: `This browser is not signed in, so we cannot attach the completed checkout to an account yet. The purchase should be claimed by ${signInCheckoutEmail}.`,
				helpItems: [
					checkoutSessionState.checkoutEmail
						? `Use the one-time email code sent to ${signInCheckoutEmail}.`
						: `Sign in with ${signInCheckoutEmail}.`,
					checkoutSessionState.checkoutEmail
						? "Return to this tab after email verification so the access handoff can finish."
						: "Return to this tab after sign-in so the access handoff can finish.",
					"Do not start a second checkout. This payment already exists.",
				],
				primaryActionLabel: checkoutSessionState.checkoutEmail
					? "Sign in with checkout email"
					: "Sign in",
				primaryActionHref: getSignInRedirectHref(checkoutWelcomePath),
				primaryActionBody: `Use ${signInCheckoutEmail} so we can attach the purchase to the right account.`,
				secondaryActionBody: checkoutSessionState.checkoutEmail
					? `After email verification, come back here or use ${workspaceOpenLabel} to retry the ${workspaceNoun} gate.`
					: `After sign-in, come back here or use ${workspaceOpenLabel} to retry the ${workspaceNoun} gate.`,
			};
		}
		case "fulfillment_failed": {
			const checkoutEmail = getCheckoutEmailLabel(
				checkoutSessionState.checkoutEmail,
			);
			return {
				shellTitle: "Access needs support",
				shellSubtitle:
					"We confirmed the checkout session, but could not finish the account handoff automatically.",
				statusLabel: "Support needed",
				heading: "We could not finish access",
				body: `The purchase is tied to ${checkoutEmail}, but account fulfillment hit a recoverable error: ${checkoutSessionState.message}`,
				progressSteps: [
					{
						label: "Payment confirmed",
						state: "complete",
						detail: "Stripe reported a paid checkout session.",
					},
					{
						label: "Account handoff",
						state: "active",
						detail: "Support needs to inspect Clerk and Convex state.",
					},
					{
						label: "Open workspace",
						state: "pending",
						detail: "Workspace opens after access is repaired.",
					},
				],
				helpTitle: "Do not buy again",
				helpLeadCopy:
					"The payment exists. This is an account handoff issue, not a missing purchase.",
				helpItems: [
					"Do not start a second checkout. This payment already exists.",
					"Keep this success URL and share it with support if needed.",
					"Try signing in with the checkout email if support confirms access is repaired.",
				],
				primaryActionLabel: "Sign in",
				primaryActionHref: getSignInRedirectHref(checkoutWelcomePath),
				primaryActionBody:
					"Sign in with the checkout email after the account handoff is repaired.",
				secondaryActionBody:
					"Use this page as proof of the paid checkout while support repairs access.",
			};
		}
		case "wrong_account": {
			const wrongAccountCheckoutEmail = getCheckoutEmailLabel(
				checkoutSessionState.checkoutEmail,
			);
			const currentAccountEmail = getCurrentAccountLabel(
				checkoutSessionState.currentAccountEmail,
			);
			return {
				shellTitle: "Wrong account for this checkout",
				shellSubtitle:
					checkoutSessionState.checkoutEmail ||
					checkoutSessionState.currentAccountEmail
						? `Payment is tied to ${wrongAccountCheckoutEmail}, but this browser is signed in as ${currentAccountEmail}.`
						: "This browser is signed into a different account than the one used at checkout.",
				statusLabel: "Account mismatch",
				heading: "Use the checkout account",
				body: `This paid checkout belongs to ${wrongAccountCheckoutEmail}. This browser is using ${currentAccountEmail}. Do not buy again; sign out, use the checkout email code, then retry this page or use ${workspaceOpenLabel.toLowerCase()}.`,
				progressSteps: [
					{
						label: "Checkout found",
						state: "complete",
						detail: checkoutSessionState.checkoutEmail
							? `Payment is confirmed for ${checkoutSessionState.checkoutEmail}.`
							: "The payment session exists and looks valid.",
					},
					{
						label: "Account match",
						state: "active",
						detail: `Switch from ${currentAccountEmail} to ${wrongAccountCheckoutEmail}.`,
					},
					{
						label: "Unlock access",
						state: "pending",
						detail: "Access can only attach after the account matches.",
					},
				],
				helpTitle: "Account mismatch",
				helpLeadCopy: `The purchase exists, but it belongs to ${wrongAccountCheckoutEmail}, not ${currentAccountEmail}.`,
				helpItems: [
					`Sign out of ${currentAccountEmail}, then use the email code sent to ${wrongAccountCheckoutEmail}.`,
					`Then use ${workspaceOpenLabel} to retry the ${workspaceNoun} gate.`,
					"Do not start another checkout. This payment already exists.",
				],
				primaryActionLabel: "Switch accounts",
				primaryActionHref: getSignInRedirectHref(checkoutWelcomePath),
				primaryActionKind: "sign_out",
				primaryActionBody: `Recover this purchase by using ${wrongAccountCheckoutEmail}. Do not buy again from ${currentAccountEmail}.`,
				secondaryActionBody: `After switching accounts, return here or use ${workspaceOpenLabel} to retry the ${workspaceNoun} gate.`,
			};
		}
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
				primaryActionHref: routeConfig.workspaceChoice,
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
				primaryActionHref: routeConfig.workspaceChoice,
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
				primaryActionHref: routeConfig.workspaceChoice,
				primaryActionBody: `If the handoff already finished in the background, this will take you into the ${workspaceNoun}. Otherwise it will re-run the ${workspaceNoun} gate.`,
				secondaryActionBody: `Use ${workspaceOpenLabel} to retry the ${workspaceNoun} gate if access should already be live.`,
			};
	}

	return assertNever(checkoutSessionState, "Unhandled checkout session state");
}
