export const DEFAULT_PROOF_COUPON_LIFETIME_SECONDS = 15 * 60;
export const DEFAULT_HOSTED_BILLING_PROOF_OFFER_ID = "starter";
export const HOMEPAGE_CHECKOUT_PROOF_PATH = "/starter";
export const EXPRESS_CHECKOUT_ROUTE_PATH = "/api/stripe/checkout/express";
export const hostedProofFulfillablePaymentStatuses = new Set([
	"paid",
	"no_payment_required",
]);
export const hostedBillingProofOffers = {
	starter: {
		accessEvidenceText: [/Codebase/i, /Continue to Review/i, /^Home$/i],
		checkoutButtonTestIds: [
			"starter-checkout-cta",
			"hero-primary-cta",
			"codebase-demo-checkout-cta",
			"pricing-primary-cta",
		],
		expectedAccessSources: ["stripe_webhook", "stripe_checkout"],
		expectedAmountCents: 29_700,
		expectedCapabilities: ["generate_codebase", "tutorials"],
		id: "starter",
		label: "Starter",
		priceEnvKeys: ["STRIPE_STARTER_PRICE_ID", "STRIPE_PRICE_ID"],
		protectedAccessPath: "/starter/generate-codebase",
		publicPath: "/starter",
		successPath: "/starter/home",
	},
	workers: {
		accessEvidenceText: [
			/Workers/i,
			/Setup/i,
			/Existing codebase/i,
			/Worker install/i,
			/Doctor Pass/i,
			/Pair the local runner/i,
		],
		checkoutButtonTestIds: ["workers-checkout-cta"],
		expectedAccessSources: ["stripe_webhook", "stripe_checkout"],
		expectedAmountCents: 60_000,
		expectedCapabilities: ["worker"],
		id: "workers",
		label: "Workers",
		priceEnvKeys: ["STRIPE_WORKERS_PRICE_ID"],
		protectedAccessPath: "/workers/setup",
		publicPath: "/workers",
		successPath: "/workers/setup",
	},
};
export const hostedBillingProofOfferIds = Object.freeze(
	Object.keys(hostedBillingProofOffers),
);

const expectedHostedCheckoutMetadata = {
	accessProduct: "paid_app_access",
	app: "man_meets_ai",
	checkoutSurface: "hosted_checkout",
	metadataSchema: "mma_checkout_v1",
};

function trimTrailingSlash(value) {
	return value.endsWith("/") ? value.slice(0, -1) : value;
}

function normalizeStripeSecretKey(secretKey) {
	return secretKey.replaceAll("\\n", "").replaceAll("\n", "").trim();
}

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function includesAll(values, requiredValues) {
	return requiredValues.every((requiredValue) =>
		(values ?? []).includes(requiredValue),
	);
}

export function isHostedBillingProofOfferId(value) {
	return (
		typeof value === "string" && Object.hasOwn(hostedBillingProofOffers, value)
	);
}

export function getHostedBillingProofOffer(
	offerId = DEFAULT_HOSTED_BILLING_PROOF_OFFER_ID,
) {
	if (!isHostedBillingProofOfferId(offerId)) {
		throw new Error(
			`Unsupported hosted billing proof offer "${offerId}". Expected one of ${hostedBillingProofOfferIds.join(", ")}.`,
		);
	}

	return hostedBillingProofOffers[offerId];
}

export function parseHostedBillingProofOfferId(
	value = DEFAULT_HOSTED_BILLING_PROOF_OFFER_ID,
) {
	return getHostedBillingProofOffer(value).id;
}

export function buildHostedBillingProofOfferSelectorHelp() {
	return hostedBillingProofOfferIds.join("|");
}

export function getHostedBillingProofStripePriceId(
	env,
	offerId = DEFAULT_HOSTED_BILLING_PROOF_OFFER_ID,
) {
	const offer = getHostedBillingProofOffer(offerId);
	for (const envKey of offer.priceEnvKeys) {
		const value = normalizeStripeSecretKey(env[envKey] ?? "");
		if (value) {
			return value;
		}
	}

	throw new Error(
		`Missing ${offer.priceEnvKeys.join(" or ")} in environment. Hosted ${offer.label} billing proof needs a managed ${offer.label} price.`,
	);
}

