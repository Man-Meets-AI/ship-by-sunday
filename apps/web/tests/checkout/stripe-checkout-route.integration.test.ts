import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const currentUserMock = vi.fn();
const createSessionMock = vi.fn();
const getAppBaseUrlMock = vi.fn();
const getStripeLineItemMock = vi.fn();
const assertManagedStripePriceMatchesProductConfigMock = vi.fn();
const getStripeMock = vi.fn();
const getStripeModeLabelMock = vi.fn();
const getStripeDashboardUrlMock = vi.fn();
const getStripeProductDashboardUrlMock = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
	auth: authMock,
	currentUser: currentUserMock,
}));

vi.mock("@/platform/billing/stripe", () => ({
	getStripe: getStripeMock,
	getStripeLineItem: getStripeLineItemMock,
	assertManagedStripePriceMatchesProductConfig:
		assertManagedStripePriceMatchesProductConfigMock,
	getStripeModeLabel: getStripeModeLabelMock,
	getStripeDashboardUrl: getStripeDashboardUrlMock,
	getStripeProductDashboardUrl: getStripeProductDashboardUrlMock,
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
		assertManagedStripePriceMatchesProductConfigMock.mockReset();
		getStripeMock.mockReset();
		getStripeModeLabelMock.mockReset();
		getStripeDashboardUrlMock.mockReset();
		getStripeProductDashboardUrlMock.mockReset();
		getStripeModeLabelMock.mockReturnValue("test");
		getStripeDashboardUrlMock.mockImplementation((path?: string) =>
			path
				? `https://dashboard.stripe.com/test/${path}`
				: "https://dashboard.stripe.com/test",
		);
		getStripeProductDashboardUrlMock.mockReturnValue(
			"https://dashboard.stripe.com/test/products",
		);
		vi.resetModules();
	});

	it("creates a guest checkout session when the viewer is signed out", async () => {
		authMock.mockResolvedValue({ userId: null });
		getAppBaseUrlMock.mockReturnValue("https://app.example.com");
		getStripeLineItemMock.mockReturnValue({
			price_data: {
				currency: "usd",
				product_data: { name: "Ship by Sunday" },
				unit_amount: 25000,
			},
			quantity: 1,
		});
		assertManagedStripePriceMatchesProductConfigMock.mockResolvedValue(
			undefined,
		);
		getStripeMock.mockReturnValue({
			checkout: {
				sessions: {
					create: createSessionMock,
				},
			},
		});
		createSessionMock.mockResolvedValue({
			id: "cs_guest_123",
			url: "https://checkout.stripe.com/pay/cs_guest_123",
		});

		const { POST } = await import("../../app/api/stripe/checkout/route");

		const response = await POST(createRequest());

		expect(response.status).toBe(200);
		expect(response.headers.get("x-request-id")).toBeTruthy();
		expect(await response.json()).toEqual({
			sessionId: "cs_guest_123",
			url: "https://checkout.stripe.com/pay/cs_guest_123",
		});
		expect(currentUserMock).not.toHaveBeenCalled();
		expect(createSessionMock).toHaveBeenCalledWith(
			expect.objectContaining({
				client_reference_id: undefined,
				customer_email: undefined,
				metadata: {
					courseSlug: "ship-by-sunday",
				},
				line_items: [
					{
						price_data: {
							currency: "usd",
							product_data: { name: "Ship by Sunday" },
							unit_amount: 25000,
						},
						quantity: 1,
					},
				],
				payment_intent_data: {
					metadata: {
						courseSlug: "ship-by-sunday",
					},
				},
			}),
		);
		expect(
			assertManagedStripePriceMatchesProductConfigMock,
		).toHaveBeenCalledWith(expect.anything());
		expect(response.headers.get("set-cookie")).toContain(
			"sbs_pending_checkout_session=cs_guest_123",
		);
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
				unit_amount: 25000,
			},
			quantity: 1,
		});
		assertManagedStripePriceMatchesProductConfigMock.mockResolvedValue(
			undefined,
		);
		getStripeMock.mockReturnValue({
			checkout: {
				sessions: {
					create: createSessionMock,
				},
			},
		});
		createSessionMock.mockResolvedValue({
			id: "cs_test_123",
			url: "https://checkout.stripe.com/pay/cs_test_123",
		});

		const { POST } = await import("../../app/api/stripe/checkout/route");

		const response = await POST(createRequest());

		expect(response.status).toBe(200);
		expect(response.headers.get("x-request-id")).toBeTruthy();
		expect(await response.json()).toEqual({
			sessionId: "cs_test_123",
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
					{
						price_data: {
							currency: "usd",
							product_data: { name: "Ship by Sunday" },
							unit_amount: 25000,
						},
						quantity: 1,
					},
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
		expect(
			assertManagedStripePriceMatchesProductConfigMock,
		).toHaveBeenCalledWith(expect.anything());
	});

	it("returns a server error when Stripe does not return a checkout URL", async () => {
		authMock.mockResolvedValue({ userId: "user_123" });
		currentUserMock.mockResolvedValue(null);
		getAppBaseUrlMock.mockReturnValue("https://app.example.com");
		getStripeLineItemMock.mockReturnValue({
			price_data: {
				currency: "usd",
				product_data: { name: "Ship by Sunday" },
				unit_amount: 25000,
			},
			quantity: 1,
		});
		assertManagedStripePriceMatchesProductConfigMock.mockResolvedValue(
			undefined,
		);
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
		expect(response.headers.get("x-request-id")).toBeTruthy();
		const body = (await response.json()) as Record<string, unknown>;
		expect(body).toMatchObject({
			error: "Stripe did not return a checkout URL.",
		});
		expect(body.requestId).toBeTruthy();
		expect(
			assertManagedStripePriceMatchesProductConfigMock,
		).toHaveBeenCalledWith(expect.anything());
	});

	it("returns a server error when the managed Stripe price fails validation", async () => {
		authMock.mockResolvedValue({ userId: "user_123" });
		currentUserMock.mockResolvedValue({
			primaryEmailAddress: {
				emailAddress: "buyer@example.com",
			},
		});
		getAppBaseUrlMock.mockReturnValue("https://app.example.com");
		getStripeLineItemMock.mockReturnValue({
			price: "price_wrong_amount",
			quantity: 1,
		});
		getStripeMock.mockReturnValue({
			checkout: {
				sessions: {
					create: createSessionMock,
				},
			},
		});
		assertManagedStripePriceMatchesProductConfigMock.mockRejectedValue(
			new Error(
				"Configured Stripe price price_wrong_amount charges 50000 cents, expected 25000.",
			),
		);

		const { POST } = await import("../../app/api/stripe/checkout/route");

		const response = await POST(createRequest());

		expect(response.status).toBe(500);
		expect(createSessionMock).not.toHaveBeenCalled();
		const body = (await response.json()) as Record<string, unknown>;
		expect(body.error).toBe(
			"Configured Stripe price price_wrong_amount charges 50000 cents, expected 25000.",
		);
		expect(
			assertManagedStripePriceMatchesProductConfigMock,
		).toHaveBeenCalledWith(expect.anything());
	});
});
