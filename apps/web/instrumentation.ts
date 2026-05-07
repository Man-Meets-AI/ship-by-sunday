import type { Instrumentation } from "next";

import { getRequestIdFromHeaderRecord } from "@/platform/observability/request-id";

export async function register() {}

export const onRequestError: Instrumentation.onRequestError = async (
	error,
	errorRequest,
	errorContext,
) => {
	if (process.env.NEXT_RUNTIME !== "nodejs") {
		return;
	}

	const { capturePostHogServerException, flushPostHogServer } =
		await import("@/platform/observability/posthog-server");
	const requestId = getRequestIdFromHeaderRecord(errorRequest.headers);
	const incidentError = error instanceof Error ? error : String(error);

	capturePostHogServerException({
		error: incidentError,
		distinctId: getPostHogDistinctId(errorRequest.headers.cookie),
		properties: {
			source: "next_runtime",
			requestId,
			pathname: errorRequest.path,
			code: "next_request_error",
			method: errorRequest.method,
			routerKind: errorContext.routerKind,
			routePath: errorContext.routePath,
			routeType: errorContext.routeType,
			renderSource: errorContext.renderSource ?? null,
			revalidateReason: errorContext.revalidateReason ?? null,
			digest: error instanceof Error ? getErrorDigest(error) : null,
		},
	});
	await flushPostHogServer();
};

function getErrorDigest(error: Error & { digest?: string }) {
	if (!error || typeof error !== "object" || !("digest" in error)) {
		return null;
	}

	return typeof error.digest === "string" ? error.digest : null;
}

function getPostHogDistinctId(cookieHeader: string | string[] | undefined) {
	if (!cookieHeader) {
		return undefined;
	}

	const cookieString = Array.isArray(cookieHeader)
		? cookieHeader.join("; ")
		: cookieHeader;
	const cookieMatch = cookieString.match(/ph_phc_.*?_posthog=([^;]+)/);
	if (!cookieMatch?.[1]) {
		return undefined;
	}

	try {
		const parsedCookie = JSON.parse(decodeURIComponent(cookieMatch[1])) as {
			distinct_id?: string;
		};
		return typeof parsedCookie.distinct_id === "string"
			? parsedCookie.distinct_id
			: undefined;
	} catch {
		return undefined;
	}
}
