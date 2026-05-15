import "server-only";

import {
	isNextControlFlowError,
	normalizeObservabilityEvent,
	type ObservabilityEventInput,
} from "@/lib/observability/error-event";
import { ingestErrorEvent } from "@/platform/observability/ingest-error-event";

export function captureServerError(input: ObservabilityEventInput) {
	if (isNextControlFlowError(input.error)) {
		return;
	}

	void ingestErrorEvent(normalizeObservabilityEvent(input));
}
