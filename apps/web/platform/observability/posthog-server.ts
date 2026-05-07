import "server-only";

import { PostHog } from "posthog-node";

import type { IncidentError } from "@/lib/observability/incident";

type PostHogServerExceptionProperties = Record<
	string,
	string | number | boolean | null
>;

let postHogServerClient: PostHog | null = null;

function normalizeServerEnvValue(value: string | undefined) {
	if (typeof value !== "string") {
		return undefined;
	}

	const normalized = value.trim();
	return normalized.length > 0 ? normalized : undefined;
}

function getPostHogServerClient() {
	if (postHogServerClient) {
		return postHogServerClient;
	}

	const token = normalizeServerEnvValue(process.env.NEXT_PUBLIC_POSTHOG_TOKEN);
	if (!token) {
		return null;
	}

	postHogServerClient = new PostHog(token, {
		host:
			normalizeServerEnvValue(process.env.NEXT_PUBLIC_POSTHOG_HOST) ??
			"https://us.i.posthog.com",
		flushAt: 1,
		flushInterval: 0,
	});

	return postHogServerClient;
}

export function capturePostHogServerException({
	error,
	distinctId,
	properties,
}: {
	error: IncidentError;
	distinctId?: string;
	properties?: PostHogServerExceptionProperties;
}) {
	const posthog = getPostHogServerClient();
	if (!posthog) {
		return false;
	}

	posthog.captureException(error, distinctId, properties);
	return true;
}

export async function flushPostHogServer() {
	if (!postHogServerClient) {
		return;
	}

	await postHogServerClient.flush();
}

export function resetPostHogServerForTests() {
	postHogServerClient = null;
}
