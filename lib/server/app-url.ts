import "server-only";

import { serverEnv } from "@/lib/env/server";

function normalizeBaseUrl(value: string) {
	return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getAppBaseUrl(request?: Request) {
	if (serverEnv.APP_BASE_URL) {
		return normalizeBaseUrl(serverEnv.APP_BASE_URL);
	}

	const vercelUrl =
		process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
	if (vercelUrl) {
		const origin = vercelUrl.startsWith("http")
			? vercelUrl
			: `https://${vercelUrl}`;
		return normalizeBaseUrl(origin);
	}

	if (request) {
		return normalizeBaseUrl(new URL(request.url).origin);
	}

	throw new Error("Missing APP_BASE_URL");
}
