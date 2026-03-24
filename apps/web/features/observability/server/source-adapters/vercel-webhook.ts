import type { IncidentEventInput } from "@/features/observability/lib/incident";

const escalatedVercelDeploymentEventTypes = [
	"deployment.error",
	"deployment.canceled",
] as const;

type EscalatedVercelDeploymentEventType =
	(typeof escalatedVercelDeploymentEventTypes)[number];

type VercelDeploymentWebhookEvent = {
	type: string;
	payload?: unknown;
};

export function buildVercelWebhookIncident(
	event: VercelDeploymentWebhookEvent,
): IncidentEventInput | null {
	if (!isEscalatedVercelDeploymentEventType(event.type)) {
		return null;
	}

	const payload = requireRecord(event.payload, "payload");
	const deployment = requireRecord(payload.deployment, "payload.deployment");
	const links = readRecord(payload.links);
	const deploymentId = requireString(deployment.id, "payload.deployment.id");
	const deploymentName =
		readString(deployment.name) ?? readString(payload.name) ?? "deployment";
	const deploymentTarget =
		readString(payload.target) ?? readString(deployment.target);

	if (deploymentTarget !== "production") {
		return null;
	}

	const deploymentDashboardUrl = readString(links?.deployment);
	const projectDashboardUrl = readString(links?.project);

	return {
		source: "vercel",
		surface: "health",
		severity: "high",
		error: new Error(buildVercelIncidentTitle(event.type, deploymentName)),
		code: buildVercelIncidentCode(event.type),
		externalEventId: `${event.type}:${deploymentId}`,
		deploymentId,
		nativeUrl: projectDashboardUrl ?? deploymentDashboardUrl,
		logsUrl: deploymentDashboardUrl,
		details: {
			eventType: event.type,
			deploymentId,
			deploymentName,
			deploymentTarget,
			deploymentUrl: readString(deployment.url),
			projectId: readString(readRecord(payload.project)?.id),
			teamId: readString(readRecord(payload.team)?.id),
			userId: readString(readRecord(payload.user)?.id),
		},
		nextAction: buildVercelNextAction(event.type),
	};
}

function isEscalatedVercelDeploymentEventType(
	value: string,
): value is EscalatedVercelDeploymentEventType {
	return (
		escalatedVercelDeploymentEventTypes as readonly string[]
	).includes(value);
}

function buildVercelIncidentTitle(
	eventType: EscalatedVercelDeploymentEventType,
	deploymentName: string,
) {
	if (eventType === "deployment.canceled") {
		return `Vercel production deployment canceled for ${deploymentName}.`;
	}

	return `Vercel production deployment failed for ${deploymentName}.`;
}

function buildVercelIncidentCode(eventType: EscalatedVercelDeploymentEventType) {
	if (eventType === "deployment.canceled") {
		return "vercel_deployment_canceled";
	}

	return "vercel_deployment_failed";
}

function buildVercelNextAction(
	eventType: EscalatedVercelDeploymentEventType,
) {
	if (eventType === "deployment.canceled") {
		return "Check the Vercel deployment activity and confirm whether the production rollout was intentionally canceled.";
	}

	return "Open the failing Vercel deployment logs and fix the blocked production build or rollout.";
}

function readRecord(value: unknown) {
	if (!value || typeof value !== "object") {
		return null;
	}

	return value as Record<string, unknown>;
}

function requireRecord(value: unknown, fieldName: string) {
	const record = readRecord(value);
	if (!record) {
		throw new Error(`Missing ${fieldName}.`);
	}

	return record;
}

function readString(value: unknown) {
	return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function requireString(value: unknown, fieldName: string) {
	const stringValue = readString(value);
	if (!stringValue) {
		throw new Error(`Missing ${fieldName}.`);
	}

	return stringValue;
}
