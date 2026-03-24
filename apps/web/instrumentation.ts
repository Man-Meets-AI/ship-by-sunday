import type { Instrumentation } from "next";

import { captureServerError } from "@/features/observability/server/capture-server-error";
import { getRequestIdFromHeaderRecord } from "@/features/observability/server/request-id";

export async function register() {}

export const onRequestError: Instrumentation.onRequestError = async (
	error,
	errorRequest,
	errorContext,
) => {
	await captureServerError({
		source: "next_runtime",
		error,
		requestId: getRequestIdFromHeaderRecord(errorRequest.headers),
		pathname: errorRequest.path,
		code: "next_request_error",
		details: {
			method: errorRequest.method,
			routerKind: errorContext.routerKind,
			routePath: errorContext.routePath,
			routeType: errorContext.routeType,
			renderSource: errorContext.renderSource ?? null,
			revalidateReason: errorContext.revalidateReason ?? null,
		},
	});
};
