import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const currentUserMock = vi.fn();
const createSessionMock = vi.fn();
const getAppBaseUrlMock = vi.fn();
const getStripeLineItemMock = vi.fn();
const getStripeMock = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
	auth: authMock,
	currentUser: currentUserMock,
}));

vi.mock("@/platform/billing/stripe", () => ({
	getStripe: getStripeMock,
	getStripeLineItem: getStripeLineItemMock,
}));

vi.mock("@/platform/next/app-url", () => ({
	getAppBaseUrl: getAppBaseUrlMock,
}));

function createRequest() {
	return new Request("https://example.com/api/stripe/checkout", {
		method: "POST",
	});
}

describe("POST /api/stripe/checkout", () => {
	beforeEach(() => {
		authMock.mockReset();
		currentUserMock.mockReset();
		createSessionMock.mockReset();
		getAppBaseUrlMock.mockReset();
		getStripeLineItemMock.mockReset();
		getStripeMock.mockReset();
		vi.resetModules();
	});

	it("returns 401 before touching Stripe when the viewer is signed out", async () => {
		authMock.mockResolvedValue({ userId: null });

		const { POST } = await import("../../app/api/stripe/checkout/route");

		const response = await POST(createRequest());

		expect(response.status).toBe(401);
		expect(await response.json()).toEqual({
			error: "Sign in before starting checkout.",
		});
		expect(currentUserMock).not.toHaveBeenCalled();
		expect(getStripeMock).not.toHaveBeenCalled();
		expect(createSessionMock).not.toHaveBeenCalled();
	});

	it("creates a checkout session with the buyer/access handoff metadata", async () => {
		authMock.mockResolvedValue({ userId: "user_123" });
		currentUserMock.mockResolvedValue({
			primaryEmailAddress: {
				emailAddress: "buyer@example.com",
			},
		});
		getAppBaseUrlMock.mockReturnValue("https://app.example.com");
		getStripeLineItemMock.mockReturnValue({
			price_data: {
				currency: "usd",
				product_data: { name: "Ship by Sunday" },
				unit_amount: 50000,
			},
			quantity: 1,
		});
		getStripeMock.mockReturnValue({
			checkout: {
				sessions: {
					create: createSessionMock,
				},
			},
		});
		createSessionMock.mockResolvedValue({
			url: "https://checkout.stripe.com/pay/cs_test_123",
		});

		const { POST } = await import("../../app/api/stripe/checkout/route");

		const response = await POST(createRequest());

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			url: "https://checkout.stripe.com/pay/cs_test_123",
		});
		expect(getStripeLineItemMock).toHaveBeenCalledTimes(1);
		expect(createSessionMock).toHaveBeenCalledWith(
			expect.objectContaining({
				allow_promotion_codes: true,
				billing_address_collection: "auto",
				cancel_url: "https://app.example.com/checkout/cancel",
				client_reference_id: "user_123",
				customer_email: "buyer@example.com",
				line_items: [
					expect.objectContaining({
						quantity: 1,
					}),
				],
				metadata: {
					clerkUserId: "user_123",
					courseSlug: "ship-by-sunday",
				},
				mode: "payment",
				payment_intent_data: {
					metadata: {
						clerkUserId: "user_123",
						courseSlug: "ship-by-sunday",
					},
				},
				success_url:
					"https://app.example.com/checkout/success?session_id={CHECKOUT_SESSION_ID}",
			}),
		);
	});

	it("returns a server error when Stripe does not return a checkout URL", async () => {
		authMock.mockResolvedValue({ userId: "user_123" });
		currentUserMock.mockResolvedValue(null);
		getAppBaseUrlMock.mockReturnValue("https://app.example.com");
		getStripeLineItemMock.mockReturnValue({
			price_data: {
				currency: "usd",
				product_data: { name: "Ship by Sunday" },
				unit_amount: 50000,
			},
			quantity: 1,
		});
		getStripeMock.mockReturnValue({
			checkout: {
				sessions: {
					create: createSessionMock,
				},
			},
		});
		createSessionMock.mockResolvedValue({ url: null });

		const { POST } = await import("../../app/api/stripe/checkout/route");

		const response = await POST(createRequest());

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			error: "Stripe did not return a checkout URL.",
		});
	});
});
