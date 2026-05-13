export const DEFAULT_PROOF_COUPON_LIFETIME_SECONDS = 15 * 60;
export const HOMEPAGE_CHECKOUT_PROOF_PATH = "/starter";
export const EXPRESS_CHECKOUT_ROUTE_PATH = "/api/stripe/checkout/express";
export const hostedProofFulfillablePaymentStatuses = new Set([
	"paid",
	"no_payment_required",
]);

function trimTrailingSlash(value) {
	return value.endsWith("/") ? value.slice(0, -1) : value;
}

function normalizeStripeSecretKey(secretKey) {
	return secretKey.replaceAll("\\n", "").replaceAll("\n", "").trim();
}

export function getStripeSecretKeyModeLabel(secretKey) {
	const normalizedSecretKey = normalizeStripeSecretKey(secretKey);
	if (
		normalizedSecretKey.startsWith("sk_test_") ||
		normalizedSecretKey.startsWith("rk_test_")
	) {
		return "test";
	}

	if (
		normalizedSecretKey.startsWith("sk_live_") ||
		normalizedSecretKey.startsWith("rk_live_")
	) {
		return "live";
	}

	throw new Error(
		"STRIPE_SECRET_KEY must start with sk_test_, rk_test_, sk_live_, or rk_live_.",
	);
}

export function isLiveStripeSecretKey(secretKey) {
	return getStripeSecretKeyModeLabel(secretKey) === "live";
}

export function shouldAllowHostedProofCardEntry(isLiveStripeMode) {
	return !isLiveStripeMode;
}

export function assertHostedProofCheckoutSessionSafe({
	checkoutSession,
	isLiveStripeMode,
}) {
	if (isLiveStripeMode && checkoutSession.amount_total !== 0) {
		throw new Error(
			`Live hosted billing proof requires a zero-cost Checkout Session before navigation. Session ${checkoutSession.id} amount_total=${checkoutSession.amount_total}.`,
		);
	}
}

export function isHostedProofCheckoutSessionFulfilled(checkoutSession) {
	return (
		checkoutSession.status === "complete" &&
		hostedProofFulfillablePaymentStatuses.has(checkoutSession.payment_status) &&
		checkoutSession.amount_total === 0
	);
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
	offerId = "starter",
	purchaseIntentId,
	priceId,
}) {
	const normalizedAppBaseUrl = normalizeAppBaseUrl(appBaseUrl);
	if (!purchaseIntentId) {
		throw new Error(
			"Hosted billing proof requires a checkout purchase intent id.",
		);
	}

	const checkoutMetadata = {
		accessProduct: "paid_app_access",
		app: "man_meets_ai",
		checkoutSurface: "hosted_checkout",
		...(clerkUserId ? { clerkUserId } : {}),
		metadataSchema: "mma_checkout_v1",
		offerId,
		purchaseIntentId,
	};

	return {
		billing_address_collection: "auto",
		cancel_url: `${normalizedAppBaseUrl}/checkout/cancel`,
		client_reference_id: clerkUserId,
		customer_email: checkoutEmail,
		discounts: [{ coupon: couponId }],
		line_items: [{ price: priceId, quantity: 1 }],
		metadata: checkoutMetadata,
		mode: "payment",
		payment_intent_data: {
			metadata: checkoutMetadata,
		},
		success_url: `${normalizedAppBaseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
	};
}

export function buildHostedProofSignInPath({ redirectPath = "/starter/home" }) {
	return `/sign-in?redirect_url=${encodeURIComponent(redirectPath)}`;
}

export function buildHostedProofAccessDebugArgs({ clerkUserId, sessionId }) {
	return {
		...(clerkUserId ? { clerkUserId } : {}),
		...(sessionId ? { stripeCheckoutSessionId: sessionId } : {}),
	};
}
