import posthog from "posthog-js";

import type { IncidentError } from "@/lib/observability/incident";

const POSTHOG_DEFAULTS = "2026-01-30";
const POSTHOG_REPLAY_MASK_SELECTOR =
	"[data-ph-mask], [data-sensitive], [data-private], .ph-mask, .ph-sensitive";
const POSTHOG_REPLAY_BLOCK_SELECTOR = "[data-ph-no-capture], .ph-no-capture";

let postHogClientInitialized = false;

type PostHogEventProperties = Record<string, string | number | boolean | null>;

function normalizePublicEnvValue(value: string | undefined) {
	if (typeof value !== "string") {
		return undefined;
	}

	const normalized = value.trim();
	return normalized.length > 0 ? normalized : undefined;
}

export function getPostHogBrowserConfig() {
	const token = normalizePublicEnvValue(process.env.NEXT_PUBLIC_POSTHOG_TOKEN);
	const host = normalizePublicEnvValue(process.env.NEXT_PUBLIC_POSTHOG_HOST);

	if (!token) {
		return null;
	}

	return {
		token,
		host: host ?? "https://us.i.posthog.com",
	};
}

export function initializePostHogClient() {
	if (postHogClientInitialized) {
		return true;
	}

	const config = getPostHogBrowserConfig();
	if (!config) {
		return false;
	}

	postHogClientInitialized = true;
	posthog.init(config.token, {
		api_host: config.host,
		defaults: POSTHOG_DEFAULTS,
		capture_pageview: "history_change",
		autocapture: true,
		capture_exceptions: true,
		disable_session_recording: true,
		enable_recording_console_log: false,
		session_recording: {
			maskAllInputs: true,
			maskTextSelector: POSTHOG_REPLAY_MASK_SELECTOR,
			blockSelector: POSTHOG_REPLAY_BLOCK_SELECTOR,
		},
	});

	return true;
}

export function capturePostHogClientException({
	error,
	properties,
}: {
	error: IncidentError;
	properties?: PostHogEventProperties;
}) {
	try {
		if (!initializePostHogClient()) {
			return false;
		}

		posthog.captureException(error, properties);
		return true;
	} catch {
		return false;
	}
}

export function capturePostHogProductEvent({
	event,
	properties,
}: {
	event: string;
	properties?: PostHogEventProperties;
}) {
	try {
		if (!initializePostHogClient()) {
			return false;
		}

		posthog.capture(event, properties);
		return true;
	} catch {
		return false;
	}
}

export function resetPostHogClientForTests() {
	postHogClientInitialized = false;
}
