import "server-only";

import { apiConfig } from "@/config/product";
import { serverEnv } from "@/platform/env/server";

function normalizeBaseUrl(value: string) {
	return value.endsWith("/") ? value.slice(0, -1) : value;
}

function normalizeOriginCandidate(value: string | undefined) {
	const trimmedValue = value?.trim();
	if (!trimmedValue) {
		return null;
	}

	const candidateUrl = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmedValue)
		? trimmedValue
		: `${apiConfig.secureHttpProtocol}${trimmedValue}`;

	try {
		return normalizeBaseUrl(new URL(candidateUrl).origin);
	} catch {
		return null;
	}
}

function getVercelDeploymentUrl() {
	return (
		normalizeOriginCandidate(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
		normalizeOriginCandidate(process.env.VERCEL_URL) ??
		normalizeOriginCandidate(process.env.VERCEL_BRANCH_URL)
	);
}

function getTrustedRequestOrigins() {
	return new Set(
		[
			normalizeOriginCandidate(serverEnv.APP_BASE_URL),
			normalizeOriginCandidate(process.env.VERCEL_BRANCH_URL),
			normalizeOriginCandidate(process.env.VERCEL_URL),
			normalizeOriginCandidate(process.env.VERCEL_PROJECT_PRODUCTION_URL),
		].filter((origin): origin is string => origin !== null),
	);
}

function isLocalRequestOrigin(origin: string) {
	const hostname = new URL(origin).hostname;
	return (
		hostname === "localhost" ||
		hostname === "127.0.0.1" ||
		hostname === "::1" ||
		hostname === "[::1]"
	);
}

function getConfiguredAppBaseUrl() {
	const appBaseUrl = normalizeOriginCandidate(serverEnv.APP_BASE_URL);
	if (appBaseUrl) {
		return appBaseUrl;
	}

	const vercelDeploymentUrl = getVercelDeploymentUrl();
	if (vercelDeploymentUrl) {
		return vercelDeploymentUrl;
	}

	throw new Error("Missing APP_BASE_URL");
}

export function getAppBaseUrl(request?: Request) {
	if (request) {
		const requestOrigin = normalizeBaseUrl(new URL(request.url).origin);
		const trustedOrigins = getTrustedRequestOrigins();

		if (trustedOrigins.has(requestOrigin)) {
			return requestOrigin;
		}

		if (trustedOrigins.size === 0 && isLocalRequestOrigin(requestOrigin)) {
			return requestOrigin;
		}
	}

	return getConfiguredAppBaseUrl();
}
