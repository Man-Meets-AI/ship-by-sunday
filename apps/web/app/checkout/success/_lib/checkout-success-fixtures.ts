import type { CheckoutSessionState } from "@/platform/billing/checkout/checkout-session";
import type { ProductAccess } from "@/lib/product-access";

export type CheckoutSuccessFixture = {
	readonly checkoutSessionState: CheckoutSessionState;
	readonly initialProductAccess: ProductAccess | null;
	readonly fixtureFlipAfterMs?: number;
	readonly fixtureSuppressRedirect?: boolean;
	readonly fixtureSlug: CheckoutSuccessFixtureSlug;
};

export const CHECKOUT_SUCCESS_FIXTURE_SLUGS = [
	"validated_polling",
	"validated_arc",
	"validated_redirect",
	"wrong_account",
	"checkout_email_handoff_required",
	"sign_in_required",
	"payment_pending",
	"invalid_session",
	"missing_session_id",
] as const;

export type CheckoutSuccessFixtureSlug =
	(typeof CHECKOUT_SUCCESS_FIXTURE_SLUGS)[number];

const FIXTURE_BUYER_EMAIL = "buyer@example.com";
const FIXTURE_OTHER_EMAIL = "other@example.com";
const FIXTURE_USER_ID = "fixture_user";

const validatedAccessPending: ProductAccess = {
	clerkUserId: FIXTURE_USER_ID,
	hasAccess: false,
	status: "pending",
};

const validatedAccessGranted: ProductAccess = {
	clerkUserId: FIXTURE_USER_ID,
	hasAccess: true,
	status: "granted",
};

const FIXTURE_BUILDERS: Record<
	CheckoutSuccessFixtureSlug,
	() => CheckoutSuccessFixture
> = {
	validated_polling: () => ({
		fixtureSlug: "validated_polling",
		checkoutSessionState: {
			kind: "validated",
			sessionId: "fixture_polling",
			fulfillmentTrack: "generated_codebase",
		},
		initialProductAccess: validatedAccessPending,
	}),
	validated_arc: () => ({
		fixtureSlug: "validated_arc",
		checkoutSessionState: {
			kind: "validated",
			sessionId: "fixture_arc",
			fulfillmentTrack: "generated_codebase",
		},
		initialProductAccess: validatedAccessPending,
		fixtureFlipAfterMs: 2400,
	}),
	validated_redirect: () => ({
		fixtureSlug: "validated_redirect",
		checkoutSessionState: {
			kind: "validated",
			sessionId: "fixture_redirect",
			fulfillmentTrack: "generated_codebase",
		},
		initialProductAccess: validatedAccessGranted,
		fixtureSuppressRedirect: true,
	}),
	wrong_account: () => ({
		fixtureSlug: "wrong_account",
		checkoutSessionState: {
			kind: "wrong_account",
			sessionId: "fixture_wrong_account",
			checkoutEmail: FIXTURE_BUYER_EMAIL,
			currentAccountEmail: FIXTURE_OTHER_EMAIL,
		},
		initialProductAccess: null,
	}),
	sign_in_required: () => ({
		fixtureSlug: "sign_in_required",
		checkoutSessionState: {
			kind: "sign_in_required",
			sessionId: "fixture_sign_in_required",
			checkoutEmail: FIXTURE_BUYER_EMAIL,
		},
		initialProductAccess: null,
	}),
	checkout_email_handoff_required: () => ({
		fixtureSlug: "checkout_email_handoff_required",
		checkoutSessionState: {
			kind: "checkout_email_handoff_required",
			sessionId: "fixture_checkout_email_handoff",
			checkoutEmail: FIXTURE_BUYER_EMAIL,
		},
		initialProductAccess: null,
	}),
	payment_pending: () => ({
		fixtureSlug: "payment_pending",
		checkoutSessionState: {
			kind: "payment_pending",
			sessionId: "fixture_payment_pending",
			paymentStatus: "unpaid",
		},
		initialProductAccess: null,
	}),
	invalid_session: () => ({
		fixtureSlug: "invalid_session",
		checkoutSessionState: {
			kind: "invalid_session",
			sessionId: "fixture_invalid_session",
		},
		initialProductAccess: null,
	}),
	missing_session_id: () => ({
		fixtureSlug: "missing_session_id",
		checkoutSessionState: { kind: "missing_session_id" },
		initialProductAccess: null,
	}),
};

function isKnownSlug(value: string): value is CheckoutSuccessFixtureSlug {
	return (CHECKOUT_SUCCESS_FIXTURE_SLUGS as readonly string[]).includes(value);
}

/**
 * Returns a deterministic in-memory fixture packet for `/checkout/success`
 * when `process.env.CHECKOUT_SUCCESS_FIXTURES === "1"`, `process.env.NODE_ENV
 * !== "production"`, and `searchParams.fixture` is one of
 * `CHECKOUT_SUCCESS_FIXTURE_SLUGS`. Returns null otherwise so the page falls
 * back to the production checkout-session and Convex access-query path.
 */
export function getCheckoutSuccessFixture(input: {
	fixture?: string;
}): CheckoutSuccessFixture | null {
	if (process.env.CHECKOUT_SUCCESS_FIXTURES !== "1") {
		return null;
	}
	if (process.env.NODE_ENV === "production") {
		return null;
	}
	const slug = input.fixture;
	if (!slug || !isKnownSlug(slug)) {
		return null;
	}
	return FIXTURE_BUILDERS[slug]();
}

export function hasCheckoutSuccessFixtureParam(input: { fixture?: string }) {
	return input.fixture !== undefined;
}
