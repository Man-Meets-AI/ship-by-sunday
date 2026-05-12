import { authViewConfig, routeConfig } from "@/config/product";

export const sessionTaskUrls = {
	"reset-password": "/session-tasks/reset-password",
} as const;

export type SessionTaskKey = keyof typeof sessionTaskUrls;

const redirectUrlParam = "redirect_url";
const redirectValidationOrigin = "https://ship-by-sunday.local";
const encodedPathSeparatorPattern = /%(?:2f|5c)/i;

function hasUnsafeRedirectCharacter(value: string) {
	for (const character of value) {
		const codePoint = character.charCodeAt(0);
		if (character === "\\" || codePoint < 32 || codePoint === 127) {
			return true;
		}
	}
	return false;
}

export function getSafeRedirectPath(rawPath?: string | string[] | null) {
	if (Array.isArray(rawPath)) {
		return getSafeRedirectPath(rawPath[0]);
	}

	if (!rawPath) {
		return authViewConfig.fallbackRedirectUrl;
	}

	if (
		!rawPath.startsWith("/") ||
		rawPath.startsWith("//") ||
		encodedPathSeparatorPattern.test(rawPath) ||
		hasUnsafeRedirectCharacter(rawPath)
	) {
		return authViewConfig.fallbackRedirectUrl;
	}

	let redirectUrl: URL;
	try {
		redirectUrl = new URL(rawPath, redirectValidationOrigin);
	} catch {
		return authViewConfig.fallbackRedirectUrl;
	}

	if (redirectUrl.origin !== redirectValidationOrigin) {
		return authViewConfig.fallbackRedirectUrl;
	}

	const safePath = `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
	if (!safePath.startsWith("/") || safePath.startsWith("//")) {
		return authViewConfig.fallbackRedirectUrl;
	}

	return safePath;
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

export function buildClearPendingCheckoutSessionHref(
	redirectPath?: string | null,
) {
	const params = new URLSearchParams();
	params.set(redirectUrlParam, getSafeRedirectPath(redirectPath));

	return `${routeConfig.checkoutClearPending}?${params.toString()}`;
}

export function isCheckoutWelcomeRedirectPath(rawPath?: string | null) {
	if (!rawPath) {
		return false;
	}

	let redirectUrl: URL;
	try {
		redirectUrl = new URL(
			getSafeRedirectPath(rawPath),
			redirectValidationOrigin,
		);
	} catch {
		return false;
	}

	return (
		redirectUrl.pathname === routeConfig.appHome &&
		redirectUrl.searchParams.get("welcome") === "checkout"
	);
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
