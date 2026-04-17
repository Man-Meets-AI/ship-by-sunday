import { auth, currentUser } from "@clerk/nextjs/server";

import {
	apiRouteConfig,
	getCheckoutSuccessHref,
	productConfig,
	routeConfig,
} from "@/config/product";
import { captureServerError } from "@/features/observability/server/capture-server-error";
import { getUnexpectedApiErrorResponse } from "@/features/observability/server/api-error-response";
import {
	getRequestIdFromRequest,
	jsonWithRequestId,
} from "@/features/observability/server/request-id";
import { buildStripeCheckoutFailureContext } from "@/features/observability/server/source-adapters/stripe-failure";
import { createPendingCheckoutSessionCookieOptions } from "@/features/checkout/lib/pending-checkout-session-cookie";
import {
	assertManagedStripePriceMatchesProductConfig,
	getStripeCheckoutDiscounts,
	getStripe,
	getStripeLineItem,
} from "@/platform/billing/stripe";
import { getAppBaseUrl } from "@/platform/next/app-url";

export async function POST(request: Request) {
	const requestId = getRequestIdFromRequest(request);
	const { userId } = await auth();

	const appBaseUrl = getAppBaseUrl(request);
	const stripeFailureContext = buildStripeCheckoutFailureContext({
		appBaseUrl,
		userId: userId ?? "signed_out_checkout",
	});

	try {
		const stripe = getStripe();
		await assertManagedStripePriceMatchesProductConfig(stripe);
		const user = userId ? await currentUser() : null;
		const lineItem = getStripeLineItem();
		const checkoutDiscounts = getStripeCheckoutDiscounts();
		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			allow_promotion_codes: checkoutDiscounts ? false : true,
			billing_address_collection: "auto",
			cancel_url: `${appBaseUrl}${routeConfig.checkoutCancel}`,
			success_url: `${appBaseUrl}${getCheckoutSuccessHref("{CHECKOUT_SESSION_ID}")}`,
			client_reference_id: userId ?? undefined,
			customer_email: user?.primaryEmailAddress?.emailAddress ?? undefined,
			...(checkoutDiscounts ? { discounts: checkoutDiscounts } : {}),
			line_items: [lineItem],
			metadata: {
				...(userId ? { clerkUserId: userId } : {}),
				courseSlug: productConfig.courseSlug,
			},
			payment_intent_data: {
				metadata: {
					...(userId ? { clerkUserId: userId } : {}),
					courseSlug: productConfig.courseSlug,
				},
			},
		});

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
			error,
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
