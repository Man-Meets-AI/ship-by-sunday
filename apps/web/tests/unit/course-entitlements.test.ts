import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const clerkUserId = "user_product_access_123";
const convexTokenIdentifier =
	"https://clerk.example.com|user_product_access_123";

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
	starterLicenseTerms = [],
	workersSubscriptions = [],
	patch = vi.fn().mockResolvedValue(undefined),
	deleteMock = vi.fn().mockResolvedValue(undefined),
	insert = vi.fn().mockResolvedValue("product_access_1"),
}: {
	productAccessGrant?: Record<string, unknown> | null;
	starterLicenseTerms?: Array<Record<string, unknown>>;
	workersSubscriptions?: Array<Record<string, unknown>>;
	patch?: ReturnType<typeof vi.fn>;
	deleteMock?: ReturnType<typeof vi.fn>;
	insert?: ReturnType<typeof vi.fn>;
} = {}) {
	const tables: Record<string, Array<Record<string, unknown>>> = {
		productAccessGrants: productAccessGrant ? [productAccessGrant] : [],
		starterLicenseTerms,
		workersSubscriptions,
	};

	return {
		auth: {
			getUserIdentity: vi.fn(),
		},
		db: {
			query: vi.fn((tableName: string) => ({
				withIndex: vi.fn(
					(
						_indexName: string,
						callback: (query: {
							eq: (fieldName: string, value: unknown) => unknown;
						}) => unknown,
					) => {
						const filters: Array<{ fieldName: string; value: unknown }> = [];
						const queryBuilder = {
							eq: (fieldName: string, value: unknown) => {
								filters.push({ fieldName, value });
								return queryBuilder;
							},
						};
						callback(queryBuilder);
						const matches = (tables[tableName] ?? []).filter((record) =>
							filters.every(
								(filter) => record[filter.fieldName] === filter.value,
							),
						);

						return {
							unique: vi.fn().mockResolvedValue(matches[0] ?? null),
							collect: vi.fn().mockResolvedValue(matches),
						};
					},
				),
			})),
			delete: deleteMock,
			patch,
			insert,
		},
	};
}

