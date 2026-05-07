import { createHmac, timingSafeEqual } from "node:crypto";

import { apiRouteConfig } from "@/app/api/_lib/api-route-config";
import type { JsonValue } from "@/lib/json-value";
import { normalizeIncidentEvent } from "@/lib/observability/incident";
import { captureServerError } from "@/platform/observability/capture-server-error";
import { ingestErrorEvent } from "@/platform/observability/ingest-error-event";
import {
	getRequestIdFromRequest,
	jsonWithRequestId,
} from "@/platform/observability/request-id";
import { buildVercelWebhookIncident } from "@/platform/observability/source-adapters/vercel-webhook";
import { serverEnv } from "@/platform/env/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
	const requestId = getRequestIdFromRequest(request);

	if (!serverEnv.OBSERVABILITY_VERCEL_WEBHOOK_SECRET) {
		await captureServerError({
			source: "vercel",
			error: new Error("Missing Vercel webhook signing secret."),
			requestId,
			pathname: apiRouteConfig.observabilityVercel,
			code: "vercel_webhook_secret_missing",
			severity: "high",
			surface: "config_drift",
		});

		return jsonWithRequestId(
			{ error: "Vercel webhook signing secret is not configured.", requestId },
			{ status: 503 },
			requestId,
		);
	}

	const rawBody = await request.text();
	const signature = request.headers.get("x-vercel-signature");
	if (
		!isValidVercelWebhookSignature({
			rawBody,
			signature,
			signingSecret: serverEnv.OBSERVABILITY_VERCEL_WEBHOOK_SECRET,
		})
	) {
		await captureServerError({
			source: "vercel",
			error: new Error("Invalid Vercel webhook signature."),
			requestId,
			pathname: apiRouteConfig.observabilityVercel,
			code: "vercel_webhook_verification_failed",
			severity: "high",
			surface: "webhook",
		});

		return jsonWithRequestId(
			{ error: "Invalid Vercel webhook.", requestId },
			{ status: 400 },
			requestId,
		);
	}

	try {
		const event = JSON.parse(rawBody) as {
			type: string;
			payload?: JsonValue;
		};
		const incidentInput = buildVercelWebhookIncident(event);
		if (!incidentInput) {
			return jsonWithRequestId(
				{ ok: true, ignored: true, type: event.type ?? null },
				{ status: 202 },
				requestId,
			);
		}

		await ingestErrorEvent(
			normalizeIncidentEvent({
				...incidentInput,
				pathname: apiRouteConfig.observabilityVercel,
			}),
		);

		return jsonWithRequestId(
			{ ok: true, recorded: true, type: event.type },
			{ status: 202 },
			requestId,
		);
	} catch (error) {
		await captureServerError({
			source: "vercel",
			error: error instanceof Error ? error : String(error),
			requestId,
			pathname: apiRouteConfig.observabilityVercel,
			code: "vercel_webhook_payload_invalid",
			severity: "high",
			surface: "webhook",
		});

		return jsonWithRequestId(
			{ error: "Invalid Vercel webhook payload.", requestId },
			{ status: 400 },
			requestId,
		);
	}
}

function isValidVercelWebhookSignature({
	rawBody,
	signature,
	signingSecret,
}: {
	rawBody: string;
	signature: string | null;
	signingSecret: string;
}) {
	if (!signature) {
		return false;
	}

	const expectedSignature = createHmac("sha1", signingSecret)
		.update(rawBody)
		.digest("hex");

	if (expectedSignature.length !== signature.length) {
		return false;
	}

	return timingSafeEqual(
		Buffer.from(expectedSignature),
		Buffer.from(signature),
	);
}
