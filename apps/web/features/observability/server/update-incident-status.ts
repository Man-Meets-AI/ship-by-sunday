import type { IncidentControlStatus } from "@/features/observability/lib/incident";

const OBSERVABILITY_INCIDENT_STATUS_PATH = "/observability/incidents/status";

export async function updateIncidentStatus({
	incidentId,
	status,
	ingestToken,
}: {
	incidentId: string;
	status: IncidentControlStatus;
	ingestToken: string;
}) {
	const convexUrl =
		normalizeOptionalEnvValue(process.env.NEXT_PUBLIC_CONVEX_SITE_URL) ??
		normalizeOptionalEnvValue(process.env.NEXT_PUBLIC_CONVEX_URL);
	if (!convexUrl) {
		throw new Error("Convex observability url is not configured.");
	}

	const response = await fetch(
		`${convexUrl}${OBSERVABILITY_INCIDENT_STATUS_PATH}`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${ingestToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				incidentId,
				status,
			}),
			cache: "no-store",
			signal: AbortSignal.timeout(800),
		},
	);

	if (!response.ok) {
		const responseText = await response.text();
		throw new Error(
			`Convex incident status update failed with ${response.status}${responseText ? `: ${responseText}` : "."}`,
		);
	}
}

function normalizeOptionalEnvValue(value: string | undefined) {
	if (typeof value !== "string") {
		return null;
	}

	const normalized = value.trim();
	return normalized.length > 0 ? normalized : null;
}
