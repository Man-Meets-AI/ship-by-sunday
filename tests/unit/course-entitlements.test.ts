import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const clerkUserId = "user_product_access_123";

function createProductAccessGrant(
	status: "granted" | "pending" | "revoked" | "refunded",
	overrides: Record<string, unknown> = {},
) {
	return {
		_id: "product_access_1",
		_creationTime: 1,
		clerkUserId,
		status,
		source: "manual",
		grantedAt: 10,
		updatedAt: 10,
		...overrides,
	};
}

function createAccessCtx({
	productAccessGrant = null,
	patch = vi.fn().mockResolvedValue(undefined),
	insert = vi.fn().mockResolvedValue("product_access_1"),
}: {
	productAccessGrant?: Record<string, unknown> | null;
	patch?: ReturnType<typeof vi.fn>;
	insert?: ReturnType<typeof vi.fn>;
} = {}) {
	return {
		auth: {
			getUserIdentity: vi.fn(),
		},
		db: {
			query: vi.fn(() => ({
				withIndex: vi.fn(() => ({
					unique: vi.fn().mockResolvedValue(productAccessGrant),
				})),
			})),
			patch,
			insert,
		},
	};
}

describe("convex/access/model", () => {
	let moduleUnderTest: typeof import("@/convex/access/model");
	const originalEnv = { ...process.env };

	beforeEach(async () => {
		process.env = {
			...originalEnv,
			STRIPE_WEBHOOK_SECRET: "stripe_webhook_secret",
		};
		vi.resetModules();
		moduleUnderTest = await import("@/convex/access/model");
	});

	afterEach(() => {
		process.env = { ...originalEnv };
		vi.restoreAllMocks();
	});

	it("marks signed-out viewers as lacking access", async () => {
		const ctx = createAccessCtx();
		ctx.auth.getUserIdentity.mockResolvedValue(null);

		await expect(
			moduleUnderTest.viewerProductAccessHandler(ctx as never),
		).resolves.toEqual({
			clerkUserId: null,
			hasAccess: false,
			status: "signed_out",
		});
	});

	it("marks a signed-in viewer without product access as needing access", async () => {
		const ctx = createAccessCtx();
		ctx.auth.getUserIdentity.mockResolvedValue({ subject: clerkUserId });

		await expect(
			moduleUnderTest.viewerProductAccessHandler(ctx as never),
		).resolves.toEqual({
			clerkUserId,
			hasAccess: false,
			status: "no_access",
		});
	});

	it("marks a granted viewer as active", async () => {
		const ctx = createAccessCtx({
			productAccessGrant: createProductAccessGrant("granted"),
		});
		ctx.auth.getUserIdentity.mockResolvedValue({ subject: clerkUserId });

		await expect(
			moduleUnderTest.viewerProductAccessHandler(ctx as never),
		).resolves.toEqual({
			clerkUserId,
			hasAccess: true,
			status: "granted",
		});
	});

	it("inserts a new product-access grant from the manual path", async () => {
		const insert = vi.fn().mockResolvedValue("product_access_1");
		const ctx = createAccessCtx({
			insert,
		});

		vi.spyOn(Date, "now").mockReturnValue(200);

		await expect(
			moduleUnderTest.grantProductAccessHandler(ctx as never, {
				clerkUserId,
				source: "manual",
			}),
		).resolves.toEqual({
			granted: "inserted",
		});
		expect(insert).toHaveBeenCalledWith(
			"productAccessGrants",
			expect.objectContaining({
				clerkUserId,
				status: "granted",
				source: "manual",
				grantedAt: 200,
				updatedAt: 200,
			}),
		);
	});

	it("patches an existing product-access grant instead of creating a duplicate", async () => {
		const patch = vi.fn().mockResolvedValue(undefined);
		const ctx = createAccessCtx({
			productAccessGrant: createProductAccessGrant("pending", {
				_id: "product_access_existing",
				source: "stripe_checkout",
				updatedAt: 25,
			}),
			patch,
		});

		vi.spyOn(Date, "now").mockReturnValue(300);

		await expect(
			moduleUnderTest.grantProductAccessHandler(ctx as never, {
				clerkUserId,
				source: "stripe_webhook",
				stripeCustomerId: "cus_123",
				stripeCheckoutSessionId: "cs_123",
				stripePaymentIntentId: "pi_123",
			}),
		).resolves.toEqual({
			granted: "patched",
		});
		expect(patch).toHaveBeenCalledWith(
			"product_access_existing",
			expect.objectContaining({
				status: "granted",
				source: "stripe_webhook",
				stripeCustomerId: "cus_123",
				stripeCheckoutSessionId: "cs_123",
				stripePaymentIntentId: "pi_123",
				updatedAt: 300,
				revokedAt: undefined,
			}),
		);
	});

	it("grants product access from the verified Stripe path without a client secret arg", async () => {
		const insert = vi.fn().mockResolvedValue("product_access_1");
		const ctx = createAccessCtx({
			insert,
		});

		vi.spyOn(Date, "now").mockReturnValue(400);

		await expect(
			moduleUnderTest.grantProductAccessFromStripeHandler(ctx as never, {
				clerkUserId,
				stripeCustomerId: "cus_123",
				stripeCheckoutSessionId: "cs_123",
				stripePaymentIntentId: "pi_123",
			}),
		).resolves.toEqual({
			granted: "inserted",
		});
		expect(insert).toHaveBeenCalledWith(
			"productAccessGrants",
			expect.objectContaining({
				clerkUserId,
				status: "granted",
				source: "stripe_webhook",
				stripeCustomerId: "cus_123",
				stripeCheckoutSessionId: "cs_123",
				stripePaymentIntentId: "pi_123",
				grantedAt: 400,
				updatedAt: 400,
			}),
		);
	});
});
