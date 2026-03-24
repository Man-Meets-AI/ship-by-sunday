import {
	isNextControlFlowError,
	normalizeObservabilityEvent,
	type ObservabilityEventInput,
} from "@/features/observability/lib/error-event";
import { ingestErrorEvent } from "@/features/observability/server/ingest-error-event";

export function captureServerError(input: ObservabilityEventInput) {
	if (isNextControlFlowError(input.error)) {
		return;
	}

	void ingestErrorEvent(normalizeObservabilityEvent(input));
}
