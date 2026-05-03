import type { WebhookEvent } from "@clerk/backend/webhooks";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("observability source adapters", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = {
			...originalEnv,
			STRIPE_SECRET_KEY: "sk_test_123",
			STRIPE_PRODUCT_ID: "prod_123",
			STRIPE_PRICE_ID: "price_123",
		};
		vi.resetModules();
	});

	afterEach(() => {
		process.env = { ...originalEnv };
		vi.restoreAllMocks();
	});

	it("maps Clerk session revocation events into auth incidents", async () => {
		const { buildClerkWebhookIncident } =
			await import("@/platform/observability/source-adapters/clerk-webhook");
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
			code: "clerk_session_revoked",
			externalEventId: "session.revoked:sess_123",
			userId: "user_123",
		});
		expect(
			buildClerkWebhookIncident({
				type: "session.revoked",
				object: "event",
				data: null,
				event_attributes: {
					http_request: {
						client_ip: "127.0.0.1",
						user_agent: "vitest",
					},
				},
			} as WebhookEvent),
		).toMatchObject({
			externalEventId: "session.revoked",
			userId: null,
		});
		expect(
			buildClerkWebhookIncident({
				type: "user.created",
				object: "event",
				data: {},
				event_attributes: {
					http_request: {
						client_ip: "127.0.0.1",
						user_agent: "vitest",
					},
				},
			} as WebhookEvent),
		).toBeNull();
	});

	it("maps Stripe checkout and webhook failures into actionable incidents", async () => {
		const {
			buildStripeCheckoutFailureContext,
			buildStripeWebhookResultIncident,
		} = await import("@/platform/observability/source-adapters/stripe-failure");
		const {
			buildStripeWebhookResultIncidentEvent,
			getStripeModeLabelFromSecretKey,
		} = await import("@/lib/observability/stripe-webhook-incident");
		const checkoutContext = buildStripeCheckoutFailureContext({
			appBaseUrl: "https://www.man-meets-ai.com",
			userId: "user_123",
		});
		const invalidSignatureIncident = buildStripeWebhookResultIncident({
			kind: "invalid_signature",
			message: "signature mismatch",
		});
		const missingCheckoutEmailIncident = buildStripeWebhookResultIncident({
			kind: "missing_checkout_email",
			eventId: "evt_123",
			eventType: "checkout.session.completed",
			sessionId: "cs_123",
		});
		const grantFailedIncident = buildStripeWebhookResultIncident({
			kind: "grant_failed",
			eventId: "evt_456",
			eventType: "checkout.session.completed",
			sessionId: "cs_456",
			clerkUserId: "user_456",
			stripeCustomerId: "cus_456",
			stripePaymentIntentId: "pi_456",
			message: "convex unavailable",
		});
		const fulfillmentFailedIncident = buildStripeWebhookResultIncident({
			kind: "fulfillment_failed",
			eventId: "evt_789",
			eventType: "checkout.session.completed",
			sessionId: "cs_789",
			message: "Clerk unavailable",
		});

		expect(checkoutContext).toMatchObject({
			nativeUrl: "https://dashboard.stripe.com/test/products/prod_123",
			logsUrl: "https://dashboard.stripe.com/test/events",
		});
		expect(checkoutContext.details).toMatchObject({
			clerkUserId: "user_123",
			courseSlug: "ship-by-sunday",
			stripeMode: "test",
		});
		expect(invalidSignatureIncident).toMatchObject({
			code: "stripe_webhook_invalid_signature",
			surface: "webhook",
			logsUrl: "https://dashboard.stripe.com/test/events",
		});
		expect(missingCheckoutEmailIncident).toMatchObject({
			code: "stripe_webhook_missing_checkout_email",
			externalEventId: "evt_123",
			nativeUrl: "https://dashboard.stripe.com/test/events/evt_123",
		});
		expect(grantFailedIncident).toMatchObject({
			code: "stripe_webhook_grant_failed",
			externalEventId: "evt_456",
			userId: "user_456",
			logsUrl: "https://dashboard.stripe.com/test/events/evt_456",
		});
		expect(grantFailedIncident.details).toMatchObject({
			stripeCustomerId: "cus_456",
			stripePaymentIntentId: "pi_456",
		});
		expect(fulfillmentFailedIncident).toMatchObject({
			code: "stripe_webhook_fulfillment_failed",
			externalEventId: "evt_789",
			nativeUrl: "https://dashboard.stripe.com/test/events/evt_789",
		});
		expect(fulfillmentFailedIncident.details).toMatchObject({
			fulfillmentMessage: "Clerk unavailable",
			sessionId: "cs_789",
		});
		expect(getStripeModeLabelFromSecretKey("sk_test_123")).toBe("test");
		expect(getStripeModeLabelFromSecretKey("sk_live_123")).toBe("live");
		expect(
			buildStripeWebhookResultIncidentEvent({
				result: {
					kind: "missing_checkout_email",
					eventId: "",
					eventType: "checkout.session.completed",
					sessionId: "cs_live_123",
				},
				stripeMode: "live",
			}),
		).toMatchObject({
			logsUrl: "https://dashboard.stripe.com/events",
			nativeUrl: "https://dashboard.stripe.com/events",
		});
	});

	it("maps Vercel production failures and ignores preview noise", async () => {
		const { buildVercelWebhookIncident } =
			await import("@/platform/observability/source-adapters/vercel-webhook");
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
			code: "vercel_deployment_failed",
			externalEventId: "deployment.error:dpl_123",
			deploymentId: "dpl_123",
			nativeUrl: "https://vercel.com/acme/ship-by-sunday",
		});
		expect(
			buildVercelWebhookIncident({
				type: "deployment.ready",
				payload: {
					target: "production",
				},
			}),
		).toBeNull();
		expect(
			buildVercelWebhookIncident({
				type: "deployment.error",
				payload: {
					target: "preview",
					deployment: {
						id: "dpl_preview",
					},
				},
			}),
		).toBeNull();
		expect(
			buildVercelWebhookIncident({
				type: "deployment.canceled",
				payload: {
					target: "production",
					deployment: {
						id: "dpl_456",
					},
				},
			}),
		).toMatchObject({
			code: "vercel_deployment_canceled",
			externalEventId: "deployment.canceled:dpl_456",
			nextAction:
				"Check the Vercel deployment activity and confirm whether the production rollout was intentionally canceled.",
		});
		expect(() =>
			buildVercelWebhookIncident({
				type: "deployment.error",
			}),
		).toThrow("Missing payload.");
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

	it("renders Telegram messages with the incident stack when the payload fits", async () => {
		const { renderIncidentMessage } =
			await import("@/lib/observability/telegram/render-incident-message");
		const message = renderIncidentMessage({
			product: "ship-by-sunday",
			environment: "prod",
			source: "vercel",
			surface: "health",
			severity: "high",
			status: "firing",
			title: "Vercel build failed",
			summary: "Deploy failed while building the production app.",
			occurrenceCount: 3,
			firstSeenAt: 1_700_000_000_000,
			lastSeenAt: 1_700_000_300_000,
			requestId: "request_123",
			details: "deploy failed",
			stack: ["one", "two", "three", "four", "five", "six", "seven"].join("\n"),
		});

		expect(message).toContain("[Ship by Sunday][PROD][Vercel][high]");
		expect(message).toContain("request_id: request_123");
		expect(message).toContain("stack:");
		expect(message).toContain("one\ntwo\nthree\nfour\nfive\nsix");
	});

	it("truncates oversized Telegram incident payloads", async () => {
		const { renderIncidentMessage } =
			await import("@/lib/observability/telegram/render-incident-message");
		const message = renderIncidentMessage({
			product: "ship-by-sunday",
			environment: "prod",
			source: "vercel",
			surface: "health",
			severity: "high",
			status: "firing",
			title: "Vercel build failed",
			summary: "Deploy failed while building the production app.",
			occurrenceCount: 3,
			firstSeenAt: 1_700_000_000_000,
			lastSeenAt: 1_700_000_300_000,
			requestId: "request_123",
			details: "x".repeat(5_000),
			stack: ["one", "two", "three", "four", "five", "six", "seven"].join("\n"),
		});

		expect(message).toContain("[TRUNCATED]");
		expect(message.length).toBeLessThanOrEqual(3_900);
	});
});
