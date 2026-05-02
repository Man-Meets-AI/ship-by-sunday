import "server-only";

import {
	isNextControlFlowError,
	type ObservabilityEventInput,
} from "@/lib/observability/error-event";
import { captureObservabilityEventWithSentry } from "@/lib/observability/sentry-event";

export function captureServerError(input: ObservabilityEventInput) {
	if (isNextControlFlowError(input.error)) {
		return;
	}

	captureObservabilityEventWithSentry(input);
}
