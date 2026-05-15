import { beforeEach, describe, expect, it, vi } from "vitest";

const {
	constructEventMock,
	getStripeMock,
	syncStripeWebhookEventToConvexMock,
} = vi.hoisted(() => ({
	constructEventMock: vi.fn(),
	getStripeMock: vi.fn(),
	syncStripeWebhookEventToConvexMock: vi.fn(),
}));

vi.mock("@/platform/billing/stripe", () => ({
	getStripe: getStripeMock,
}));

vi.mock("@/lib/billing/stripe-sync", () => ({
	syncStripeWebhookEventToConvex: syncStripeWebhookEventToConvexMock,
}));

vi.mock("server-only", () => ({}));

function createStripeWebhookRequest({
	body = "{}",
	signature = "t=1,v1=signature",
}: {
	body?: string;
	signature?: string | null;
} = {}) {
	const headers = new Headers();
	if (signature) {
		headers.set("stripe-signature", signature);
	}

	return new Request("https://app.example.com/api/stripe/webhook", {
		method: "POST",
		headers,
		body,
	});
}

describe("POST /api/stripe/webhook", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = {
			...originalEnv,
			STRIPE_WEBHOOK_SECRET: "whsec_test_123",
		};
		constructEventMock.mockReset();
		getStripeMock.mockReset();
		syncStripeWebhookEventToConvexMock.mockReset();
		getStripeMock.mockReturnValue({
			webhooks: {
				constructEvent: constructEventMock,
			},
		});
		syncStripeWebhookEventToConvexMock.mockResolvedValue({
			kind: "workers_synced",
			eventId: "evt_123",
			stripeSubscriptionId: "sub_123",
		});
		vi.resetModules();
	});

	it("rejects requests without a Stripe signature before sync starts", async () => {
		const { POST } = await import("../../src/app/api/stripe/webhook/route");

		const response = await POST(
			createStripeWebhookRequest({ signature: null }),
		);

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			error: "Missing Stripe signature.",
		});
		expect(constructEventMock).not.toHaveBeenCalled();
		expect(syncStripeWebhookEventToConvexMock).not.toHaveBeenCalled();
	});

	it("rejects invalid Stripe signatures before sync starts", async () => {
		constructEventMock.mockImplementation(() => {
			throw new Error("bad signature");
		});
		const { POST } = await import("../../src/app/api/stripe/webhook/route");

		const response = await POST(createStripeWebhookRequest());

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			error: "Invalid Stripe signature.",
		});
		expect(syncStripeWebhookEventToConvexMock).not.toHaveBeenCalled();
	});

	it("syncs verified Stripe events to Convex", async () => {
		const event = {
			id: "evt_123",
			type: "customer.subscription.updated",
		};
		constructEventMock.mockReturnValue(event);
		const { POST } = await import("../../src/app/api/stripe/webhook/route");

		const response = await POST(
			createStripeWebhookRequest({ body: '{"id":"evt_123"}' }),
		);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			received: true,
			result: "workers_synced",
		});
		expect(constructEventMock).toHaveBeenCalledWith(
			'{"id":"evt_123"}',
			"t=1,v1=signature",
			"whsec_test_123",
		);
		expect(syncStripeWebhookEventToConvexMock).toHaveBeenCalledWith(event);
	});

	it("returns a retryable failure when Convex sync fails", async () => {
		constructEventMock.mockReturnValue({
			id: "evt_123",
			type: "customer.subscription.updated",
		});
		syncStripeWebhookEventToConvexMock.mockRejectedValue(
			new Error("Convex unavailable"),
		);
		const { POST } = await import("../../src/app/api/stripe/webhook/route");

		const response = await POST(createStripeWebhookRequest());

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			error: "Unable to sync Stripe billing event.",
		});
	});
});
