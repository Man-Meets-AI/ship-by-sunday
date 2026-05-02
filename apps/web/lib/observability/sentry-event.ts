import * as Sentry from "@sentry/nextjs";

import {
	normalizeObservabilityEvent,
	type NormalizedObservabilityEvent,
	type ObservabilityEventInput,
} from "@/lib/observability/error-event";

export function captureObservabilityEventWithSentry(
	input: ObservabilityEventInput,
) {
	const event = normalizeObservabilityEvent(input);
	captureNormalizedObservabilityEventWithSentry({
		event,
		error: input.error,
	});
}

export function captureNormalizedObservabilityEventWithSentry({
	event,
	error,
}: {
	event: NormalizedObservabilityEvent;
	error: unknown;
}) {
	Sentry.withScope((scope) => {
		scope.setLevel(getSentryLevel(event.severity));
		scope.setFingerprint([event.product, event.environment, event.fingerprint]);
		scope.setTags({
			code: event.code ?? "unknown",
			environment: event.environment,
			product: event.product,
			source: event.source,
			surface: event.surface,
		});
		if (event.requestId) {
			scope.setTag("request_id", event.requestId);
		}
		if (event.pathname) {
			scope.setTag("pathname", event.pathname);
		}
		if (event.userId) {
			scope.setUser({ id: event.userId });
		}
		scope.setContext("ship_by_sunday_observability", {
			code: event.code,
			details: event.details,
			externalEventId: event.externalEventId,
			logsUrl: event.logsUrl,
			nativeUrl: event.nativeUrl,
			nextAction: event.nextAction,
			pathname: event.pathname,
			requestId: event.requestId,
			summary: event.summary,
		});

		Sentry.captureException(getSentryException(error, event.title));
	});
}

function getSentryLevel(severity: NormalizedObservabilityEvent["severity"]) {
	switch (severity) {
		case "critical":
			return "fatal";
		case "high":
			return "error";
		case "medium":
			return "warning";
		default:
			return "error";
	}
}

function getSentryException(error: unknown, title: string) {
	if (error instanceof Error) {
		return error;
	}

	return new Error(title);
}