describe("convex/entitlements/model", () => {
	let moduleUnderTest: typeof import("@/convex/entitlements/model");
	const originalEnv = { ...process.env };

	beforeEach(async () => {
		process.env = {
			...originalEnv,
			STRIPE_WEBHOOK_SECRET: "stripe_webhook_secret",
		};
		vi.resetModules();
		moduleUnderTest = await import("@/convex/entitlements/model");
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
			capabilities: [],
		});
	});

	it("marks a signed-in viewer without product access as needing access", async () => {
		const ctx = createAccessCtx();
		ctx.auth.getUserIdentity.mockResolvedValue({
			subject: clerkUserId,
			tokenIdentifier: convexTokenIdentifier,
		});

		await expect(
			moduleUnderTest.viewerProductAccessHandler(ctx as never),
		).resolves.toEqual({
			clerkUserId,
			hasAccess: false,
			status: "no_access",
			capabilities: [],
		});
	});

	it("does not infer product capabilities from a granted row without product fields", async () => {
		const ctx = createAccessCtx({
			productAccessGrant: createProductAccessGrant("granted"),
		});
		ctx.auth.getUserIdentity.mockResolvedValue({
			subject: clerkUserId,
			tokenIdentifier: convexTokenIdentifier,
		});

		await expect(
			moduleUnderTest.viewerProductAccessHandler(ctx as never),
		).resolves.toEqual({
			clerkUserId,
			hasAccess: true,
			status: "granted",
			capabilities: [],
			buyerStartingPoint: "unspecified",
			checkoutCtaId: "unspecified",
			fulfillmentTrack: "unspecified",
		});
	});

	it("derives Starter capabilities from stored checkout offer fields", async () => {
		const ctx = createAccessCtx({
			productAccessGrant: createProductAccessGrant("granted", {
				lastCheckoutOfferId: "starter",
			}),
		});
		ctx.auth.getUserIdentity.mockResolvedValue({
			subject: clerkUserId,
			tokenIdentifier: convexTokenIdentifier,
		});

		await expect(
			moduleUnderTest.viewerProductAccessHandler(ctx as never),
		).resolves.toEqual({
			clerkUserId,
			hasAccess: true,
			status: "granted",
			capabilities: ["generate_codebase", "tutorials"],
			buyerStartingPoint: "unspecified",
			checkoutCtaId: "unspecified",
			fulfillmentTrack: "unspecified",
		});
	});

	it("falls back to stored capabilities for legacy Stripe grants before billing rows are backfilled", async () => {
		const ctx = createAccessCtx({
			productAccessGrant: createProductAccessGrant("granted", {
				source: "stripe_webhook",
				stripeCheckoutSessionId: "cs_legacy_123",
				lastCheckoutOfferId: "starter",
			}),
		});
		ctx.auth.getUserIdentity.mockResolvedValue({
			subject: clerkUserId,
			tokenIdentifier: convexTokenIdentifier,
		});

		await expect(
			moduleUnderTest.viewerProductAccessHandler(ctx as never),
		).resolves.toEqual({
			clerkUserId,
			hasAccess: true,
			status: "granted",
			capabilities: ["generate_codebase", "tutorials"],
			buyerStartingPoint: "unspecified",
			checkoutCtaId: "unspecified",
			fulfillmentTrack: "unspecified",
		});
	});

	it("keeps Stripe-backed Starter access only while the billing license is active", async () => {
		const now = Date.UTC(2026, 4, 13);
		vi.spyOn(Date, "now").mockReturnValue(now);
		const ctx = createAccessCtx({
			productAccessGrant: createProductAccessGrant("granted", {
				source: "stripe_webhook",
				stripeCheckoutSessionId: "cs_123",
				lastCheckoutOfferId: "starter",
			}),
			starterLicenseTerms: [
				{
					_id: "starterLicenseTerms_1",
					ownerClerkUserId: clerkUserId,
					status: "active",
					stripeCheckoutSessionId: "cs_123",
					purchasedAt: Date.UTC(2026, 0, 1),
					termStartAt: Date.UTC(2026, 0, 1),
					termEndAt: Date.UTC(2027, 0, 1),
					refundState: "none",
					createdAt: 1,
					updatedAt: 1,
				},
			],
		});
		ctx.auth.getUserIdentity.mockResolvedValue({
			subject: clerkUserId,
			tokenIdentifier: convexTokenIdentifier,
		});

		await expect(
			moduleUnderTest.viewerProductAccessHandler(ctx as never),
		).resolves.toMatchObject({
			clerkUserId,
			hasAccess: true,
			status: "granted",
			capabilities: ["generate_codebase", "tutorials"],
		});
	});

	it("keeps legacy Starter capabilities when only Workers has billing rows", async () => {
		const now = Date.UTC(2026, 4, 13);
		vi.spyOn(Date, "now").mockReturnValue(now);
		const ctx = createAccessCtx({
			productAccessGrant: createProductAccessGrant("granted", {
				source: "stripe_webhook",
				stripeCheckoutSessionId: "cs_starter_legacy",
				lastCheckoutOfferId: "starter",
			}),
			workersSubscriptions: [
				{
					_id: "workersSubscriptions_1",
					ownerClerkUserId: clerkUserId,
					stripeCustomerId: "cus_123",
					stripeSubscriptionId: "sub_123",
					cadence: "monthly",
					status: "active",
					cancelAtPeriodEnd: false,
					currentPeriodEndAt: Date.UTC(2026, 5, 1),
					refundState: "none",
					createdAt: 1,
					updatedAt: 1,
				},
			],
		});
		ctx.auth.getUserIdentity.mockResolvedValue({
			subject: clerkUserId,
			tokenIdentifier: convexTokenIdentifier,
		});

		await expect(
			moduleUnderTest.viewerProductAccessHandler(ctx as never),
		).resolves.toMatchObject({
			clerkUserId,
			hasAccess: true,
			status: "granted",
			capabilities: ["generate_codebase", "tutorials", "worker"],
		});
	});

	it("removes Stripe-backed Starter access after the billing license is refunded", async () => {
		const now = Date.UTC(2026, 4, 13);
		vi.spyOn(Date, "now").mockReturnValue(now);
		const ctx = createAccessCtx({
			productAccessGrant: createProductAccessGrant("granted", {
				source: "stripe_webhook",
				stripeCheckoutSessionId: "cs_123",
				lastCheckoutOfferId: "starter",
			}),
			starterLicenseTerms: [
				{
					_id: "starterLicenseTerms_1",
					ownerClerkUserId: clerkUserId,
					status: "active",
					stripeCheckoutSessionId: "cs_123",
					purchasedAt: Date.UTC(2026, 0, 1),
					termStartAt: Date.UTC(2026, 0, 1),
					termEndAt: Date.UTC(2027, 0, 1),
					refundState: "fully_refunded",
					createdAt: 1,
					updatedAt: 1,
				},
			],
		});
		ctx.auth.getUserIdentity.mockResolvedValue({
			subject: clerkUserId,
			tokenIdentifier: convexTokenIdentifier,
		});

		await expect(
			moduleUnderTest.viewerProductAccessHandler(ctx as never),
		).resolves.toMatchObject({
			clerkUserId,
			hasAccess: false,
			status: "no_access",
			capabilities: [],
		});
		await expect(
			moduleUnderTest.requireGeneratedCodebaseProductAccess(ctx as never),
		).rejects.toThrow("Access required");
	});

	it("removes Stripe-backed Workers access after the billing subscription is canceled", async () => {
		const now = Date.UTC(2026, 4, 13);
		vi.spyOn(Date, "now").mockReturnValue(now);
		const ctx = createAccessCtx({
			productAccessGrant: createProductAccessGrant("granted", {
				source: "stripe_webhook",
				stripeCustomerId: "cus_123",
				stripeCheckoutSessionId: "cs_123",
				lastCheckoutOfferId: "workers",
			}),
			workersSubscriptions: [
				{
					_id: "workersSubscriptions_1",
					ownerClerkUserId: clerkUserId,
					stripeCustomerId: "cus_123",
					stripeSubscriptionId: "sub_123",
					cadence: "monthly",
					status: "canceled",
					cancelAtPeriodEnd: false,
					currentPeriodEndAt: Date.UTC(2026, 5, 1),
					terminalFailureAt: Date.UTC(2026, 4, 12),
					refundState: "none",
					createdAt: 1,
					updatedAt: 1,
				},
			],
		});
		ctx.auth.getUserIdentity.mockResolvedValue({
			subject: clerkUserId,
			tokenIdentifier: convexTokenIdentifier,
		});

		await expect(
			moduleUnderTest.viewerProductAccessHandler(ctx as never),
		).resolves.toMatchObject({
			clerkUserId,
			hasAccess: false,
			status: "no_access",
			capabilities: [],
		});
		await expect(
			moduleUnderTest.requireExistingCodebaseProductAccess(ctx as never),
		).rejects.toThrow("Access required");
	});

	it("returns stored fulfillment intent and legacy Worker capabilities for a granted viewer", async () => {
		const ctx = createAccessCtx({
			productAccessGrant: createProductAccessGrant("granted", {
				buyerStartingPoint: "existing_codebase",
				checkoutCtaId: "codebase_demo_existing",
				fulfillmentTrack: "existing_codebase_doctor",
			}),
		});
		ctx.auth.getUserIdentity.mockResolvedValue({
			subject: clerkUserId,
			tokenIdentifier: convexTokenIdentifier,
		});

		await expect(
			moduleUnderTest.viewerProductAccessHandler(ctx as never),
		).resolves.toEqual({
			clerkUserId,
			hasAccess: true,
			status: "granted",
			capabilities: ["worker"],
			buyerStartingPoint: "existing_codebase",
			checkoutCtaId: "codebase_demo_existing",
			fulfillmentTrack: "existing_codebase_doctor",
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
				capabilities: ["generate_codebase", "tutorials"],
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
				capabilities: ["generate_codebase", "tutorials"],
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
				checkoutOfferId: "workers",
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
				capabilities: ["worker"],
				updatedAt: 300,
				revokedAt: undefined,
			}),
		);
	});

	it("preserves webhook fulfillment source when checkout recovery patches the same grant", async () => {
		const patch = vi.fn().mockResolvedValue(undefined);
		const ctx = createAccessCtx({
			productAccessGrant: createProductAccessGrant("granted", {
				_id: "product_access_existing",
				source: "stripe_webhook",
				stripeCheckoutSessionId: "cs_123",
				updatedAt: 350,
			}),
			patch,
		});

		vi.spyOn(Date, "now").mockReturnValue(360);

		await expect(
			moduleUnderTest.grantProductAccessHandler(ctx as never, {
				clerkUserId,
				source: "stripe_checkout",
				stripeCustomerId: "cus_123",
				stripeCheckoutSessionId: "cs_123",
				stripePaymentIntentId: "pi_123",
				checkoutOfferId: "starter",
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
				capabilities: ["generate_codebase", "tutorials"],
				updatedAt: 360,
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
				checkoutOfferId: "starter",
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
				capabilities: ["generate_codebase", "tutorials"],
				offerIds: ["starter"],
				lastCheckoutOfferId: "starter",
				fulfillmentTrack: "generated_codebase",
				grantedAt: 400,
				updatedAt: 400,
			}),
		);
	});

	it("persists a viewer fulfillment choice without accepting a client owner id", async () => {
		const patch = vi.fn().mockResolvedValue(undefined);
		const ctx = createAccessCtx({
			productAccessGrant: createProductAccessGrant("granted", {
				_id: "product_access_existing",
				clerkUserId,
			}),
			patch,
		});
		ctx.auth.getUserIdentity.mockResolvedValue({
			subject: clerkUserId,
			tokenIdentifier: convexTokenIdentifier,
		});
		vi.spyOn(Date, "now").mockReturnValue(450);

		await expect(
			moduleUnderTest.resolveViewerFulfillmentTrackHandler(ctx as never, {
				fulfillmentTrack: "existing_codebase_doctor",
			}),
		).resolves.toEqual({
			fulfillmentTrack: "existing_codebase_doctor",
		});

		expect(patch).toHaveBeenCalledWith(
			"product_access_existing",
			expect.objectContaining({
				fulfillmentTrack: "existing_codebase_doctor",
				updatedAt: 450,
			}),
		);
	});

	it("rejects fulfillment choice rewrites after the track is resolved", async () => {
		const patch = vi.fn().mockResolvedValue(undefined);
		const ctx = createAccessCtx({
			productAccessGrant: createProductAccessGrant("granted", {
				_id: "product_access_existing",
				clerkUserId,
				buyerStartingPoint: "no_codebase",
				checkoutCtaId: "codebase_demo_generated",
				fulfillmentTrack: "generated_codebase",
			}),
			patch,
		});
		ctx.auth.getUserIdentity.mockResolvedValue({
			subject: clerkUserId,
			tokenIdentifier: convexTokenIdentifier,
		});

		await expect(
			moduleUnderTest.resolveViewerFulfillmentTrackHandler(ctx as never, {
				fulfillmentTrack: "existing_codebase_doctor",
				checkoutCtaId: "choice_existing",
			}),
		).rejects.toThrow("Fulfillment track already resolved");

		expect(patch).not.toHaveBeenCalled();
	});

	it("deletes an existing product-access grant when resetting access", async () => {
		const deleteMock = vi.fn().mockResolvedValue(undefined);
		const ctx = createAccessCtx({
			productAccessGrant: createProductAccessGrant("granted", {
				_id: "product_access_existing",
			}),
			deleteMock,
		});

		await expect(
			moduleUnderTest.resetProductAccessHandler(ctx as never, {
				clerkUserId,
			}),
		).resolves.toEqual({
			reset: "deleted",
		});
		expect(deleteMock).toHaveBeenCalledWith("product_access_existing");
	});

	it("returns noop when resetting a viewer without an access grant", async () => {
		const deleteMock = vi.fn().mockResolvedValue(undefined);
		const ctx = createAccessCtx({
			deleteMock,
		});

		await expect(
			moduleUnderTest.resetProductAccessHandler(ctx as never, {
				clerkUserId,
			}),
		).resolves.toEqual({
			reset: "noop",
		});
		expect(deleteMock).not.toHaveBeenCalled();
	});
});
