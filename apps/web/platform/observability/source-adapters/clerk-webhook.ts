import type { WebhookEvent } from "@clerk/backend/webhooks";

import type { IncidentEventInput } from "@/lib/observability/incident";

export function buildClerkWebhookIncident(
	event: WebhookEvent,
): IncidentEventInput | null {
	if (event.type !== "session.revoked") {
		return null;
	}

	const sessionId = readString(event.data, "id");
	const userId = readString(event.data, "user_id");
	const sessionStatus = readString(event.data, "status");

	return {
		source: "clerk",
		surface: "auth",
		severity: "high",
		error: new Error("Clerk session revoked."),
		userId,
		externalEventId: buildClerkEventKey(event.type, sessionId),
		code: "clerk_session_revoked",
		details: {
			eventType: event.type,
			sessionId,
			sessionStatus,
			clientIp: event.event_attributes.http_request.client_ip,
			userAgent: event.event_attributes.http_request.user_agent,
		},
		nextAction:
			"Check the Clerk dashboard session history and confirm whether the revocation was expected.",
	};
}

function buildClerkEventKey(eventType: string, entityId: string | null) {
	return entityId ? `${eventType}:${entityId}` : eventType;
}

function readString(value: unknown, key: string) {
	if (!value || typeof value !== "object") {
		return null;
	}

	const candidate = (value as Record<string, unknown>)[key];
	return typeof candidate === "string" && candidate.length > 0
		? candidate
		: null;
}
