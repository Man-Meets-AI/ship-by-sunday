import { NextResponse } from "next/server";

export const REQUEST_ID_HEADER = "x-request-id" as const;

export function createRequestId() {
	return crypto.randomUUID();
}

export function getRequestIdFromRequest(
	request: Request | null | undefined,
	fallbackRequestId?: string | null,
) {
	const requestId =
		request?.headers.get(REQUEST_ID_HEADER) ??
		fallbackRequestId ??
		createRequestId();

	return requestId;
}

export function getRequestIdFromHeaderRecord(
	headers: NodeJS.Dict<string | string[]>,
	fallbackRequestId?: string | null,
) {
	const headerValue = headers[REQUEST_ID_HEADER];
	if (typeof headerValue === "string" && headerValue.trim().length > 0) {
		return headerValue;
	}

	if (Array.isArray(headerValue) && headerValue[0]?.trim()) {
		return headerValue[0];
	}

	return fallbackRequestId ?? createRequestId();
}

export function jsonWithRequestId(
	body: unknown,
	init: ResponseInit | undefined,
	requestId: string,
) {
	const response = NextResponse.json(body, init);
	response.headers.set(REQUEST_ID_HEADER, requestId);
	return response;
}

export function withRequestId<T extends Response>(
	response: T,
	requestId: string,
) {
	response.headers.set(REQUEST_ID_HEADER, requestId);
	return response;
}
