import { jsonWithRequestId } from "@/features/observability/server/request-id";

import { captureServerError } from "./capture-server-error";
import type { ObservabilitySeverity, ObservabilitySource } from "../lib/error-event";

type UnexpectedApiErrorResponseOptions = {
	error: unknown;
	requestId: string;
	pathname: string;
	source: ObservabilitySource;
	defaultMessage: string;
	code?: string;
	userId?: string | null;
	severity?: ObservabilitySeverity;
	details?: Record<string, unknown>;
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
}: UnexpectedApiErrorResponseOptions) {
	await captureServerError({
		source,
		error,
		requestId,
		pathname,
		userId,
		code,
		severity,
		details,
	});

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
