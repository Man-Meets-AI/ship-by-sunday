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
const fetchMutationMock = vi.fn();
const fetchQueryMock = vi.fn();
const getRateLimitedResponseMock = vi.fn();
const recordBlockedSupportModeActionForRequestMock = vi.fn();

vi.mock("convex/nextjs", () => ({
	fetchAction: fetchActionMock,
	fetchMutation: fetchMutationMock,
	fetchQuery: fetchQueryMock,
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

vi.mock("@/app/api/_lib/request-rate-limit", () => ({
	getRateLimitedResponse: getRateLimitedResponseMock,
}));

vi.mock("@/platform/admin-impersonation/route-policy", () => ({
	recordBlockedSupportModeActionForRequest:
		recordBlockedSupportModeActionForRequestMock,
}));

const hostedCheckoutMetadata = {
	metadataSchema: "mma_checkout_v1",
	app: "man_meets_ai",
	accessProduct: "paid_app_access",
	purchaseIntentId: "purchase_intent_123",
	offerId: "starter",
	checkoutSurface: "hosted_checkout",
} as const;

const expressCheckoutMetadata = {
	...hostedCheckoutMetadata,
	checkoutSurface: "express_checkout",
} as const;

function createAuthState(userId: string | null, token: string | null = null) {
	return {
		userId,
		getToken: vi.fn().mockResolvedValue(token),
	};
}

function createRequest(body: unknown = { offerId: "starter" }) {
	return new Request("https://example.com/api/stripe/checkout", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
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
		fetchMutationMock.mockReset();
		fetchQueryMock.mockReset();
		getRateLimitedResponseMock.mockReset();
		recordBlockedSupportModeActionForRequestMock.mockReset();
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
		fetchQueryMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: false,
			status: "no_access",
			capabilities: [],
		});
		fetchMutationMock.mockResolvedValue({ kind: "not_impersonating" });
		getRateLimitedResponseMock.mockReturnValue(null);
		recordBlockedSupportModeActionForRequestMock.mockResolvedValue(false);
		process.env.CHECKOUT_FULFILLMENT_RETRY_SECRET =
			"checkout_server_secret_123456789012345";
		process.env.CLERK_SECRET_KEY = "clerk_secret_for_route_audit_tests";
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
		getStripeCheckoutDiscountsMock.mockReturnValue(undefined);
		vi.resetModules();
	});

	it("rejects missing or unsupported checkout offers before touching Stripe", async () => {
		authMock.mockResolvedValue(createAuthState(null));
		getAppBaseUrlMock.mockReturnValue("https://app.example.com");

		const { POST } = await import("../../src/app/api/stripe/checkout/route");

		const response = await POST(createRequest({ offerId: "pro" }));

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			error: "A valid checkout offer is required.",
			requestId: expect.any(String),
		});
		expect(getRateLimitedResponseMock).not.toHaveBeenCalled();
		expect(recordBlockedSupportModeActionForRequestMock).not.toHaveBeenCalled();
		expect(getStripeMock).not.toHaveBeenCalled();
		expect(createSessionMock).not.toHaveBeenCalled();
	});

	it("rejects malformed checkout offer payloads before touching Stripe", async () => {
		authMock.mockResolvedValue(createAuthState(null));
		getAppBaseUrlMock.mockReturnValue("https://app.example.com");

		const { POST } = await import("../../src/app/api/stripe/checkout/route");

		const response = await POST(
			new Request("https://example.com/api/stripe/checkout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: "{",
			}),
		);

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			error: "A valid checkout offer is required.",
			requestId: expect.any(String),
		});
		expect(getRateLimitedResponseMock).not.toHaveBeenCalled();
		expect(recordBlockedSupportModeActionForRequestMock).not.toHaveBeenCalled();
		expect(getStripeMock).not.toHaveBeenCalled();
		expect(createSessionMock).not.toHaveBeenCalled();
	});

	it("returns the rate-limit response before support-mode or Stripe work", async () => {
		authMock.mockResolvedValue(createAuthState("user_123"));
		getAppBaseUrlMock.mockReturnValue("https://app.example.com");
		const rateLimitedResponse = Response.json(
			{ error: "Too many checkout attempts." },
			{ status: 429 },
		);
		getRateLimitedResponseMock.mockReturnValue(rateLimitedResponse);

		const { POST } = await import("../../src/app/api/stripe/checkout/route");

		const response = await POST(createRequest());

		expect(response).toBe(rateLimitedResponse);
		expect(response.status).toBe(429);
		expect(recordBlockedSupportModeActionForRequestMock).not.toHaveBeenCalled();
		expect(getStripeMock).not.toHaveBeenCalled();
		expect(createSessionMock).not.toHaveBeenCalled();
	});

	it("blocks checkout while support mode is active", async () => {
		authMock.mockResolvedValue(createAuthState("user_123"));
		getAppBaseUrlMock.mockReturnValue("https://app.example.com");
		recordBlockedSupportModeActionForRequestMock.mockResolvedValue(true);

		const { POST } = await import("../../src/app/api/stripe/checkout/route");

		const response = await POST(createRequest());

		expect(response.status).toBe(403);
		expect(await response.json()).toEqual({
			error: "Checkout is unavailable during support mode.",
			requestId: expect.any(String),
		});
		expect(recordBlockedSupportModeActionForRequestMock).toHaveBeenCalledWith(
			expect.any(Request),
			{
				actionId: "stripe.checkout.createSession",
				blockReason: "billing_action_blocked",
			},
		);
		expect(getStripeMock).not.toHaveBeenCalled();
		expect(createSessionMock).not.toHaveBeenCalled();
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

		const { POST } = await import("../../src/app/api/stripe/checkout/route");

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
				allow_promotion_codes: true,
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
				payment_intent_data: {
					metadata: hostedCheckoutMetadata,
				},
			}),
		);
		expect(getStripeLineItemMock).toHaveBeenCalledWith("starter");
		expect(
			assertManagedStripePriceMatchesProductConfigMock,
		).toHaveBeenCalledWith(expect.anything(), "starter");
		expect(response.headers.get("set-cookie")).toContain(
			"sbs_pending_checkout_session=cs_guest_123",
		);
	});

	it("creates a Workers guest checkout session with Workers metadata", async () => {
		authMock.mockResolvedValue(createAuthState(null));
		getAppBaseUrlMock.mockReturnValue("https://app.example.com");
		getStripeLineItemMock.mockReturnValue({
			price_data: {
				currency: "usd",
				product_data: { name: "Ship by Sunday Workers" },
				unit_amount: 60000,
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
			id: "cs_workers_guest_123",
			url: "https://checkout.stripe.com/pay/cs_workers_guest_123",
		});

		const { POST } = await import("../../src/app/api/stripe/checkout/route");

		const response = await POST(createRequest({ offerId: "workers" }));
		const workersMetadata = {
			...hostedCheckoutMetadata,
			offerId: "workers",
		};

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			sessionId: "cs_workers_guest_123",
			url: "https://checkout.stripe.com/pay/cs_workers_guest_123",
		});
		expect(createSessionMock).toHaveBeenCalledWith(
			expect.objectContaining({
				client_reference_id: undefined,
				customer_email: undefined,
				mode: "subscription",
				metadata: workersMetadata,
				line_items: [
					{
						price_data: {
							currency: "usd",
							product_data: { name: "Ship by Sunday Workers" },
							recurring: {
								interval: "month",
							},
							unit_amount: 60000,
						},
						quantity: 1,
					},
				],
				subscription_data: {
					metadata: workersMetadata,
				},
			}),
		);
		expect(createSessionMock.mock.calls[0]?.[0]).not.toHaveProperty(
			"customer_creation",
		);
		expect(createSessionMock.mock.calls[0]?.[0]).not.toHaveProperty(
			"payment_intent_data",
		);
		expect(getStripeLineItemMock).toHaveBeenCalledWith("workers");
		expect(
			assertManagedStripePriceMatchesProductConfigMock,
		).toHaveBeenCalledWith(expect.anything(), "workers");
		expect(response.headers.get("set-cookie")).toContain(
			"sbs_pending_checkout_session=cs_workers_guest_123",
		);
	});

	it("blocks Workers checkout when the signed-in account already has Workers access", async () => {
		authMock.mockResolvedValue(createAuthState("user_123", "convex_token"));
		getAppBaseUrlMock.mockReturnValue("https://app.example.com");
		fetchQueryMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: true,
			status: "granted",
			capabilities: ["worker"],
		});

		const { POST } = await import("../../src/app/api/stripe/checkout/route");

		const response = await POST(createRequest({ offerId: "workers" }));

		expect(response.status).toBe(409);
		expect(await response.json()).toEqual({
			error: "Workers access is already active for this account.",
			requestId: expect.any(String),
		});
		expect(fetchQueryMock).toHaveBeenCalledWith(
			expect.anything(),
			{},
			{ token: "convex_token" },
		);
		expect(currentUserMock).not.toHaveBeenCalled();
		expect(getStripeMock).not.toHaveBeenCalled();
		expect(createSessionMock).not.toHaveBeenCalled();
		expect(fetchActionMock).not.toHaveBeenCalled();
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

		const { POST } = await import("../../src/app/api/stripe/checkout/route");

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
				allow_promotion_codes: true,
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
			"discounts",
		);
		expect(getStripeLineItemMock).toHaveBeenCalledWith("starter");
		expect(
			assertManagedStripePriceMatchesProductConfigMock,
		).toHaveBeenCalledWith(expect.anything(), "starter");
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

		const { POST } = await import("../../src/app/api/stripe/checkout/route");

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
		).toHaveBeenCalledWith(expect.anything(), "starter");
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

		const { POST } = await import("../../src/app/api/stripe/checkout/route");

		const response = await POST(createRequest());

		expect(response.status).toBe(500);
		expect(createSessionMock).not.toHaveBeenCalled();
		const body = (await response.json()) as Record<string, unknown>;
		expect(body.error).toBe(
			"Configured Stripe price price_wrong_amount charges 25000 cents, expected 50000.",
		);
		expect(
			assertManagedStripePriceMatchesProductConfigMock,
		).toHaveBeenCalledWith(expect.anything(), "starter");
	});

	it("blocks express Workers checkout when the signed-in account already has Workers access", async () => {
		authMock.mockResolvedValue(createAuthState("user_123", "convex_token"));
		getAppBaseUrlMock.mockReturnValue("https://app.example.com");
		fetchQueryMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: true,
			status: "granted",
			capabilities: ["worker"],
		});

		const { POST } =
			await import("../../src/app/api/stripe/checkout/express/route");

		const response = await POST(createRequest({ offerId: "workers" }));

		expect(response.status).toBe(409);
		expect(await response.json()).toEqual({
			error: "Workers access is already active for this account.",
			requestId: expect.any(String),
		});
		expect(fetchQueryMock).toHaveBeenCalledWith(
			expect.anything(),
			{},
			{ token: "convex_token" },
		);
		expect(currentUserMock).not.toHaveBeenCalled();
		expect(getStripeMock).not.toHaveBeenCalled();
		expect(createSessionMock).not.toHaveBeenCalled();
		expect(fetchActionMock).not.toHaveBeenCalled();
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
			await import("../../src/app/api/stripe/checkout/express/route");

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
				allow_promotion_codes: true,
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
