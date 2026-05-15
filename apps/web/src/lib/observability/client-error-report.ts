import {
	isNextControlFlowError,
	normalizeObservabilityEvent,
	type ObservabilityEventInput,
} from "@/lib/observability/error-event";
import { capturePostHogClientException } from "@/lib/observability/posthog-client";

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

	capturePostHogClientException({
		error: input.error,
		properties: {
			source: payload.source,
			severity: payload.severity,
			code: payload.code ?? null,
			requestId: payload.requestId ?? null,
			pathname: payload.pathname ?? null,
			title: payload.title,
		},
	});
}
