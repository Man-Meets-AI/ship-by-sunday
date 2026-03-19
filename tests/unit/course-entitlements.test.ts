import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { COURSE_SLUG } from "@/features/course/lesson/model";

const clerkUserId = "user_entitlement_123";

function createEntitlement(
	status: "active" | "pending" | "revoked" | "refunded",
	overrides: Record<string, unknown> = {},
) {
	return {
		_id: "entitlement_1",
		_creationTime: 1,
		clerkUserId,
		courseSlug: COURSE_SLUG,
		status,
		source: "manual",
		grantedAt: 10,
		updatedAt: 10,
		...overrides,
	};
}

function createCourseCtx({
	entitlement = null,
	patch = vi.fn().mockResolvedValue(undefined),
	insert = vi.fn().mockResolvedValue("entitlement_1"),
}: {
	entitlement?: Record<string, unknown> | null;
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
					unique: vi.fn().mockResolvedValue(entitlement),
				})),
			})),
			patch,
			insert,
		},
	};
}

describe("convex/course/entitlements", () => {
	let moduleUnderTest: typeof import("@/convex/course/entitlements");
	const originalEnv = { ...process.env };

	beforeEach(async () => {
		process.env = {
			...originalEnv,
			STRIPE_WEBHOOK_SECRET: "stripe_webhook_secret",
		};
		vi.resetModules();
		moduleUnderTest = await import("@/convex/course/entitlements");
	});

	afterEach(() => {
		process.env = { ...originalEnv };
		vi.restoreAllMocks();
	});

	it("marks signed-out viewers as lacking access", async () => {
		const ctx = createCourseCtx();
		ctx.auth.getUserIdentity.mockResolvedValue(null);

		await expect(
			moduleUnderTest.viewerAccessHandler(ctx as never),
		).resolves.toEqual({
			clerkUserId: null,
			courseSlug: COURSE_SLUG,
			hasAccess: false,
			status: "signed_out",
		});
	});

	it("marks a signed-in viewer without entitlement as needing access", async () => {
		const ctx = createCourseCtx();
		ctx.auth.getUserIdentity.mockResolvedValue({ subject: clerkUserId });

		await expect(
			moduleUnderTest.viewerAccessHandler(ctx as never),
		).resolves.toEqual({
			clerkUserId,
			courseSlug: COURSE_SLUG,
			hasAccess: false,
			status: "none",
		});
	});

	it("marks an entitled viewer as active", async () => {
		const ctx = createCourseCtx({
			entitlement: createEntitlement("active"),
		});
		ctx.auth.getUserIdentity.mockResolvedValue({ subject: clerkUserId });

		await expect(
			moduleUnderTest.viewerAccessHandler(ctx as never),
		).resolves.toEqual({
			clerkUserId,
			courseSlug: COURSE_SLUG,
			hasAccess: true,
			status: "active",
		});
	});

	it("inserts a new entitlement from the manual grant path", async () => {
		const insert = vi.fn().mockResolvedValue("entitlement_1");
		const ctx = createCourseCtx({
			insert,
		});

		vi.spyOn(Date, "now").mockReturnValue(200);

		await expect(
			moduleUnderTest.grantEntitlementHandler(ctx as never, {
				clerkUserId,
				source: "manual",
			}),
		).resolves.toEqual({
			courseSlug: COURSE_SLUG,
			granted: "inserted",
		});
		expect(insert).toHaveBeenCalledWith(
			"courseEntitlements",
			expect.objectContaining({
				clerkUserId,
				courseSlug: COURSE_SLUG,
				status: "active",
				source: "manual",
				grantedAt: 200,
				updatedAt: 200,
			}),
		);
	});

	it("patches an existing entitlement instead of creating a duplicate", async () => {
		const patch = vi.fn().mockResolvedValue(undefined);
		const ctx = createCourseCtx({
			entitlement: createEntitlement("pending", {
				_id: "entitlement_existing",
				source: "stripe_checkout",
				updatedAt: 25,
			}),
			patch,
		});

		vi.spyOn(Date, "now").mockReturnValue(300);

		await expect(
			moduleUnderTest.grantEntitlementHandler(ctx as never, {
				clerkUserId,
				courseSlug: COURSE_SLUG,
				source: "stripe_webhook",
				stripeCustomerId: "cus_123",
				stripeCheckoutSessionId: "cs_123",
				stripePaymentIntentId: "pi_123",
			}),
		).resolves.toEqual({
			courseSlug: COURSE_SLUG,
			granted: "patched",
		});
		expect(patch).toHaveBeenCalledWith(
			"entitlement_existing",
			expect.objectContaining({
				status: "active",
				source: "stripe_webhook",
				stripeCustomerId: "cus_123",
				stripeCheckoutSessionId: "cs_123",
				stripePaymentIntentId: "pi_123",
				updatedAt: 300,
				revokedAt: undefined,
			}),
		);
	});

	it("rejects a mismatched Stripe webhook secret before mutating entitlements", async () => {
		const ctx = createCourseCtx();

		await expect(
			moduleUnderTest.grantEntitlementFromStripeHandler(ctx as never, {
				webhookSecret: "wrong_secret",
				clerkUserId,
				courseSlug: COURSE_SLUG,
			}),
		).rejects.toThrow("Invalid webhook secret");
		expect(ctx.db.insert).not.toHaveBeenCalled();
		expect(ctx.db.patch).not.toHaveBeenCalled();
	});
});
