import "server-only";

import { serverEnv } from "@/platform/env/server";

import type { NormalizedObservabilityEvent } from "../lib/error-event";

const OBSERVABILITY_INGEST_PATH = "/observability/events";

export async function ingestErrorEvent(event: NormalizedObservabilityEvent) {
	const convexUrl =
		normalizeOptionalEnvValue(process.env.NEXT_PUBLIC_CONVEX_SITE_URL) ??
		normalizeOptionalEnvValue(process.env.NEXT_PUBLIC_CONVEX_URL);
	if (!serverEnv.OBSERVABILITY_INGEST_TOKEN || !convexUrl) {
		return;
	}

	try {
		await fetch(`${convexUrl}${OBSERVABILITY_INGEST_PATH}`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${serverEnv.OBSERVABILITY_INGEST_TOKEN}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(event),
			cache: "no-store",
			signal: AbortSignal.timeout(800),
		});
	} catch (error) {
		console.error("observability ingest failed", error);
	}
}

function normalizeOptionalEnvValue(value: string | undefined) {
	if (typeof value !== "string") {
		return null;
	}

	const normalized = value.trim();
	return normalized.length > 0 ? normalized : null;
}
