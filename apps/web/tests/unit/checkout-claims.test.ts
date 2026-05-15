import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function createCheckoutClaimsCtx({
	pendingCheckoutClaim = null,
	pendingCheckoutClaimsByEmail = [],
	productAccessGrant = null,
	identity = {
		subject: "user_123",
		tokenIdentifier: "https://clerk.example.com|user_123",
		email: "buyer@example.com",
		emailVerified: true,
	},
	insert = vi.fn().mockResolvedValue("pending_checkout_claim_1"),
	patch = vi.fn().mockResolvedValue(undefined),
}: {
	pendingCheckoutClaim?: Record<string, unknown> | null;
	pendingCheckoutClaimsByEmail?: Array<Record<string, unknown>>;
	productAccessGrant?: Record<string, unknown> | null;
	identity?: Record<string, unknown> | null;
	insert?: ReturnType<typeof vi.fn>;
	patch?: ReturnType<typeof vi.fn>;
} = {}) {
	return {
		auth: {
			getUserIdentity: vi.fn().mockResolvedValue(identity),
		},
		db: {
			query: vi.fn((tableName: string) => ({
				withIndex: vi.fn((indexName: string) => ({
					unique: vi
						.fn()
						.mockResolvedValue(
							tableName === "pendingCheckoutClaims" &&
								indexName === "by_stripe_checkout_session_id"
								? pendingCheckoutClaim
								: productAccessGrant,
						),
					collect: vi
						.fn()
						.mockResolvedValue(
							tableName === "pendingCheckoutClaims" &&
								indexName ===
									"by_checkout_email_normalized_and_status_and_updated_at"
								? pendingCheckoutClaimsByEmail
								: [],
						),
					order: vi.fn(() => ({
						take: vi
							.fn()
							.mockResolvedValue(
								tableName === "pendingCheckoutClaims" &&
									indexName ===
										"by_checkout_email_normalized_and_status_and_updated_at"
									? [...pendingCheckoutClaimsByEmail].reverse()
									: [],
							),
					})),
				})),
			})),
			insert,
			patch,
		},
	};
}

