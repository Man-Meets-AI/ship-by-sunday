import "server-only";

import { serverEnv } from "@/platform/env/server";

function toOrigin(value: string) {
	return new URL(value).origin;
}

function readConfiguredOrigins(value: string | undefined) {
	if (!value) {
		return [];
	}

	return value
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean)
		.map((origin) => toOrigin(origin));
}

export function getClerkAuthorizedParties() {
	const origins = new Set<string>();

	if (serverEnv.APP_BASE_URL) {
		origins.add(toOrigin(serverEnv.APP_BASE_URL));
	}

	for (const origin of readConfiguredOrigins(
		serverEnv.CLERK_AUTHORIZED_PARTIES,
	)) {
		origins.add(origin);
	}

	if (process.env.NODE_ENV !== "production") {
		origins.add("http://localhost:3000");
		origins.add("http://127.0.0.1:3000");
	}

	return [...origins];
}
