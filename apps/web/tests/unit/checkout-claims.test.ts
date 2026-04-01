import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function createCheckoutClaimsCtx({
	pendingCheckoutClaim = null,
	productAccessGrant = null,
	identity = {
		subject: "user_123",
		email: "buyer@example.com",
		emailVerified: true,
	},
	insert = vi.fn().mockResolvedValue("pending_checkout_claim_1"),
	patch = vi.fn().mockResolvedValue(undefined),
}: {
	pendingCheckoutClaim?: Record<string, unknown> | null;
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
				withIndex: vi.fn(() => ({
					unique: vi
						.fn()
						.mockResolvedValue(
							tableName === "pendingCheckoutClaims"
								? pendingCheckoutClaim
								: productAccessGrant,
						),
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
	});

	it("normalizes checkout emails before persistence comparisons", () => {
		expect(moduleUnderTest.normalizeCheckoutEmail(" Buyer@Example.com ")).toBe(
			"buyer@example.com",
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
				stripeEventId: "evt_456",
				stripeEventType: "checkout.session.async_payment_succeeded",
				updatedAt: 300,
			}),
		);
	});

	it("claims a pending checkout for the same Clerk user and grants access", async () => {
		const patch = vi.fn().mockResolvedValue(undefined);
		const ctx = createCheckoutClaimsCtx({
			pendingCheckoutClaim: {
				_id: "pending_checkout_claim_existing",
				stripeCheckoutSessionId: "cs_test_123",
				checkoutEmailNormalized: "buyer@example.com",
				stripeCustomerId: "cus_123",
				stripePaymentIntentId: "pi_123",
				status: "pending",
			},
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
});
