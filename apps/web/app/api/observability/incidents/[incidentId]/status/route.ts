import { z } from "zod";

import { apiRouteConfig } from "@/app/api/_lib/api-route-config";
import { incidentControlStatusValues } from "@/lib/observability/incident";
import { captureServerError } from "@/platform/observability/capture-server-error";
import {
	getRequestIdFromRequest,
	jsonWithRequestId,
} from "@/platform/observability/request-id";
import { updateIncidentStatus } from "@/platform/observability/update-incident-status";
import { serverEnv } from "@/platform/env/server";

export const runtime = "nodejs";

const incidentStatusRequestSchema = z.object({
	status: z.enum(incidentControlStatusValues),
});

type IncidentStatusRouteContext = {
	params: Promise<{
		incidentId: string;
	}>;
};

export async function POST(
	request: Request,
	context: IncidentStatusRouteContext,
) {
	const requestId = getRequestIdFromRequest(request);

	if (!serverEnv.OBSERVABILITY_INCIDENT_CONTROL_TOKEN) {
		await captureServerError({
			source: "next_runtime",
			error: new Error("Missing incident control token."),
			requestId,
			pathname: apiRouteConfig.observabilityIncidentStatus,
			code: "incident_control_token_missing",
			severity: "high",
			surface: "config_drift",
		});

		return jsonWithRequestId(
			{ error: "Incident control token is not configured.", requestId },
			{ status: 503 },
			requestId,
		);
	}

	if (!serverEnv.OBSERVABILITY_INGEST_TOKEN) {
		await captureServerError({
			source: "next_runtime",
			error: new Error("Missing observability ingest token."),
			requestId,
			pathname: apiRouteConfig.observabilityIncidentStatus,
			code: "incident_status_transport_unconfigured",
			severity: "high",
			surface: "config_drift",
		});

		return jsonWithRequestId(
			{
				error:
					"Incident status transport is not configured because OBSERVABILITY_INGEST_TOKEN is missing.",
				requestId,
			},
			{ status: 503 },
			requestId,
		);
	}

	if (
		request.headers.get("authorization") !==
		`Bearer ${serverEnv.OBSERVABILITY_INCIDENT_CONTROL_TOKEN}`
	) {
		return jsonWithRequestId(
			{ error: "Unauthorized.", requestId },
			{ status: 401 },
			requestId,
		);
	}

	const parsedBody = incidentStatusRequestSchema.safeParse(
		(await request.json().catch(() => null)) as unknown,
	);
	if (!parsedBody.success) {
		return jsonWithRequestId(
			{
				error:
					"Invalid request body. Expected { status: acked | muted | resolved | firing }.",
				requestId,
			},
			{ status: 400 },
			requestId,
		);
	}

	try {
		const { incidentId } = await context.params;
		await updateIncidentStatus({
			incidentId,
			status: parsedBody.data.status,
			ingestToken: serverEnv.OBSERVABILITY_INGEST_TOKEN,
		});

		return jsonWithRequestId(
			{
				ok: true,
				incidentId,
				status: parsedBody.data.status,
				requestId,
			},
			{ status: 200 },
			requestId,
		);
	} catch (error) {
		await captureServerError({
			source: "convex",
			error: error instanceof Error ? error : String(error),
			requestId,
			pathname: apiRouteConfig.observabilityIncidentStatus,
			code: "incident_status_update_failed",
			severity: "high",
			surface: "health",
		});

		return jsonWithRequestId(
			{ error: "Unable to update the incident status.", requestId },
			{ status: 502 },
			requestId,
		);
	}
}
