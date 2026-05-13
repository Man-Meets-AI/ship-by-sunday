import { jsonWithRequestId } from "@/platform/observability/request-id";

import { captureServerError } from "./capture-server-error";
import type {
	IncidentError,
	ObservabilitySeverity,
	ObservabilitySource,
} from "@/lib/observability/error-event";
import type { JsonObject } from "@/lib/json-value";

type UnexpectedApiErrorResponseOptions = {
	error: IncidentError;
	requestId: string;
	pathname: string;
	source: ObservabilitySource;
	defaultMessage: string;
	code?: string;
	userId?: string | null;
	severity?: ObservabilitySeverity;
	details?: JsonObject | null;
	nativeUrl?: string | null;
	logsUrl?: string | null;
	nextAction?: string | null;
	capture?: boolean;
};

export async function getUnexpectedApiErrorResponse({
	error,
	requestId,
	pathname,
	source,
	defaultMessage,
	code = "server_error",
	userId = null,
	severity,
	details,
	nativeUrl,
	logsUrl,
	nextAction,
	capture = true,
}: UnexpectedApiErrorResponseOptions) {
	if (capture) {
		await captureServerError({
			source,
			error,
			requestId,
			pathname,
			userId,
			code,
			severity,
			details,
			nativeUrl,
			logsUrl,
			nextAction,
		});
	}

	return jsonWithRequestId(
		{
			error: error instanceof Error ? error.message : defaultMessage,
			code,
			requestId,
		},
		{ status: 500 },
		requestId,
	);
}
