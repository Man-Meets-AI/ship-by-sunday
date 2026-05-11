import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const authMock = vi.fn();
const currentUserMock = vi.fn();
const createSessionMock = vi.fn();
const getAppBaseUrlMock = vi.fn();
const getStripeLineItemMock = vi.fn();
const getStripeCheckoutDiscountsMock = vi.fn();
const assertManagedStripePriceMatchesProductConfigMock = vi.fn();
const getStripeMock = vi.fn();
const getStripePublishableKeyMock = vi.fn();
const getStripeModeLabelMock = vi.fn();
const getStripeDashboardUrlMock = vi.fn();
const getStripeProductDashboardUrlMock = vi.fn();
const fetchActionMock = vi.fn();

vi.mock("convex/nextjs", () => ({
	fetchAction: fetchActionMock,
}));

vi.mock("@clerk/nextjs/server", () => ({
	auth: authMock,
	currentUser: currentUserMock,
}));

vi.mock("@/platform/billing/stripe", () => ({
	getStripe: getStripeMock,
	getStripePublishableKey: getStripePublishableKeyMock,
	getStripeLineItem: getStripeLineItemMock,
	getStripeCheckoutDiscounts: getStripeCheckoutDiscountsMock,
	assertManagedStripePriceMatchesProductConfig:
		assertManagedStripePriceMatchesProductConfigMock,
	getStripeModeLabel: getStripeModeLabelMock,
	getStripeDashboardUrl: getStripeDashboardUrlMock,
	getStripeProductDashboardUrl: getStripeProductDashboardUrlMock,
}));

vi.mock("@/platform/next/app-url", () => ({
	getAppBaseUrl: getAppBaseUrlMock,
}));

const hostedCheckoutMetadata = {
	metadataSchema: "mma_checkout_v1",
	app: "man_meets_ai",
	accessProduct: "paid_app_access",
	purchaseIntentId: "purchase_intent_123",
	checkoutSurface: "hosted_checkout",
} as const;

const expressCheckoutMetadata = {
	...hostedCheckoutMetadata,
	checkoutSurface: "express_checkout",
} as const;

function createAuthState(userId: string | null) {
	return {
		userId,
		getToken: vi.fn().mockResolvedValue(null),
	};
}

function createRequest(body?: unknown) {
	return new Request("https://example.com/api/stripe/checkout", {
		method: "POST",
		...(body
			? {
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(body),
				}
			: {}),
	});
}

