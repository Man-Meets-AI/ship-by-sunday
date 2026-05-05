import { authViewConfig, routeConfig } from "@/config/product";

export const sessionTaskUrls = {
	"reset-password": "/session-tasks/reset-password",
} as const;

export type SessionTaskKey = keyof typeof sessionTaskUrls;

const redirectUrlParam = "redirect_url";
const checkoutSessionIdParam = "session_id";

export function getSafeRedirectPath(rawPath?: string | null) {
	if (!rawPath) {
		return authViewConfig.fallbackRedirectUrl;
	}

	if (!rawPath.startsWith("/") || rawPath.startsWith("//")) {
		return authViewConfig.fallbackRedirectUrl;
	}

	return rawPath;
}

export function getPricingHref() {
	return `${routeConfig.home}${routeConfig.pricingHash}`;
}

export function buildSignInHref({
	redirectPath,
}: {
	redirectPath?: string | null;
} = {}) {
	const params = new URLSearchParams();
	const safeRedirectPath = redirectPath
		? getSafeRedirectPath(redirectPath)
		: null;

	if (safeRedirectPath) {
		params.set(redirectUrlParam, safeRedirectPath);
	}

	if (!params.size) {
		return routeConfig.signIn;
	}

	return `${routeConfig.signIn}?${params.toString()}`;
}

export function buildSignUpHref({
	redirectPath,
	sessionId,
}: {
	redirectPath?: string | null;
	sessionId?: string | null;
} = {}) {
	const params = new URLSearchParams();
	const safeRedirectPath = redirectPath
		? getSafeRedirectPath(redirectPath)
		: null;

	if (sessionId) {
		params.set("session_id", sessionId);
	}

	if (safeRedirectPath) {
		params.set(redirectUrlParam, safeRedirectPath);
	}

	if (!params.size) {
		return routeConfig.signUp;
	}

	return `${routeConfig.signUp}?${params.toString()}`;
}

export function buildCheckoutEmailHandoffHref({
	redirectPath,
	sessionId,
}: {
	redirectPath?: string | null;
	sessionId: string;
}) {
	const params = new URLSearchParams();
	const safeRedirectPath = redirectPath
		? getSafeRedirectPath(redirectPath)
		: null;

	params.set(checkoutSessionIdParam, sessionId);

	if (safeRedirectPath) {
		params.set(redirectUrlParam, safeRedirectPath);
	}

	return `${routeConfig.checkoutEmailHandoff}?${params.toString()}`;
}

export function buildClearPendingCheckoutSessionHref(
	redirectPath?: string | null,
) {
	const params = new URLSearchParams();
	params.set(redirectUrlParam, getSafeRedirectPath(redirectPath));

	return `${routeConfig.checkoutClearPending}?${params.toString()}`;
}

export function getCheckoutSessionIdFromSuccessRedirectPath(
	rawPath?: string | null,
) {
	const safeRedirectPath = getSafeRedirectPath(rawPath);
	const redirectUrl = new URL(safeRedirectPath, "https://ship-by-sunday.local");

	if (redirectUrl.pathname !== routeConfig.checkoutSuccess) {
		return null;
	}

	const sessionId = redirectUrl.searchParams
		.get(checkoutSessionIdParam)
		?.trim();

	return sessionId ? sessionId : null;
}

export function buildCheckoutEmailHandoffHrefForSuccessRedirect(
	rawPath?: string | null,
) {
	const sessionId = getCheckoutSessionIdFromSuccessRedirectPath(rawPath);
	if (!sessionId) {
		return null;
	}

	return buildCheckoutEmailHandoffHref({
		redirectPath: getSafeRedirectPath(rawPath),
		sessionId,
	});
}

export function getSessionTaskHref(
	taskKey: string,
	redirectPath?: string | null,
) {
	const taskHref = sessionTaskUrls[taskKey as SessionTaskKey];
	if (!taskHref) {
		return null;
	}

	const safeRedirectPath = redirectPath
		? getSafeRedirectPath(redirectPath)
		: null;

	if (!safeRedirectPath) {
		return taskHref;
	}

	return `${taskHref}?${redirectUrlParam}=${encodeURIComponent(safeRedirectPath)}`;
}

export function getTaskRedirectUrlComplete(redirectPath?: string | null) {
	return getSafeRedirectPath(redirectPath);
}
