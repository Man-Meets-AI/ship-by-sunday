import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
	fetchActionMock,
	fetchMutationMock,
	fetchQueryMock,
	getStripeMock,
	retrieveSessionMock,
} = vi.hoisted(() => ({
	fetchActionMock: vi.fn(),
	fetchMutationMock: vi.fn(),
	fetchQueryMock: vi.fn(),
	getStripeMock: vi.fn(),
	retrieveSessionMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("convex/nextjs", () => ({
	fetchAction: fetchActionMock,
	fetchMutation: fetchMutationMock,
	fetchQuery: fetchQueryMock,
}));

vi.mock("@/platform/billing/stripe", () => ({
	getStripe: getStripeMock,
}));

const checkoutMetadata = {
	metadataSchema: "mma_checkout_v1",
	app: "man_meets_ai",
	accessProduct: "paid_app_access",
	purchaseIntentId: "purchase_intent_123",
	offerId: "starter",
	checkoutSurface: "hosted_checkout",
	clerkUserId: "user_123",
};

function getMutationArgs(
	predicate: (args: Record<string, unknown>) => boolean,
) {
	return fetchMutationMock.mock.calls
		.map((call) => call[1] as Record<string, unknown>)
		.find(predicate);
}

const originalEnv = { ...process.env };

beforeEach(() => {
	process.env = {
		...originalEnv,
		CONVEX_WEBHOOK_MUTATION_SECRET: "convex_webhook_mutation_secret_1234567890",
		CHECKOUT_FULFILLMENT_RETRY_SECRET:
			"checkout_fulfillment_retry_secret_1234567890",
		STRIPE_SECRET_KEY: "sk_test_123",
	};
	fetchActionMock.mockReset();
	fetchMutationMock.mockReset();
	fetchQueryMock.mockReset();
	getStripeMock.mockReset();
	retrieveSessionMock.mockReset();
	getStripeMock.mockReturnValue({
		checkout: {
			sessions: {
				retrieve: retrieveSessionMock,
			},
		},
	});
	vi.resetModules();
});

afterEach(() => {
	process.env = { ...originalEnv };
});

describe("stripe billing sync", () => {
	it("uses checkout metadata owner before email fulfillment for webhook sync", async () => {
		retrieveSessionMock.mockResolvedValue({
			id: "cs_test_metadata_owner",
			client_reference_id: "user_123",
			created: 1_800_000_000,
			customer: "cus_123",
			customer_details: null,
			metadata: checkoutMetadata,
			payment_intent: {
				id: "pi_123",
				created: 1_800_000_001,
			},
			payment_status: "paid",
		});
		const { syncStripeWebhookEventToConvex } =
			await import("@/lib/billing/stripe-sync");

		await expect(
			syncStripeWebhookEventToConvex({
				id: "evt_checkout_completed",
				created: 1_800_000_100,
				type: "checkout.session.completed",
				data: {
					object: {
						id: "cs_test_metadata_owner",
					},
				},
			} as never),
		).resolves.toEqual({
			kind: "starter_synced",
			eventId: "evt_checkout_completed",
			sessionId: "cs_test_metadata_owner",
		});

		expect(fetchActionMock).not.toHaveBeenCalled();
		expect(getMutationArgs((args) => "purchasedAt" in args)).toEqual(
			expect.objectContaining({
				ownerClerkUserId: "user_123",
				stripeCheckoutSessionId: "cs_test_metadata_owner",
				stripeCustomerId: "cus_123",
				stripePaymentIntentId: "pi_123",
				purchasedAt: 1_800_000_100_000,
			}),
		);
		expect(getMutationArgs((args) => args.source === "stripe_webhook")).toEqual(
			expect.objectContaining({
				clerkUserId: "user_123",
				source: "stripe_webhook",
				stripeCheckoutSessionId: "cs_test_metadata_owner",
				stripeCustomerId: "cus_123",
				stripePaymentIntentId: "pi_123",
				checkoutPurchaseIntentId: "purchase_intent_123",
				offerId: "starter",
				buyerStartingPoint: "unspecified",
				checkoutCtaId: "unspecified",
				fulfillmentTrack: "unspecified",
			}),
		);
	});

	it("uses Stripe payment time for checkout-success billing sync", async () => {
		retrieveSessionMock.mockResolvedValue({
			id: "cs_test_success",
			client_reference_id: "user_123",
			created: 1_800_000_000,
			customer: "cus_123",
			customer_details: {
				email: "buyer@example.com",
			},
			metadata: checkoutMetadata,
			payment_intent: {
				id: "pi_123",
				created: 1_800_000_010,
			},
			payment_status: "paid",
		});
		const { syncStripeCheckoutSessionToConvex } =
			await import("@/lib/billing/stripe-sync");

		await expect(
			syncStripeCheckoutSessionToConvex({
				sessionId: "cs_test_success",
				source: "checkout_success",
			}),
		).resolves.toEqual({
			kind: "starter_synced",
			eventId: "checkout_success:cs_test_success",
			sessionId: "cs_test_success",
		});

		expect(fetchActionMock).not.toHaveBeenCalled();
		expect(getMutationArgs((args) => "purchasedAt" in args)).toEqual(
			expect.objectContaining({
				customerEmail: "buyer@example.com",
				ownerClerkUserId: "user_123",
				purchasedAt: 1_800_000_010_000,
				stripeCheckoutSessionId: "cs_test_success",
			}),
		);
	});
});

describe("getWorkersBillingCadenceFromStripePrice", () => {
	it("maps supported Stripe recurring intervals to Workers billing cadence", async () => {
		const { getWorkersBillingCadenceFromStripePrice } =
			await import("@/lib/billing/stripe-sync");

		expect(
			getWorkersBillingCadenceFromStripePrice({
				recurring: {
					interval: "month",
					interval_count: 1,
				},
			} as never),
		).toBe("monthly");
		expect(
			getWorkersBillingCadenceFromStripePrice({
				recurring: {
					interval: "month",
					interval_count: 3,
				},
			} as never),
		).toBe("quarterly");
		expect(
			getWorkersBillingCadenceFromStripePrice({
				recurring: {
					interval: "year",
					interval_count: 1,
				},
			} as never),
		).toBe("annual");
	});

	it("rejects one-time or unsupported Workers prices", async () => {
		const { getWorkersBillingCadenceFromStripePrice } =
			await import("@/lib/billing/stripe-sync");

		expect(() =>
			getWorkersBillingCadenceFromStripePrice({
				recurring: null,
			} as never),
		).toThrow("Workers subscription price must be recurring.");
		expect(() =>
			getWorkersBillingCadenceFromStripePrice({
				recurring: {
					interval: "week",
					interval_count: 1,
				},
			} as never),
		).toThrow("Unsupported Workers subscription cadence: 1 week.");
	});
});
