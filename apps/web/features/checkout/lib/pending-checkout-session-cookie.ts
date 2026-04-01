export const PENDING_CHECKOUT_SESSION_COOKIE_NAME =
	"sbs_pending_checkout_session";

const PENDING_CHECKOUT_SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

export function createPendingCheckoutSessionCookieOptions({
	isSecure,
}: {
	isSecure: boolean;
}) {
	return {
		httpOnly: true,
		maxAge: PENDING_CHECKOUT_SESSION_COOKIE_MAX_AGE_SECONDS,
		path: "/",
		sameSite: "lax" as const,
		secure: isSecure,
	};
}
