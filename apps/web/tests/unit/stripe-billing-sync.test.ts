import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
	fetchActionMock,
	fetchMutationMock,
	fetchQueryMock,
	getStripeMock,
	retrieveSessionMock,
	retrieveSubscriptionMock,
} = vi.hoisted(() => ({
	fetchActionMock: vi.fn(),
	fetchMutationMock: vi.fn(),
	fetchQueryMock: vi.fn(),
	getStripeMock: vi.fn(),
	retrieveSessionMock: vi.fn(),
	retrieveSubscriptionMock: vi.fn(),
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
		STRIPE_WORKERS_PRICE_ID: "price_workers_monthly",
		STRIPE_WORKERS_PRODUCT_ID: "prod_workers",
	};
	fetchActionMock.mockReset();
	fetchMutationMock.mockReset();
	fetchQueryMock.mockReset();
	getStripeMock.mockReset();
	retrieveSessionMock.mockReset();
	retrieveSubscriptionMock.mockReset();
	getStripeMock.mockReturnValue({
		checkout: {
			sessions: {
				retrieve: retrieveSessionMock,
			},
		},
		subscriptions: {
			retrieve: retrieveSubscriptionMock,
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

	it("syncs legacy paid app checkout metadata without an offer as Starter", async () => {
		retrieveSessionMock.mockResolvedValue({
			id: "cs_test_legacy_starter",
			client_reference_id: null,
			created: 1_800_000_000,
			customer: "cus_legacy_starter",
			customer_details: {
				email: "legacy@example.com",
			},
			metadata: {
				courseSlug: "ship-by-sunday",
				clerkUserId: "user_legacy_starter",
			},
			payment_intent: {
				id: "pi_legacy_starter",
				created: 1_800_000_002,
			},
			payment_status: "paid",
		});
		const { syncStripeWebhookEventToConvex } =
			await import("@/lib/billing/stripe-sync");

		await expect(
			syncStripeWebhookEventToConvex({
				id: "evt_legacy_checkout_completed",
				created: 1_800_000_100,
				type: "checkout.session.completed",
				data: {
					object: {
						id: "cs_test_legacy_starter",
					},
				},
			} as never),
		).resolves.toEqual({
			kind: "starter_synced",
			eventId: "evt_legacy_checkout_completed",
			sessionId: "cs_test_legacy_starter",
		});

		expect(fetchActionMock).not.toHaveBeenCalled();
		expect(getMutationArgs((args) => args.source === "stripe_webhook")).toEqual(
			expect.objectContaining({
				clerkUserId: "user_legacy_starter",
				source: "stripe_webhook",
				stripeCheckoutSessionId: "cs_test_legacy_starter",
				stripeCustomerId: "cus_legacy_starter",
				stripePaymentIntentId: "pi_legacy_starter",
				offerId: "starter",
			}),
		);
	});

	it("syncs legacy Workers checkout metadata through the checkout session subscription", async () => {
		retrieveSessionMock.mockResolvedValue({
			id: "cs_test_legacy_workers",
			client_reference_id: null,
			created: 1_800_000_000,
			customer: "cus_legacy_workers",
			customer_details: {
				email: "workers@example.com",
			},
			metadata: {
				courseSlug: "ship-by-sunday",
				clerkUserId: "user_legacy_workers",
				fulfillmentTrack: "existing_codebase_doctor",
			},
			payment_intent: null,
			payment_status: "paid",
			subscription: "sub_legacy_workers",
		});
		retrieveSubscriptionMock.mockResolvedValue({
			id: "sub_legacy_workers",
			customer: "cus_legacy_workers",
			metadata: {},
			status: "active",
			cancel_at_period_end: false,
			items: {
				data: [
					{
						price: {
							id: "price_legacy_workers_untracked",
							recurring: {
								interval: "month",
								interval_count: 1,
							},
							product: "prod_legacy_workers_untracked",
						},
					},
				],
			},
			latest_invoice: null,
		});
		const { syncStripeWebhookEventToConvex } =
			await import("@/lib/billing/stripe-sync");

		await expect(
			syncStripeWebhookEventToConvex({
				id: "evt_legacy_workers_checkout_completed",
				created: 1_800_000_100,
				type: "checkout.session.completed",
				data: {
					object: {
						id: "cs_test_legacy_workers",
					},
				},
			} as never),
		).resolves.toEqual({
			kind: "workers_synced",
			eventId: "evt_legacy_workers_checkout_completed",
			stripeSubscriptionId: "sub_legacy_workers",
		});

		expect(
			getMutationArgs(
				(args) => args.stripeSubscriptionId === "sub_legacy_workers",
			),
		).toEqual(
			expect.objectContaining({
				ownerClerkUserId: "user_legacy_workers",
				stripeCustomerId: "cus_legacy_workers",
				stripePriceId: "price_legacy_workers_untracked",
				status: "active",
				cadence: "monthly",
			}),
		);
		expect(getMutationArgs((args) => args.source === "stripe_webhook")).toEqual(
			expect.objectContaining({
				clerkUserId: "user_legacy_workers",
				source: "stripe_webhook",
				stripeCheckoutSessionId: "cs_test_legacy_workers",
				offerId: "workers",
				fulfillmentTrack: "existing_codebase_doctor",
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

	it("starts Workers past-due grace only from invoice payment failure events", async () => {
		retrieveSubscriptionMock.mockResolvedValue({
			id: "sub_workers_123",
			customer: "cus_workers_123",
			metadata: {
				ownerClerkUserId: "user_workers_123",
			},
			status: "past_due",
			cancel_at_period_end: false,
			items: {
				data: [
					{
						price: {
							id: "price_workers_monthly",
							recurring: {
								interval: "month",
								interval_count: 1,
							},
							product: "prod_workers",
						},
					},
				],
			},
			latest_invoice: {
				id: "in_failed_123",
				hosted_invoice_url: "https://billing.stripe.test/recover",
				attempt_count: 2,
				next_payment_attempt: 1_800_000_500,
			},
		});
		const { syncStripeWebhookEventToConvex } =
			await import("@/lib/billing/stripe-sync");

		await expect(
			syncStripeWebhookEventToConvex({
				id: "evt_invoice_failed",
				created: 1_800_000_100,
				type: "invoice.payment_failed",
				data: {
					object: {
						id: "in_failed_123",
						customer: "cus_workers_123",
						subscription: "sub_workers_123",
					},
				},
			} as never),
		).resolves.toEqual({
			kind: "workers_synced",
			eventId: "evt_invoice_failed",
			stripeSubscriptionId: "sub_workers_123",
		});

		expect(
			getMutationArgs(
				(args) => args.stripeSubscriptionId === "sub_workers_123",
			),
		).toEqual(
			expect.objectContaining({
				status: "past_due",
				failedPaymentStartedAt: 1_800_000_100_000,
				accessThroughAt: 1_801_209_700_000,
			}),
		);
	});

	it("skips known-customer subscriptions that do not match the Workers offer", async () => {
		fetchQueryMock.mockResolvedValue({
			ownerClerkUserId: "user_known_customer",
			email: "known@example.com",
		});
		retrieveSubscriptionMock.mockResolvedValue({
			id: "sub_unrelated_123",
			customer: "cus_known_customer",
			metadata: {},
			status: "active",
			cancel_at_period_end: false,
			items: {
				data: [
					{
						price: {
							id: "price_other_monthly",
							recurring: {
								interval: "month",
								interval_count: 1,
							},
							product: "prod_other",
						},
					},
				],
			},
			latest_invoice: null,
		});
		const { syncStripeWebhookEventToConvex } =
			await import("@/lib/billing/stripe-sync");

		await expect(
			syncStripeWebhookEventToConvex({
				id: "evt_subscription_other",
				created: 1_800_000_100,
				type: "customer.subscription.updated",
				data: {
					object: {
						id: "sub_unrelated_123",
						customer: "cus_known_customer",
					},
				},
			} as never),
		).resolves.toEqual({
			kind: "skipped",
			eventId: "evt_subscription_other",
			reason: "non_workers_subscription",
		});

		expect(fetchQueryMock).not.toHaveBeenCalled();
		expect(
			getMutationArgs(
				(args) => args.stripeSubscriptionId === "sub_unrelated_123",
			),
		).toBeUndefined();
		expect(getMutationArgs((args) => args.status === "skipped")).toEqual(
			expect.objectContaining({
				status: "skipped",
				stripeObjectId: "sub_unrelated_123",
				errorMessage: "non_workers_subscription",
			}),
		);
	});

	it("does not slide Workers past-due grace on subscription update retries", async () => {
		retrieveSubscriptionMock.mockResolvedValue({
			id: "sub_workers_123",
			customer: "cus_workers_123",
			metadata: {
				ownerClerkUserId: "user_workers_123",
			},
			status: "past_due",
			cancel_at_period_end: false,
			items: {
				data: [
					{
						price: {
							id: "price_workers_monthly",
							recurring: {
								interval: "month",
								interval_count: 1,
							},
							product: "prod_workers",
						},
					},
				],
			},
			latest_invoice: {
				id: "in_failed_123",
				hosted_invoice_url: "https://billing.stripe.test/recover",
				attempt_count: 3,
			},
		});
		const { syncStripeWebhookEventToConvex } =
			await import("@/lib/billing/stripe-sync");

		await expect(
			syncStripeWebhookEventToConvex({
				id: "evt_subscription_update",
				created: 1_800_086_500,
				type: "customer.subscription.updated",
				data: {
					object: {
						id: "sub_workers_123",
						customer: "cus_workers_123",
					},
				},
			} as never),
		).resolves.toEqual({
			kind: "workers_synced",
			eventId: "evt_subscription_update",
			stripeSubscriptionId: "sub_workers_123",
		});

		const syncArgs = getMutationArgs(
			(args) => args.stripeSubscriptionId === "sub_workers_123",
		);
		expect(syncArgs).toEqual(
			expect.objectContaining({
				status: "past_due",
				failedPaymentAttemptCount: 3,
			}),
		);
		expect(syncArgs).not.toHaveProperty("failedPaymentStartedAt");
		expect(syncArgs).not.toHaveProperty("accessThroughAt");
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
