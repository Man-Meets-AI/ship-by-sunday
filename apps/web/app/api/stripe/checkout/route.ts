import { auth, currentUser } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";

import { apiRouteConfig } from "@/app/api/_lib/api-route-config";
import { api } from "@/convex/_generated/api";
import { buildStripeCheckoutSessionCreateParams } from "@/platform/billing/checkout/checkout-session-params";
import { captureServerError } from "@/platform/observability/capture-server-error";
import { getUnexpectedApiErrorResponse } from "@/platform/observability/api-error-response";
import {
	getRequestIdFromRequest,
	jsonWithRequestId,
} from "@/platform/observability/request-id";
import { buildStripeCheckoutFailureContext } from "@/platform/observability/source-adapters/stripe-failure";
import { createPendingCheckoutSessionCookieOptions } from "@/platform/billing/checkout/pending-checkout-session-cookie";
import {
	assertManagedStripePriceMatchesProductConfig,
	getStripe,
} from "@/platform/billing/stripe";
import { getAppBaseUrl } from "@/platform/next/app-url";
import { recordBlockedSupportModeActionForRequest } from "@/platform/admin-impersonation/route-policy";

export async function POST(request: Request) {
	const requestId = getRequestIdFromRequest(request);
	const { userId } = await auth();

	const appBaseUrl = getAppBaseUrl(request);
	const stripeFailureContext = buildStripeCheckoutFailureContext({
		appBaseUrl,
		userId: userId ?? "signed_out_checkout",
	});

	try {
		if (
			await recordBlockedSupportModeActionForRequest(request, {
				actionId: "stripe.checkout.createSession",
				blockReason: "billing_action_blocked",
			})
		) {
			return jsonWithRequestId(
				{ error: "Checkout is unavailable during support mode.", requestId },
				{ status: 403 },
				requestId,
			);
		}

		const stripe = getStripe();
		await assertManagedStripePriceMatchesProductConfig(stripe);
		const user = userId ? await currentUser() : null;
		const checkoutEmail = user?.primaryEmailAddress?.emailAddress ?? null;
		const purchaseIntent = await fetchMutation(
			api.checkoutClaims.createCheckoutPurchaseIntent,
			{
				checkoutSurface: "hosted_checkout",
				...(userId ? { clerkUserId: userId } : {}),
				...(checkoutEmail ? { checkoutEmail } : {}),
			},
		);
		const session = await stripe.checkout.sessions.create(
			buildStripeCheckoutSessionCreateParams({
				appBaseUrl,
				clerkUserId: userId,
				customerEmail: checkoutEmail,
				purchaseIntentId: purchaseIntent.purchaseIntentId,
			}),
		);

		if (!session.url) {
			await captureServerError({
				source: "stripe",
				error: new Error("Stripe did not return a checkout URL."),
				requestId,
				pathname: apiRouteConfig.stripeCheckout,
				userId,
				code: "stripe_checkout_missing_url",
				severity: "high",
				...stripeFailureContext,
			});
			return jsonWithRequestId(
				{
					error: "Stripe did not return a checkout URL.",
					requestId,
				},
				{ status: 500 },
				requestId,
			);
		}
		await fetchMutation(
			api.checkoutClaims.attachStripeCheckoutSessionToPurchaseIntent,
			{
				purchaseIntentId: purchaseIntent.purchaseIntentId,
				stripeCheckoutSessionId: session.id,
			},
		);

		const response = jsonWithRequestId(
			{ url: session.url, sessionId: session.id },
			undefined,
			requestId,
		);
		response.cookies.set(
			"sbs_pending_checkout_session",
			session.id,
			createPendingCheckoutSessionCookieOptions({
				isSecure: appBaseUrl.startsWith("https://"),
			}),
		);
		return response;
	} catch (error) {
		return await getUnexpectedApiErrorResponse({
			error: error instanceof Error ? error : String(error),
			requestId,
			pathname: apiRouteConfig.stripeCheckout,
			source: "stripe",
			defaultMessage: "Unable to start Stripe checkout.",
			userId,
			severity: "high",
			code: "stripe_checkout_failed",
			...stripeFailureContext,
		});
	}
}
