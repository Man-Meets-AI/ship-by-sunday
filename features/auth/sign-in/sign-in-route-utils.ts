import { authViewConfig, routeConfig } from "@/config/product";

import type { SignInAuthError } from "@/features/auth/sign-in/types";

export const ssoCallbackPath = "/sso-callback";

export const sessionTaskUrls = {
	"reset-password": "/session-tasks/reset-password",
} as const;

export type SessionTaskKey = keyof typeof sessionTaskUrls;

const authErrorParam = "auth_error";
const redirectUrlParam = "redirect_url";

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
	authError,
}: {
	redirectPath?: string | null;
	authError?: SignInAuthError;
} = {}) {
	const params = new URLSearchParams();
	const safeRedirectPath = redirectPath
		? getSafeRedirectPath(redirectPath)
		: null;

	if (safeRedirectPath) {
		params.set(redirectUrlParam, safeRedirectPath);
	}

	if (authError) {
		params.set(authErrorParam, authError);
	}

	if (!params.size) {
		return routeConfig.signIn;
	}

	return `${routeConfig.signIn}?${params.toString()}`;
}

export function buildSsoCallbackHref(redirectPath?: string | null) {
	const safeRedirectPath = redirectPath
		? getSafeRedirectPath(redirectPath)
		: null;

	if (!safeRedirectPath) {
		return ssoCallbackPath;
	}

	return `${ssoCallbackPath}?${redirectUrlParam}=${encodeURIComponent(safeRedirectPath)}`;
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

export function getBlockedGoogleSignInHref(redirectPath?: string | null) {
	return buildSignInHref({
		redirectPath,
		authError: "purchase_required",
	});
}

export function getTaskRedirectUrlComplete(redirectPath?: string | null) {
	return getSafeRedirectPath(redirectPath);
}

export function getSignInAuthError(
	rawValue: string | null,
): SignInAuthError | null {
	if (rawValue === "purchase_required") {
		return rawValue;
	}

	return null;
}
