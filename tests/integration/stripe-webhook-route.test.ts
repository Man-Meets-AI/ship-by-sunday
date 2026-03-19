import { beforeEach, describe, expect, it, vi } from "vitest";

const constructEventMock = vi.fn();
const fetchMutationMock = vi.fn();
const requireServerEnvMock = vi.fn();
const stripeConstructorArgs: Array<Array<unknown>> = [];

class StripeMock {
	webhooks = {
		constructEvent: constructEventMock,
	};

	constructor(...args: Array<unknown>) {
		stripeConstructorArgs.push(args);
	}
}

const serverEnv = {
	STRIPE_SECRET_KEY: "sk_test_123",
	STRIPE_WEBHOOK_SECRET: "whsec_test_123",
};

vi.mock("stripe", () => ({
	default: StripeMock,
}));

vi.mock("convex/nextjs", () => ({
	fetchMutation: fetchMutationMock,
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		course: {
			grantEntitlementFromStripe: "grantEntitlementFromStripe",
		},
	},
}));

vi.mock("@/platform/env/server", () => ({
	requireServerEnv: requireServerEnvMock,
	serverEnv,
}));

function createWebhookRequest() {
	return new Request("https://example.com/api/stripe/webhook", {
		method: "POST",
		headers: {
			"stripe-signature": "t=1,v1=signature",
		},
		body: "raw-webhook-body",
	});
}

function createCheckoutSession(overrides: Record<string, unknown> = {}) {
	return {
		id: "cs_test_123",
		client_reference_id: "user_123",
		metadata: {
			clerkUserId: "user_123",
			courseSlug: "ship-by-sunday",
		},
		customer: "cus_123",
		payment_intent: "pi_123",
		...overrides,
	};
}

describe("POST /api/stripe/webhook", () => {
	beforeEach(() => {
		constructEventMock.mockReset();
		fetchMutationMock.mockReset();
		requireServerEnvMock.mockReset();
		stripeConstructorArgs.length = 0;
		serverEnv.STRIPE_SECRET_KEY = "sk_test_123";
		serverEnv.STRIPE_WEBHOOK_SECRET = "whsec_test_123";
		requireServerEnvMock.mockImplementation((key: string) => {
			const value = serverEnv[key as keyof typeof serverEnv];
			if (!value) {
				throw new Error(`Missing required environment variable: ${key}`);
			}

			return value;
		});
		vi.resetModules();
	});

	it("rejects the request when webhook configuration is incomplete", async () => {
		serverEnv.STRIPE_WEBHOOK_SECRET = "";

		const warnMock = vi.spyOn(console, "error").mockImplementation(() => {});
		const { POST } = await import("../../app/api/stripe/webhook/route");

		const response = await POST(createWebhookRequest());

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			error: "Missing Stripe webhook configuration.",
		});
		expect(constructEventMock).not.toHaveBeenCalled();
		expect(fetchMutationMock).not.toHaveBeenCalled();
		warnMock.mockRestore();
	});

	it("rejects an invalid Stripe signature before mutating access", async () => {
		constructEventMock.mockImplementation(() => {
			throw new Error("Signature verification failed");
		});

		vi.spyOn(console, "error").mockImplementation(() => {});
		const { POST } = await import("../../app/api/stripe/webhook/route");

		const response = await POST(createWebhookRequest());

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			error: "Invalid signature.",
		});
		expect(fetchMutationMock).not.toHaveBeenCalled();
		expect(stripeConstructorArgs).toEqual([
			[
				"sk_test_123",
				{
					apiVersion: "2026-02-25.clover",
				},
			],
		]);
	});

	it("ignores unrelated webhook events", async () => {
		constructEventMock.mockReturnValue({
			id: "evt_ignored",
			type: "customer.subscription.updated",
			data: {
				object: {},
			},
		});

		const infoMock = vi.spyOn(console, "info").mockImplementation(() => {});
		const { POST } = await import("../../app/api/stripe/webhook/route");

		const response = await POST(createWebhookRequest());

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			ignored: true,
		});
		expect(fetchMutationMock).not.toHaveBeenCalled();
		infoMock.mockRestore();
	});

	it("returns 400 when Stripe does not include a clerk user reference", async () => {
		constructEventMock.mockReturnValue({
			id: "evt_no_user",
			type: "checkout.session.completed",
			data: {
				object: createCheckoutSession({
					client_reference_id: null,
					metadata: {},
				}),
			},
		});

		vi.spyOn(console, "error").mockImplementation(() => {});
		const { POST } = await import("../../app/api/stripe/webhook/route");

		const response = await POST(createWebhookRequest());

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			error: "Missing clerk user reference.",
		});
		expect(fetchMutationMock).not.toHaveBeenCalled();
	});

	it.each([
		"checkout.session.completed",
		"checkout.session.async_payment_succeeded",
	] as const)("grants entitlement for %s events", async (eventType) => {
		constructEventMock.mockReturnValue({
			id: "evt_grant",
			type: eventType,
			data: {
				object: createCheckoutSession(),
			},
		});
		fetchMutationMock.mockResolvedValue({
			mode: "inserted",
			courseSlug: "ship-by-sunday",
		});

		const infoMock = vi.spyOn(console, "info").mockImplementation(() => {});
		const { POST } = await import("../../app/api/stripe/webhook/route");

		const response = await POST(createWebhookRequest());

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			received: true,
		});
		expect(requireServerEnvMock).toHaveBeenCalledWith("STRIPE_SECRET_KEY");
		expect(stripeConstructorArgs).toEqual([
			[
				"sk_test_123",
				{
					apiVersion: "2026-02-25.clover",
				},
			],
		]);
		expect(fetchMutationMock).toHaveBeenCalledWith(
			"grantEntitlementFromStripe",
			expect.objectContaining({
				clerkUserId: "user_123",
				courseSlug: "ship-by-sunday",
				stripeCheckoutSessionId: "cs_test_123",
				stripeCustomerId: "cus_123",
				stripePaymentIntentId: "pi_123",
				webhookSecret: "whsec_test_123",
			}),
		);
		infoMock.mockRestore();
	});

	it("returns 500 when entitlement persistence fails", async () => {
		constructEventMock.mockReturnValue({
			id: "evt_failure",
			type: "checkout.session.completed",
			data: {
				object: createCheckoutSession(),
			},
		});
		fetchMutationMock.mockRejectedValue(new Error("convex unavailable"));

		vi.spyOn(console, "error").mockImplementation(() => {});
		const { POST } = await import("../../app/api/stripe/webhook/route");

		const response = await POST(createWebhookRequest());

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			error: "Unable to grant entitlement.",
		});
	});
});
