import "server-only";

import { apiConfig } from "@/config/product";
import { serverEnv } from "@/platform/env/server";

function normalizeBaseUrl(value: string) {
	return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getAppBaseUrl(request?: Request) {
	if (serverEnv.APP_BASE_URL) {
		return normalizeBaseUrl(serverEnv.APP_BASE_URL);
	}

	if (request) {
		return normalizeBaseUrl(new URL(request.url).origin);
	}

	const vercelUrl =
		process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
	if (vercelUrl) {
		const origin = vercelUrl.startsWith("http")
			? vercelUrl
			: `${apiConfig.secureHttpProtocol}${vercelUrl}`;
		return normalizeBaseUrl(origin);
	}

	throw new Error("Missing APP_BASE_URL");
}
