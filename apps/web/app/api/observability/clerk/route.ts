import { verifyWebhook } from "@clerk/backend/webhooks";

import { apiRouteConfig } from "@/config/product";
import { normalizeIncidentEvent } from "@/features/observability/lib/incident";
import { buildClerkWebhookIncident } from "@/features/observability/server/source-adapters/clerk-webhook";
import { captureServerError } from "@/features/observability/server/capture-server-error";
import { ingestErrorEvent } from "@/features/observability/server/ingest-error-event";
import {
	getRequestIdFromRequest,
	jsonWithRequestId,
} from "@/features/observability/server/request-id";
import { serverEnv } from "@/platform/env/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
	const requestId = getRequestIdFromRequest(request);

	if (!serverEnv.CLERK_WEBHOOK_SIGNING_SECRET) {
		await captureServerError({
			source: "clerk",
			error: new Error("Missing Clerk webhook signing secret."),
			requestId,
			pathname: apiRouteConfig.observabilityClerk,
			code: "clerk_webhook_secret_missing",
			severity: "high",
			surface: "config_drift",
		});

		return jsonWithRequestId(
			{ error: "Clerk webhook signing secret is not configured.", requestId },
			{ status: 503 },
			requestId,
		);
	}

	try {
		const event = await verifyWebhook(request, {
			signingSecret: serverEnv.CLERK_WEBHOOK_SIGNING_SECRET,
		});
		const incidentInput = buildClerkWebhookIncident(event);
		if (!incidentInput) {
			return jsonWithRequestId(
				{ ok: true, ignored: true, type: event.type },
				{ status: 202 },
				requestId,
			);
		}

		await ingestErrorEvent(
			normalizeIncidentEvent({
				...incidentInput,
				pathname: apiRouteConfig.observabilityClerk,
			}),
		);

		return jsonWithRequestId(
			{ ok: true, recorded: true, type: event.type },
			{ status: 202 },
			requestId,
		);
	} catch (error) {
		await captureServerError({
			source: "clerk",
			error,
			requestId,
			pathname: apiRouteConfig.observabilityClerk,
			code: "clerk_webhook_verification_failed",
			severity: "high",
			surface: "webhook",
		});

		return jsonWithRequestId(
			{ error: "Invalid Clerk webhook.", requestId },
			{ status: 400 },
			requestId,
		);
	}
}
