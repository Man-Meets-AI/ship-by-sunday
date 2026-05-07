import { auth, currentUser } from "@clerk/nextjs/server";

import { apiRouteConfig } from "@/app/api/_lib/api-route-config";
import { buildStripeExpressCheckoutSessionCreateParams } from "@/platform/billing/checkout/checkout-session-params";
import { createPendingCheckoutSessionCookieOptions } from "@/platform/billing/checkout/pending-checkout-session-cookie";
import {
	assertManagedStripePriceMatchesProductConfig,
	getStripe,
	getStripePublishableKey,
} from "@/platform/billing/stripe";
import { captureServerError } from "@/platform/observability/capture-server-error";
import { getUnexpectedApiErrorResponse } from "@/platform/observability/api-error-response";
import {
	getRequestIdFromRequest,
	jsonWithRequestId,
} from "@/platform/observability/request-id";
import { buildStripeCheckoutFailureContext } from "@/platform/observability/source-adapters/stripe-failure";
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
				actionId: "stripe.checkout.createExpressSession",
				blockReason: "billing_action_blocked",
			})
		) {
			return jsonWithRequestId(
				{
					error: "Express checkout is unavailable during support mode.",
					requestId,
				},
				{ status: 403 },
				requestId,
			);
		}

		const stripe = getStripe();
		await assertManagedStripePriceMatchesProductConfig(stripe);
		const user = userId ? await currentUser() : null;
		const session = await stripe.checkout.sessions.create(
			buildStripeExpressCheckoutSessionCreateParams({
				appBaseUrl,
				clerkUserId: userId,
				customerEmail: user?.primaryEmailAddress?.emailAddress ?? null,
			}),
		);

		if (!session.client_secret) {
			await captureServerError({
				source: "stripe",
				error: new Error("Stripe did not return a checkout client secret."),
				requestId,
				pathname: apiRouteConfig.stripeExpressCheckout,
				userId,
				code: "stripe_express_checkout_missing_client_secret",
				severity: "high",
				...stripeFailureContext,
			});
			return jsonWithRequestId(
				{
					error: "Stripe did not return a checkout client secret.",
					requestId,
				},
				{ status: 500 },
				requestId,
			);
		}

		const returnUrl = `${appBaseUrl}/checkout/success?session_id=${session.id}`;
		const response = jsonWithRequestId(
			{
				clientSecret: session.client_secret,
				publishableKey: getStripePublishableKey(),
				returnUrl,
				sessionId: session.id,
			},
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
			pathname: apiRouteConfig.stripeExpressCheckout,
			source: "stripe",
			defaultMessage: "Unable to start express Stripe checkout.",
			userId,
			severity: "high",
			code: "stripe_express_checkout_failed",
			...stripeFailureContext,
		});
	}
}
