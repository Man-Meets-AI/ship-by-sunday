import {
	getRequestIdFromRequest,
	jsonWithRequestId,
} from "@/platform/observability/request-id";

export const runtime = "nodejs";

export async function POST(request: Request) {
	const requestId = getRequestIdFromRequest(request);
	return jsonWithRequestId(
		{
			error:
				"Client error ingest moved to PostHog. This Convex-backed endpoint is retired.",
		},
		{ status: 410 },
		requestId,
	);
}
