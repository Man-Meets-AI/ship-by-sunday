export const DEFAULT_PROOF_COURSE_SLUG = "ship-by-sunday";
export const DEFAULT_PROOF_COUPON_LIFETIME_SECONDS = 15 * 60;
export const HOMEPAGE_CHECKOUT_PROOF_PATH = "/?marketing=1";
export const EXPRESS_CHECKOUT_ROUTE_PATH = "/api/stripe/checkout/express";

function trimTrailingSlash(value) {
	return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function normalizeAppBaseUrl(baseUrl) {
	const normalizedUrl = new URL(baseUrl);
	return trimTrailingSlash(normalizedUrl.toString());
}

export function isExpressCheckoutRouteUrl(requestUrl, appBaseUrl) {
	try {
		const url = new URL(requestUrl, appBaseUrl);
		return url.pathname === EXPRESS_CHECKOUT_ROUTE_PATH;
	} catch {
		return false;
	}
}

export function buildHostedProofCouponParams({ runLabel, now = Date.now() }) {
	return {
		duration: "once",
		max_redemptions: 1,
		metadata: {
			qaBillingProof: "hosted_direct_checkout",
			runLabel,
		},
		name: `QA proof ${runLabel}`,
		percent_off: 100,
		redeem_by: Math.floor(now / 1000) + DEFAULT_PROOF_COUPON_LIFETIME_SECONDS,
	};
}

export function buildHostedProofCheckoutSessionParams({
	appBaseUrl,
	checkoutEmail,
	clerkUserId,
	couponId,
	courseSlug = DEFAULT_PROOF_COURSE_SLUG,
	priceId,
}) {
	const normalizedAppBaseUrl = normalizeAppBaseUrl(appBaseUrl);

	return {
		billing_address_collection: "auto",
		cancel_url: `${normalizedAppBaseUrl}/checkout/cancel`,
		client_reference_id: clerkUserId,
		customer_email: checkoutEmail,
		discounts: [{ coupon: couponId }],
		line_items: [{ price: priceId, quantity: 1 }],
		metadata: {
			...(clerkUserId ? { clerkUserId } : {}),
			courseSlug,
		},
		mode: "payment",
		payment_intent_data: {
			metadata: {
				...(clerkUserId ? { clerkUserId } : {}),
				courseSlug,
			},
		},
		success_url: `${normalizedAppBaseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
	};
}

export function buildHostedProofSignInPath({ redirectPath = "/workspace/choose" }) {
	return `/sign-in?redirect_url=${encodeURIComponent(redirectPath)}`;
}

export function buildHostedProofAccessDebugArgs({ clerkUserId, sessionId }) {
	return {
		...(clerkUserId ? { clerkUserId } : {}),
		...(sessionId ? { stripeCheckoutSessionId: sessionId } : {}),
	};
}
