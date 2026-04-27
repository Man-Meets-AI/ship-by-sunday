import { z } from "zod";

import { normalizeObservabilityEvent } from "@/lib/observability/error-event";
import { ingestErrorEvent } from "@/platform/observability/ingest-error-event";
import {
	getRequestIdFromRequest,
	jsonWithRequestId,
} from "@/platform/observability/request-id";

const clientErrorSchema = z.object({
	message: z.string().min(1),
	stack: z.string().nullable(),
	details: z.string().nullable(),
	requestId: z.string().nullable(),
	pathname: z.string().nullable(),
	code: z.string().nullable(),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
	const requestId = getRequestIdFromRequest(request);
	if (!isTrustedClientReport(request)) {
		return jsonWithRequestId(
			{ error: "Forbidden." },
			{ status: 403 },
			requestId,
		);
	}

	const body = (await request.json().catch(() => null)) as unknown;
	const parsed = clientErrorSchema.safeParse(body);

	if (!parsed.success) {
		return jsonWithRequestId(
			{ error: "Invalid client error payload." },
			{ status: 400 },
			requestId,
		);
	}

	await ingestErrorEvent(
		normalizeObservabilityEvent({
			source: "next_client",
			error: new Error(parsed.data.message),
			requestId: parsed.data.requestId ?? requestId,
			pathname: parsed.data.pathname,
			code: parsed.data.code,
			severity: "medium",
			details: parsed.data.details
				? { clientDetails: parsed.data.details }
				: null,
		}),
	);

	return jsonWithRequestId({ ok: true }, { status: 202 }, requestId);
}

function isTrustedClientReport(request: Request) {
	const expectedOrigin = new URL(request.url).origin;
	const origin = request.headers.get("origin");
	const referer = request.headers.get("referer");
	const fetchSite = request.headers.get("sec-fetch-site");

	if (origin === expectedOrigin) {
		return true;
	}

	if (typeof referer === "string" && referer.startsWith(expectedOrigin)) {
		return true;
	}

	return fetchSite === "same-origin" || fetchSite === "same-site";
}