describe("convex/checkoutClaims", () => {
	let moduleUnderTest: typeof import("@/convex/checkoutClaims");

	beforeEach(async () => {
		vi.resetModules();
		moduleUnderTest = await import("@/convex/checkoutClaims");
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
	});

	it("normalizes checkout emails before persistence comparisons", () => {
		expect(moduleUnderTest.normalizeCheckoutEmail(" Buyer@Example.com ")).toBe(
			"buyer@example.com",
		);
	});

	it("rejects server checkout grants with the wrong webhook secret", async () => {
		vi.stubEnv(
			"CONVEX_WEBHOOK_MUTATION_SECRET",
			"convex_webhook_mutation_secret_1234567890",
		);

		await expect(
			moduleUnderTest.grantProductAccessForCheckoutSessionFromServer._handler(
				{} as never,
				{
					convexWebhookMutationSecret: "wrong_secret",
					clerkUserId: "user_123",
					source: "stripe_webhook",
					stripeCheckoutSessionId: "cs_test_123",
					offerId: "starter",
				},
			),
		).rejects.toThrow("Unauthorized checkout claim sync call.");
	});

	it("lets the webhook sync grant checkout session access with the shared secret", async () => {
		vi.stubEnv(
			"CONVEX_WEBHOOK_MUTATION_SECRET",
			"convex_webhook_mutation_secret_1234567890",
		);
		const insert = vi.fn().mockResolvedValue("product_access_1");
		const ctx = createCheckoutClaimsCtx({ insert });
		vi.spyOn(Date, "now").mockReturnValue(250);

		await expect(
			moduleUnderTest.grantProductAccessForCheckoutSessionFromServer._handler(
				ctx as never,
				{
					convexWebhookMutationSecret:
						"convex_webhook_mutation_secret_1234567890",
					clerkUserId: "user_123",
					source: "stripe_webhook",
					stripeCustomerId: "cus_123",
					stripeCheckoutSessionId: "cs_test_123",
					stripePaymentIntentId: "pi_123",
					offerId: "starter",
				},
			),
		).resolves.toEqual({
			granted: "inserted",
		});

		expect(insert).toHaveBeenCalledWith(
			"productAccessGrants",
			expect.objectContaining({
				clerkUserId: "user_123",
				source: "stripe_webhook",
				status: "granted",
				stripeCustomerId: "cus_123",
				stripeCheckoutSessionId: "cs_test_123",
				stripePaymentIntentId: "pi_123",
				capabilities: ["generate_codebase", "tutorials"],
				offerIds: ["starter"],
				lastCheckoutOfferId: "starter",
				fulfillmentTrack: "generated_codebase",
				grantedAt: 250,
				updatedAt: 250,
			}),
		);
	});

	it("inserts a pending claim when the session is new", async () => {
		const insert = vi.fn().mockResolvedValue("pending_checkout_claim_1");
		const ctx = createCheckoutClaimsCtx({ insert });

		vi.spyOn(Date, "now").mockReturnValue(200);

		await expect(
			moduleUnderTest.upsertPendingCheckoutClaimFromStripe._handler(
				ctx as never,
				{
					stripeCheckoutSessionId: "cs_test_123",
					checkoutEmail: "Buyer@Example.com",
					courseSlug: "ship-by-sunday",
					paymentStatus: "paid",
					stripeCustomerId: "cus_123",
					stripePaymentIntentId: "pi_123",
					fulfillmentTrack: "existing_codebase_doctor",
					stripeEventId: "evt_123",
					stripeEventType: "checkout.session.completed",
				},
			),
		).resolves.toEqual({
			saved: "inserted",
		});

		expect(insert).toHaveBeenCalledWith(
			"pendingCheckoutClaims",
			expect.objectContaining({
				stripeCheckoutSessionId: "cs_test_123",
				checkoutEmail: "Buyer@Example.com",
				checkoutEmailNormalized: "buyer@example.com",
				courseSlug: "ship-by-sunday",
				paymentStatus: "paid",
				stripeCustomerId: "cus_123",
				stripePaymentIntentId: "pi_123",
				fulfillmentTrack: "existing_codebase_doctor",
				stripeEventId: "evt_123",
				stripeEventType: "checkout.session.completed",
				status: "pending",
				createdAt: 200,
				updatedAt: 200,
			}),
		);
	});

	it("patches an existing pending claim instead of creating a duplicate", async () => {
		const patch = vi.fn().mockResolvedValue(undefined);
		const ctx = createCheckoutClaimsCtx({
			pendingCheckoutClaim: {
				_id: "pending_checkout_claim_existing",
				status: "claimed",
				claimedByClerkUserId: "user_123",
				claimedAt: 100,
			},
			patch,
		});

		vi.spyOn(Date, "now").mockReturnValue(300);

		await expect(
			moduleUnderTest.upsertPendingCheckoutClaimFromStripe._handler(
				ctx as never,
				{
					stripeCheckoutSessionId: "cs_test_123",
					checkoutEmail: "buyer@example.com",
					courseSlug: "ship-by-sunday",
					paymentStatus: "no_payment_required",
					stripeCustomerId: "cus_456",
					stripePaymentIntentId: "pi_456",
					stripeEventId: "evt_456",
					stripeEventType: "checkout.session.async_payment_succeeded",
				},
			),
		).resolves.toEqual({
			saved: "patched",
		});

		expect(patch).toHaveBeenCalledWith(
			"pending_checkout_claim_existing",
			expect.objectContaining({
				checkoutEmail: "buyer@example.com",
				checkoutEmailNormalized: "buyer@example.com",
				courseSlug: "ship-by-sunday",
				paymentStatus: "no_payment_required",
				stripeCustomerId: "cus_456",
				stripePaymentIntentId: "pi_456",
				fulfillmentTrack: "unspecified",
				stripeEventId: "evt_456",
				stripeEventType: "checkout.session.async_payment_succeeded",
				updatedAt: 300,
			}),
		);
	});

	it("returns the latest checkout claim for an email", async () => {
		const ctx = createCheckoutClaimsCtx({
			pendingCheckoutClaimsByEmail: [
				{
					_id: "pending_checkout_claim_old",
					checkoutEmailNormalized: "buyer@example.com",
					status: "pending",
					updatedAt: 100,
				},
				{
					_id: "pending_checkout_claim_latest_pending",
					checkoutEmailNormalized: "buyer@example.com",
					status: "pending",
					updatedAt: 300,
				},
			],
		});

		await expect(
			moduleUnderTest.getLatestCheckoutClaimByEmail._handler(ctx as never, {
				checkoutEmailNormalized: "buyer@example.com",
			}),
		).resolves.toMatchObject({
			_id: "pending_checkout_claim_latest_pending",
			updatedAt: 300,
		});
	});

	it("claims a pending checkout for the same Clerk user and grants access", async () => {
		const insert = vi.fn().mockResolvedValue("product_access_1");
		const patch = vi.fn().mockResolvedValue(undefined);
		const ctx = createCheckoutClaimsCtx({
			pendingCheckoutClaim: {
				_id: "pending_checkout_claim_existing",
				stripeCheckoutSessionId: "cs_test_123",
				checkoutEmailNormalized: "buyer@example.com",
				stripeCustomerId: "cus_123",
				stripePaymentIntentId: "pi_123",
				buyerStartingPoint: "existing_codebase",
				checkoutCtaId: "codebase_demo_existing",
				fulfillmentTrack: "existing_codebase_doctor",
				status: "pending",
			},
			insert,
			patch,
		});

		vi.spyOn(Date, "now").mockReturnValue(500);

		await expect(
			moduleUnderTest.claimPendingCheckoutClaim._handler(ctx as never, {
				stripeCheckoutSessionId: "cs_test_123",
			}),
		).resolves.toEqual({
			claim: "claimed",
			grantResult: {
				granted: "inserted",
			},
		});

		expect(patch).toHaveBeenCalledWith(
			"pending_checkout_claim_existing",
			expect.objectContaining({
				status: "claimed",
				claimedByClerkUserId: "user_123",
				claimedAt: 500,
				updatedAt: 500,
			}),
		);
		expect(insert).toHaveBeenCalledWith(
			"productAccessGrants",
			expect.objectContaining({
				clerkUserId: "user_123",
				fulfillmentTrack: "existing_codebase_doctor",
			}),
		);
	});

	it("refuses to reassign an already-claimed checkout to a different Clerk user", async () => {
		const patch = vi.fn().mockResolvedValue(undefined);
		const ctx = createCheckoutClaimsCtx({
			pendingCheckoutClaim: {
				_id: "pending_checkout_claim_existing",
				checkoutEmailNormalized: "buyer@example.com",
				status: "claimed",
				claimedByClerkUserId: "user_existing",
			},
			patch,
		});

		await expect(
			moduleUnderTest.claimPendingCheckoutClaim._handler(ctx as never, {
				stripeCheckoutSessionId: "cs_test_123",
			}),
		).resolves.toEqual({
			claim: "claimed_by_other_user",
		});
		expect(patch).not.toHaveBeenCalled();
	});

	it("refuses to claim when the signed-in email does not match the checkout email", async () => {
		const patch = vi.fn().mockResolvedValue(undefined);
		const ctx = createCheckoutClaimsCtx({
			pendingCheckoutClaim: {
				_id: "pending_checkout_claim_existing",
				checkoutEmailNormalized: "buyer@example.com",
				status: "pending",
			},
			identity: {
				subject: "user_123",
				tokenIdentifier: "https://clerk.example.com|user_123",
				email: "other@example.com",
				emailVerified: true,
			},
			patch,
		});

		await expect(
			moduleUnderTest.claimPendingCheckoutClaim._handler(ctx as never, {
				stripeCheckoutSessionId: "cs_test_123",
			}),
		).resolves.toEqual({
			claim: "email_mismatch",
		});
		expect(patch).not.toHaveBeenCalled();
	});

	it("repairs a paid pending checkout claim for a target Clerk user", async () => {
		const insert = vi.fn().mockResolvedValue("product_access_grant_1");
		const patch = vi.fn().mockResolvedValue(undefined);
		const ctx = createCheckoutClaimsCtx({
			pendingCheckoutClaim: {
				_id: "pending_checkout_claim_existing",
				stripeCheckoutSessionId: "cs_test_from_claim",
				checkoutEmailNormalized: "buyer@example.com",
				paymentStatus: "paid",
				stripeCustomerId: "cus_from_claim",
				stripePaymentIntentId: "pi_from_claim",
				status: "pending",
			},
			insert,
			patch,
		});

		vi.spyOn(Date, "now").mockReturnValue(700);

		await expect(
			moduleUnderTest.repairPaidCheckoutClaim._handler(ctx as never, {
				stripeCheckoutSessionId: "cs_test_from_claim",
				checkoutEmail: " Buyer@Example.com ",
				clerkUserId: "user_target",
			}),
		).resolves.toEqual({
			repair: "repaired",
			grantResult: {
				granted: "inserted",
			},
		});

		expect(insert).toHaveBeenCalledWith(
			"productAccessGrants",
			expect.objectContaining({
				clerkUserId: "user_target",
				status: "granted",
				source: "stripe_checkout",
				stripeCustomerId: "cus_from_claim",
				stripeCheckoutSessionId: "cs_test_from_claim",
				stripePaymentIntentId: "pi_from_claim",
				grantedAt: 700,
				updatedAt: 700,
			}),
		);
		expect(patch).toHaveBeenCalledWith(
			"pending_checkout_claim_existing",
			expect.objectContaining({
				status: "claimed",
				claimedByClerkUserId: "user_target",
				claimedAt: 700,
				updatedAt: 700,
			}),
		);
	});

	it("repeats a repair idempotently for a claim already owned by the target user", async () => {
		const insert = vi.fn().mockResolvedValue("product_access_grant_1");
		const patch = vi.fn().mockResolvedValue(undefined);
		const ctx = createCheckoutClaimsCtx({
			pendingCheckoutClaim: {
				_id: "pending_checkout_claim_existing",
				stripeCheckoutSessionId: "cs_test_from_claim",
				checkoutEmailNormalized: "buyer@example.com",
				paymentStatus: "paid",
				stripeCustomerId: "cus_from_claim",
				stripePaymentIntentId: "pi_from_claim",
				status: "claimed",
				claimedByClerkUserId: "user_target",
				claimedAt: 600,
			},
			productAccessGrant: {
				_id: "product_access_grant_existing",
				clerkUserId: "user_target",
				status: "granted",
				source: "stripe_checkout",
			},
			insert,
			patch,
		});

		vi.spyOn(Date, "now").mockReturnValue(800);

		await expect(
			moduleUnderTest.repairPaidCheckoutClaim._handler(ctx as never, {
				stripeCheckoutSessionId: "cs_test_from_claim",
				checkoutEmail: "buyer@example.com",
				clerkUserId: "user_target",
			}),
		).resolves.toEqual({
			repair: "already_claimed_by_target",
			grantResult: {
				granted: "patched",
			},
		});

		expect(insert).not.toHaveBeenCalled();
		expect(patch).toHaveBeenNthCalledWith(
			1,
			"product_access_grant_existing",
			expect.objectContaining({
				status: "granted",
				source: "stripe_checkout",
				stripeCustomerId: "cus_from_claim",
				stripeCheckoutSessionId: "cs_test_from_claim",
				stripePaymentIntentId: "pi_from_claim",
				updatedAt: 800,
			}),
		);
		expect(patch).toHaveBeenNthCalledWith(
			2,
			"pending_checkout_claim_existing",
			{
				updatedAt: 800,
			},
		);
	});

	it("refuses repair when the checkout claim is missing", async () => {
		const insert = vi.fn().mockResolvedValue("product_access_grant_1");
		const patch = vi.fn().mockResolvedValue(undefined);
		const ctx = createCheckoutClaimsCtx({
			pendingCheckoutClaim: null,
			insert,
			patch,
		});

		await expect(
			moduleUnderTest.repairPaidCheckoutClaim._handler(ctx as never, {
				stripeCheckoutSessionId: "cs_test_missing",
				checkoutEmail: "buyer@example.com",
				clerkUserId: "user_target",
			}),
		).resolves.toEqual({
			repair: "missing_claim",
		});

		expect(insert).not.toHaveBeenCalled();
		expect(patch).not.toHaveBeenCalled();
	});

	it("refuses repair when the operator email does not match the checkout email", async () => {
		const insert = vi.fn().mockResolvedValue("product_access_grant_1");
		const patch = vi.fn().mockResolvedValue(undefined);
		const ctx = createCheckoutClaimsCtx({
			pendingCheckoutClaim: {
				_id: "pending_checkout_claim_existing",
				stripeCheckoutSessionId: "cs_test_from_claim",
				checkoutEmailNormalized: "buyer@example.com",
				paymentStatus: "paid",
				status: "pending",
			},
			insert,
			patch,
		});

		await expect(
			moduleUnderTest.repairPaidCheckoutClaim._handler(ctx as never, {
				stripeCheckoutSessionId: "cs_test_from_claim",
				checkoutEmail: "other@example.com",
				clerkUserId: "user_target",
			}),
		).resolves.toEqual({
			repair: "checkout_email_mismatch",
		});

		expect(insert).not.toHaveBeenCalled();
		expect(patch).not.toHaveBeenCalled();
	});

	it("refuses repair when a stored checkout claim is not paid", async () => {
		const insert = vi.fn().mockResolvedValue("product_access_grant_1");
		const patch = vi.fn().mockResolvedValue(undefined);
		const ctx = createCheckoutClaimsCtx({
			pendingCheckoutClaim: {
				_id: "pending_checkout_claim_existing",
				stripeCheckoutSessionId: "cs_test_from_claim",
				checkoutEmailNormalized: "buyer@example.com",
				paymentStatus: "unpaid",
				status: "pending",
			},
			insert,
			patch,
		});

		await expect(
			moduleUnderTest.repairPaidCheckoutClaim._handler(ctx as never, {
				stripeCheckoutSessionId: "cs_test_from_claim",
				checkoutEmail: "buyer@example.com",
				clerkUserId: "user_target",
			}),
		).resolves.toEqual({
			repair: "payment_not_paid",
		});

		expect(insert).not.toHaveBeenCalled();
		expect(patch).not.toHaveBeenCalled();
	});

	it("refuses repair when the claim is already owned by another Clerk user", async () => {
		const insert = vi.fn().mockResolvedValue("product_access_grant_1");
		const patch = vi.fn().mockResolvedValue(undefined);
		const ctx = createCheckoutClaimsCtx({
			pendingCheckoutClaim: {
				_id: "pending_checkout_claim_existing",
				stripeCheckoutSessionId: "cs_test_from_claim",
				checkoutEmailNormalized: "buyer@example.com",
				paymentStatus: "paid",
				status: "claimed",
				claimedByClerkUserId: "user_existing",
			},
			insert,
			patch,
		});

		await expect(
			moduleUnderTest.repairPaidCheckoutClaim._handler(ctx as never, {
				stripeCheckoutSessionId: "cs_test_from_claim",
				checkoutEmail: "buyer@example.com",
				clerkUserId: "user_target",
			}),
		).resolves.toEqual({
			repair: "claimed_by_other_user",
		});

		expect(insert).not.toHaveBeenCalled();
		expect(patch).not.toHaveBeenCalled();
	});

	it("requires the server checkout token before creating purchase intents", async () => {
		const previousToken = process.env.CHECKOUT_FULFILLMENT_RETRY_SECRET;
		process.env.CHECKOUT_FULFILLMENT_RETRY_SECRET =
			"checkout_server_secret_123456789012345";
		const runMutation = vi.fn();
		const auth = {
			getUserIdentity: vi.fn().mockResolvedValue(null),
		};

		try {
			await expect(
				moduleUnderTest.createCheckoutPurchaseIntent._handler(
					{ auth, runMutation } as never,
					{
						checkoutServerToken: "wrong-token",
						checkoutSurface: "hosted_checkout",
					},
				),
			).rejects.toThrow("Unauthorized checkout purchase intent write");

			expect(runMutation).not.toHaveBeenCalled();
		} finally {
			if (previousToken === undefined) {
				delete process.env.CHECKOUT_FULFILLMENT_RETRY_SECRET;
			} else {
				process.env.CHECKOUT_FULFILLMENT_RETRY_SECRET = previousToken;
			}
		}
	});

	it("keeps the server token out of the internal purchase-intent write", async () => {
		const checkoutServerToken = "checkout_server_secret_123456789012345";
		const previousToken = process.env.CHECKOUT_FULFILLMENT_RETRY_SECRET;
		process.env.CHECKOUT_FULFILLMENT_RETRY_SECRET = checkoutServerToken;
		const auth = {
			getUserIdentity: vi.fn().mockResolvedValue(null),
		};
		const runMutation = vi
			.fn()
			.mockResolvedValue({ purchaseIntentId: "purchase_intent_123" });

		try {
			await expect(
				moduleUnderTest.createCheckoutPurchaseIntent._handler(
					{ auth, runMutation } as never,
					{
						checkoutServerToken,
						checkoutSurface: "hosted_checkout",
						checkoutEmail: "buyer@example.com",
					},
				),
			).resolves.toEqual({ purchaseIntentId: "purchase_intent_123" });

			expect(runMutation).toHaveBeenCalledWith(expect.anything(), {
				clerkUserId: undefined,
				checkoutEmail: "buyer@example.com",
				checkoutSurface: "hosted_checkout",
			});
		} finally {
			if (previousToken === undefined) {
				delete process.env.CHECKOUT_FULFILLMENT_RETRY_SECRET;
			} else {
				process.env.CHECKOUT_FULFILLMENT_RETRY_SECRET = previousToken;
			}
		}
	});
});