export function buildHostedBillingProofSuccessPathPattern(
	offerId = DEFAULT_HOSTED_BILLING_PROOF_OFFER_ID,
) {
	const offer = getHostedBillingProofOffer(offerId);
	return new RegExp(`${escapeRegExp(offer.successPath)}(\\?|$)`);
}

export function buildHostedBillingProofCheckoutButtonSelector(
	offerId = DEFAULT_HOSTED_BILLING_PROOF_OFFER_ID,
) {
	const offer = getHostedBillingProofOffer(offerId);
	return offer.checkoutButtonTestIds
		.map((testId) => `[data-testid='${testId}']`)
		.join(", ");
}

export function isExpectedHostedProofCheckoutMetadata(
	metadata,
	offerId = DEFAULT_HOSTED_BILLING_PROOF_OFFER_ID,
) {
	const offer = getHostedBillingProofOffer(offerId);
	return (
		metadata?.metadataSchema ===
			expectedHostedCheckoutMetadata.metadataSchema &&
		metadata?.app === expectedHostedCheckoutMetadata.app &&
		metadata?.accessProduct === expectedHostedCheckoutMetadata.accessProduct &&
		metadata?.checkoutSurface ===
			expectedHostedCheckoutMetadata.checkoutSurface &&
		metadata?.offerId === offer.id &&
		typeof metadata?.purchaseIntentId === "string" &&
		metadata.purchaseIntentId.length > 0 &&
		metadata.courseSlug === undefined &&
		metadata.buyerStartingPoint === undefined &&
		metadata.checkoutCtaId === undefined &&
		metadata.fulfillmentTrack === undefined
	);
}

export function metadataMatchesHostedProofCheckoutSession({
	offerId = DEFAULT_HOSTED_BILLING_PROOF_OFFER_ID,
	paymentIntentMetadata,
	sessionMetadata,
	subscriptionMetadata,
}) {
	const downstreamMetadata = subscriptionMetadata ?? paymentIntentMetadata;
	return (
		isExpectedHostedProofCheckoutMetadata(sessionMetadata, offerId) &&
		isExpectedHostedProofCheckoutMetadata(downstreamMetadata, offerId) &&
		downstreamMetadata?.purchaseIntentId === sessionMetadata.purchaseIntentId
	);
}

export function hostedProofCheckoutLineItemMatchesOffer(
	lineItem,
	offerId = DEFAULT_HOSTED_BILLING_PROOF_OFFER_ID,
) {
	const offer = getHostedBillingProofOffer(offerId);
	return lineItem?.amount_subtotal === offer.expectedAmountCents;
}

export function hostedProofAccessGrantMatchesOffer(
	productAccess,
	offerId = DEFAULT_HOSTED_BILLING_PROOF_OFFER_ID,
) {
	const offer = getHostedBillingProofOffer(offerId);
	const expectedAccessSources = offer.expectedAccessSources ?? [
		offer.expectedAccessSource,
	];
	return Boolean(
		productAccess?.status === "granted" &&
		expectedAccessSources.includes(productAccess.source) &&
		productAccess.stripeCheckoutSessionId &&
		(productAccess.lastCheckoutOfferId === offer.id ||
			productAccess.offerIds?.includes(offer.id)) &&
		includesAll(productAccess.capabilities, offer.expectedCapabilities),
	);
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
	offerId = DEFAULT_HOSTED_BILLING_PROOF_OFFER_ID,
	purchaseIntentId,
	priceId,
}) {
	const normalizedAppBaseUrl = normalizeAppBaseUrl(appBaseUrl);
	const offer = getHostedBillingProofOffer(offerId);
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
		offerId: offer.id,
		purchaseIntentId,
	};
	const checkoutMode = offer.id === "workers" ? "subscription" : "payment";

	return {
		billing_address_collection: "auto",
		cancel_url: `${normalizedAppBaseUrl}/checkout/cancel`,
		client_reference_id: clerkUserId,
		customer_email: checkoutEmail,
		discounts: [{ coupon: couponId }],
		line_items: [{ price: priceId, quantity: 1 }],
		metadata: checkoutMetadata,
		mode: checkoutMode,
		...(checkoutMode === "subscription"
			? { payment_method_collection: "if_required" }
			: {}),
		...(checkoutMode === "payment"
			? {
					payment_intent_data: {
						metadata: checkoutMetadata,
					},
				}
			: {
					subscription_data: {
						metadata: checkoutMetadata,
					},
				}),
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
