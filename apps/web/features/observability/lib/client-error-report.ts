import {
	isNextControlFlowError,
	normalizeObservabilityEvent,
	type ObservabilityEventInput,
} from "@/features/observability/lib/error-event";

const CLIENT_ERROR_ENDPOINT = "/api/observability/client-error";

export function reportClientError(
	input: Omit<ObservabilityEventInput, "source">,
) {
	if (isNextControlFlowError(input.error)) {
		return;
	}

	const payload = normalizeObservabilityEvent({
		...input,
		source: "next_client",
	});
	const requestBody = JSON.stringify({
		message: payload.title,
		stack: payload.stack,
		details: payload.details,
		requestId: payload.requestId,
		pathname: payload.pathname,
		code: payload.code,
	});

	const shouldUseBeacon =
		typeof navigator !== "undefined" &&
		typeof navigator.sendBeacon === "function" &&
		requestBody.length < 60_000;

	if (shouldUseBeacon) {
		navigator.sendBeacon(
			CLIENT_ERROR_ENDPOINT,
			new Blob([requestBody], { type: "application/json" }),
		);
		return;
	}

	void fetch(CLIENT_ERROR_ENDPOINT, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: requestBody,
		keepalive: true,
	}).catch(() => undefined);
}