describe("POST /api/stripe/checkout", () => {
	beforeEach(() => {
		authMock.mockReset();
		currentUserMock.mockReset();
		createSessionMock.mockReset();
		getAppBaseUrlMock.mockReset();
		getStripeLineItemMock.mockReset();
		getStripeCheckoutDiscountsMock.mockReset();
		assertManagedStripePriceMatchesProductConfigMock.mockReset();
		getStripeMock.mockReset();
		getStripePublishableKeyMock.mockReset();
		getStripeModeLabelMock.mockReset();
		getStripeDashboardUrlMock.mockReset();
		getStripeProductDashboardUrlMock.mockReset();
		fetchActionMock.mockReset();
		fetchActionMock.mockImplementation(
			async (_ref: unknown, args: Record<string, unknown>) => {
				if ("checkoutSurface" in args) {
					return { purchaseIntentId: hostedCheckoutMetadata.purchaseIntentId };
				}
				if ("purchaseIntentId" in args && "stripeCheckoutSessionId" in args) {
					return { attached: "attached" };
				}
				throw new Error(
					`Unexpected fetchMutation args: ${JSON.stringify(args)}`,
				);
			},
		);
		process.env.CHECKOUT_FULFILLMENT_RETRY_SECRET =
			"checkout_server_secret_123456789012345";
		getStripeModeLabelMock.mockReturnValue("test");
		getStripeDashboardUrlMock.mockImplementation((path?: string) =>
			path
				? `https://dashboard.stripe.com/test/${path}`
				: "https://dashboard.stripe.com/test",
		);
		getStripeProductDashboardUrlMock.mockReturnValue(
			"https://dashboard.stripe.com/test/products",
		);
		getStripePublishableKeyMock.mockReturnValue("pk_test_publishable");
		getStripeCheckoutDiscountsMock.mockReturnValue([
			{
				promotion_code: "promo_50_off",
			},
		]);
		vi.resetModules();
	});

	it("creates a guest checkout session when the viewer is signed out", async () => {
		authMock.mockResolvedValue(createAuthState(null));
		getAppBaseUrlMock.mockReturnValue("https://app.example.com");
		getStripeLineItemMock.mockReturnValue({
			price_data: {
				currency: "usd",
				product_data: { name: "Ship by Sunday" },
				unit_amount: 50000,
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
				metadata: hostedCheckoutMetadata,
				line_items: [
					{
						price_data: {
							currency: "usd",
							product_data: { name: "Ship by Sunday" },
							unit_amount: 50000,
						},
						quantity: 1,
					},
				],
				discounts: [{ promotion_code: "promo_50_off" }],
				payment_intent_data: {
					metadata: hostedCheckoutMetadata,
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

	it("creates a checkout session with account metadata and ignores request intent", async () => {
		authMock.mockResolvedValue(createAuthState("user_123"));
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
				billing_address_collection: "auto",
				cancel_url: "https://app.example.com/checkout/cancel",
				client_reference_id: "user_123",
				customer_email: "buyer@example.com",
				discounts: [{ promotion_code: "promo_50_off" }],
				line_items: [
					{
						price_data: {
							currency: "usd",
							product_data: { name: "Ship by Sunday" },
							unit_amount: 50000,
						},
						quantity: 1,
					},
				],
				metadata: {
					...hostedCheckoutMetadata,
					clerkUserId: "user_123",
				},
				mode: "payment",
				payment_intent_data: {
					metadata: {
						...hostedCheckoutMetadata,
						clerkUserId: "user_123",
					},
				},
				success_url:
					"https://app.example.com/checkout/success?session_id={CHECKOUT_SESSION_ID}",
			}),
		);
		expect(createSessionMock.mock.calls[0]?.[0]).not.toHaveProperty(
			"allow_promotion_codes",
		);
		expect(
			assertManagedStripePriceMatchesProductConfigMock,
		).toHaveBeenCalledWith(expect.anything());
	});

	it("returns a server error when Stripe does not return a checkout URL", async () => {
		authMock.mockResolvedValue(createAuthState("user_123"));
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
		authMock.mockResolvedValue(createAuthState("user_123"));
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
				"Configured Stripe price price_wrong_amount charges 25000 cents, expected 50000.",
			),
		);

		const { POST } = await import("../../app/api/stripe/checkout/route");

		const response = await POST(createRequest());

		expect(response.status).toBe(500);
		expect(createSessionMock).not.toHaveBeenCalled();
		const body = (await response.json()) as Record<string, unknown>;
		expect(body.error).toBe(
			"Configured Stripe price price_wrong_amount charges 25000 cents, expected 50000.",
		);
		expect(
			assertManagedStripePriceMatchesProductConfigMock,
		).toHaveBeenCalledWith(expect.anything());
	});

	it("creates an express checkout session with a client secret", async () => {
		authMock.mockResolvedValue(createAuthState("user_123"));
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
			client_secret: "cs_test_secret_123",
			id: "cs_express_123",
		});

		const { POST } =
			await import("../../app/api/stripe/checkout/express/route");

		const response = await POST(createRequest());

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			clientSecret: "cs_test_secret_123",
			publishableKey: "pk_test_publishable",
			returnUrl:
				"https://app.example.com/checkout/success?session_id=cs_express_123",
			sessionId: "cs_express_123",
		});
		expect(createSessionMock).toHaveBeenCalledWith(
			expect.objectContaining({
				billing_address_collection: "auto",
				client_reference_id: "user_123",
				customer_creation: "always",
				customer_email: "buyer@example.com",
				discounts: [{ promotion_code: "promo_50_off" }],
				mode: "payment",
				metadata: expect.objectContaining({
					...expressCheckoutMetadata,
					clerkUserId: "user_123",
				}),
				payment_intent_data: {
					metadata: expect.objectContaining({
						...expressCheckoutMetadata,
						clerkUserId: "user_123",
					}),
				},
				return_url:
					"https://app.example.com/checkout/success?session_id={CHECKOUT_SESSION_ID}",
				ui_mode: "custom",
			}),
		);
		expect(createSessionMock.mock.calls[0]?.[0]).not.toHaveProperty(
			"success_url",
		);
		expect(createSessionMock.mock.calls[0]?.[0]).not.toHaveProperty(
			"cancel_url",
		);
		expect(response.headers.get("set-cookie")).toContain(
			"sbs_pending_checkout_session=cs_express_123",
		);
	});
});
