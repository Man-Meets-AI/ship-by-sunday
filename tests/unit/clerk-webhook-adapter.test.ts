import type { WebhookEvent } from "@clerk/backend/webhooks";

import { buildClerkWebhookIncident } from "@/features/observability/server/source-adapters/clerk-webhook";

describe("clerk webhook adapter", () => {
	it("builds an incident for session.revoked", () => {
		const incident = buildClerkWebhookIncident({
			type: "session.revoked",
			object: "event",
			data: {
				id: "sess_123",
				user_id: "user_123",
				status: "revoked",
				user: null,
			},
			event_attributes: {
				http_request: {
					client_ip: "127.0.0.1",
					user_agent: "vitest",
				},
			},
		} as WebhookEvent);

		expect(incident).toMatchObject({
			source: "clerk",
			surface: "auth",
			severity: "high",
			userId: "user_123",
			externalEventId: "session.revoked:sess_123",
			code: "clerk_session_revoked",
		});
	});

	it("ignores non-escalated Clerk webhook events", () => {
		const incident = buildClerkWebhookIncident({
			type: "user.created",
			object: "event",
			data: {
				id: "user_123",
			},
			event_attributes: {
				http_request: {
					client_ip: "127.0.0.1",
					user_agent: "vitest",
				},
			},
		} as WebhookEvent);

		expect(incident).toBeNull();
	});
});
