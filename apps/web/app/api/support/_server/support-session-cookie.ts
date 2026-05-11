import "server-only";

export const SUPPORT_SESSION_COOKIE_NAME = "__Host-sbs_support_session";

const SUPPORT_SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

export type SupportSessionCookie = {
	readonly sessionToken: string;
	readonly setCookieHeader: string | null;
};

export function getSupportSessionCookie(
	request: Request,
): SupportSessionCookie {
	const existingToken = readCookieValue(
		request.headers.get("cookie"),
		SUPPORT_SESSION_COOKIE_NAME,
	);
	if (existingToken && existingToken.length >= 32) {
		return {
			sessionToken: existingToken,
			setCookieHeader: null,
		};
	}

	const sessionToken = createSupportSessionToken();
	return {
		sessionToken,
		setCookieHeader: serializeSupportSessionCookie(sessionToken),
	};
}

export function appendSupportSessionCookie(
	response: Response,
	supportSessionCookie: SupportSessionCookie,
) {
	response.headers.set("Cache-Control", "no-store");
	if (supportSessionCookie.setCookieHeader) {
		response.headers.append("Set-Cookie", supportSessionCookie.setCookieHeader);
	}

	return response;
}

function readCookieValue(cookieHeader: string | null, cookieName: string) {
	if (!cookieHeader) {
		return null;
	}

	for (const cookiePair of cookieHeader.split(";")) {
		const [rawName, ...rawValueParts] = cookiePair.trim().split("=");
		if (rawName !== cookieName) {
			continue;
		}

		const value = rawValueParts.join("=");
		return value ? safeDecodeCookieValue(value) : null;
	}

	return null;
}

function safeDecodeCookieValue(value: string) {
	try {
		return decodeURIComponent(value);
	} catch {
		return null;
	}
}

function createSupportSessionToken() {
	return `${crypto.randomUUID().replaceAll("-", "")}${crypto
		.randomUUID()
		.replaceAll("-", "")}`;
}

function serializeSupportSessionCookie(sessionToken: string) {
	return [
		`${SUPPORT_SESSION_COOKIE_NAME}=${encodeURIComponent(sessionToken)}`,
		"Path=/",
		"HttpOnly",
		"Secure",
		"SameSite=Lax",
		`Max-Age=${SUPPORT_SESSION_COOKIE_MAX_AGE_SECONDS}`,
	]
		.filter(Boolean)
		.join("; ");
}
