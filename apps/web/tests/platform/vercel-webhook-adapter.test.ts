import { buildVercelWebhookIncident } from "@/features/observability/server/source-adapters/vercel-webhook";

describe("vercel webhook adapter", () => {
	it("builds an incident for a failed production deployment", () => {
		const incident = buildVercelWebhookIncident({
			type: "deployment.error",
			payload: {
				target: "production",
				deployment: {
					id: "dpl_123",
					name: "ship-by-sunday",
					url: "ship-by-sunday.vercel.app",
				},
				project: {
					id: "prj_123",
				},
				team: {
					id: "team_123",
				},
				user: {
					id: "user_123",
				},
				links: {
					deployment:
						"https://vercel.com/acme/ship-by-sunday/deployments/dpl_123",
					project: "https://vercel.com/acme/ship-by-sunday",
				},
			},
		});

		expect(incident).toMatchObject({
			source: "vercel",
			surface: "health",
			severity: "high",
			code: "vercel_deployment_failed",
			externalEventId: "deployment.error:dpl_123",
			deploymentId: "dpl_123",
			nativeUrl: "https://vercel.com/acme/ship-by-sunday",
			logsUrl: "https://vercel.com/acme/ship-by-sunday/deployments/dpl_123",
		});
		expect(incident?.details).toMatchObject({
			deploymentTarget: "production",
			deploymentName: "ship-by-sunday",
			projectId: "prj_123",
		});
	});

	it("ignores preview and non-deployment events", () => {
		const previewIncident = buildVercelWebhookIncident({
			type: "deployment.error",
			payload: {
				target: "preview",
				deployment: {
					id: "dpl_preview",
				},
			},
		});
		const unrelatedIncident = buildVercelWebhookIncident({
			type: "deployment.ready",
			payload: {
				target: "production",
			},
		});

		expect(previewIncident).toBeNull();
		expect(unrelatedIncident).toBeNull();
	});

	it("throws when a production deployment event is malformed", () => {
		expect(() =>
			buildVercelWebhookIncident({
				type: "deployment.canceled",
				payload: {
					target: "production",
					deployment: {},
				},
			}),
		).toThrow("Missing payload.deployment.id.");
	});
});
