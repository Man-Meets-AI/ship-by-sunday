import {
	isNextControlFlowError,
	type ObservabilityEventInput,
} from "@/lib/observability/error-event";
import { captureObservabilityEventWithSentry } from "@/lib/observability/sentry-event";

export function reportClientError(
	input: Omit<ObservabilityEventInput, "source">,
) {
	if (isNextControlFlowError(input.error)) {
		return;
	}

	captureObservabilityEventWithSentry({
		...input,
		source: "next_client",
	});
}
