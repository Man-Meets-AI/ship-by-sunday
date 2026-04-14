import { v } from "convex/values";

import { ConvexError } from "convex/values";

import { internalMutation, internalQuery } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { upsertProductAccessGrant } from "./access/model";

const pendingCheckoutClaimStatusValidator = v.union(
	v.literal("pending"),
	v.literal("claimed"),
);

const pendingCheckoutClaimReturnValidator = v.union(
	v.object({
		_id: v.id("pendingCheckoutClaims"),
		_creationTime: v.number(),
		stripeCheckoutSessionId: v.string(),
		checkoutEmail: v.string(),
		checkoutEmailNormalized: v.string(),
		courseSlug: v.string(),
		paymentStatus: v.union(v.literal("paid"), v.literal("no_payment_required")),
		stripeCustomerId: v.optional(v.string()),
		stripePaymentIntentId: v.optional(v.string()),
		stripeEventId: v.string(),
		stripeEventType: v.string(),
		status: pendingCheckoutClaimStatusValidator,
		claimedByClerkUserId: v.optional(v.string()),
		claimedAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	}),
	v.null(),
);

export const pendingCheckoutClaimWriteResultValidator = v.object({
	saved: v.union(v.literal("inserted"), v.literal("patched")),
});

const pendingCheckoutClaimClaimResultValidator = v.union(
	v.object({
		claim: v.literal("claimed"),
		grantResult: v.object({
			granted: v.union(v.literal("inserted"), v.literal("patched")),
		}),
	}),
	v.object({
		claim: v.literal("already_claimed"),
		grantResult: v.object({
			granted: v.union(v.literal("inserted"), v.literal("patched")),
		}),
	}),
	v.object({
		claim: v.literal("claimed_by_other_user"),
	}),
	v.object({
		claim: v.literal("missing_claim"),
	}),
	v.object({
		claim: v.literal("email_not_verified"),
	}),
	v.object({
		claim: v.literal("email_mismatch"),
	}),
);

export function normalizeCheckoutEmail(email: string) {
	return email.trim().toLowerCase();
}

function requireVerifiedViewerIdentity(ctx: MutationCtx) {
	return ctx.auth.getUserIdentity().then((identity) => {
		if (!identity) {
			throw new ConvexError("Unauthorized");
		}

		if (!identity.email || !identity.emailVerified) {
			return null;
		}

		return {
			clerkUserId: identity.subject,
			email: normalizeCheckoutEmail(identity.email),
		};
	});
}

async function getPendingCheckoutClaimBySessionIdRecord(
	ctx: MutationCtx | QueryCtx,
	stripeCheckoutSessionId: string,
) {
	return ctx.db
		.query("pendingCheckoutClaims")
		.withIndex("by_stripe_checkout_session_id", (queryBuilder) =>
			queryBuilder.eq("stripeCheckoutSessionId", stripeCheckoutSessionId),
		)
		.unique();
}

async function getLatestCheckoutClaimByEmailRecord(
	ctx: MutationCtx | QueryCtx,
	checkoutEmailNormalized: string,
) {
	const matchingClaims = await ctx.db
		.query("pendingCheckoutClaims")
		.withIndex("by_checkout_email_normalized", (queryBuilder) =>
			queryBuilder.eq("checkoutEmailNormalized", checkoutEmailNormalized),
		)
		.collect();

	return matchingClaims.reduce<(typeof matchingClaims)[number] | null>(
		(latestClaim, currentClaim) => {
			if (!latestClaim) {
				return currentClaim;
			}

			return currentClaim.updatedAt > latestClaim.updatedAt
				? currentClaim
				: latestClaim;
		},
		null,
	);
}

export const getPendingCheckoutClaimBySessionId = internalQuery({
	args: {
		stripeCheckoutSessionId: v.string(),
	},
	returns: pendingCheckoutClaimReturnValidator,
	handler: async (ctx, args) =>
		await getPendingCheckoutClaimBySessionIdRecord(
			ctx,
			args.stripeCheckoutSessionId,
		),
});

export const getLatestCheckoutClaimByEmail = internalQuery({
	args: {
		checkoutEmailNormalized: v.string(),
	},
	returns: pendingCheckoutClaimReturnValidator,
	handler: async (ctx, args) =>
		await getLatestCheckoutClaimByEmailRecord(
			ctx,
			args.checkoutEmailNormalized,
		),
});

export const upsertPendingCheckoutClaimFromStripe = internalMutation({
	args: {
		stripeCheckoutSessionId: v.string(),
		checkoutEmail: v.string(),
		courseSlug: v.string(),
		paymentStatus: v.union(v.literal("paid"), v.literal("no_payment_required")),
		stripeCustomerId: v.optional(v.string()),
		stripePaymentIntentId: v.optional(v.string()),
		stripeEventId: v.string(),
		stripeEventType: v.string(),
	},
	returns: pendingCheckoutClaimWriteResultValidator,
	handler: async (ctx, args) => {
		const now = Date.now();
		const existingClaim = await getPendingCheckoutClaimBySessionIdRecord(
			ctx,
			args.stripeCheckoutSessionId,
		);
		const checkoutEmailNormalized = normalizeCheckoutEmail(args.checkoutEmail);

		if (existingClaim) {
			await ctx.db.patch(existingClaim._id, {
				checkoutEmail: args.checkoutEmail,
				checkoutEmailNormalized,
				courseSlug: args.courseSlug,
				paymentStatus: args.paymentStatus,
				stripeCustomerId: args.stripeCustomerId,
				stripePaymentIntentId: args.stripePaymentIntentId,
				stripeEventId: args.stripeEventId,
				stripeEventType: args.stripeEventType,
				updatedAt: now,
			});

			return {
				saved: "patched" as const,
			};
		}

		await ctx.db.insert("pendingCheckoutClaims", {
			stripeCheckoutSessionId: args.stripeCheckoutSessionId,
			checkoutEmail: args.checkoutEmail,
			checkoutEmailNormalized,
			courseSlug: args.courseSlug,
			paymentStatus: args.paymentStatus,
			stripeCustomerId: args.stripeCustomerId,
			stripePaymentIntentId: args.stripePaymentIntentId,
			stripeEventId: args.stripeEventId,
			stripeEventType: args.stripeEventType,
			status: "pending",
			createdAt: now,
			updatedAt: now,
		});

		return {
			saved: "inserted" as const,
		};
	},
});

export const claimPendingCheckoutClaim = internalMutation({
	args: {
		stripeCheckoutSessionId: v.string(),
	},
	returns: pendingCheckoutClaimClaimResultValidator,
	handler: async (ctx, args) => {
		const viewerIdentity = await requireVerifiedViewerIdentity(ctx);
		if (!viewerIdentity) {
			return {
				claim: "email_not_verified" as const,
			};
		}

		const now = Date.now();
		const existingClaim = await getPendingCheckoutClaimBySessionIdRecord(
			ctx,
			args.stripeCheckoutSessionId,
		);

		if (!existingClaim) {
			return {
				claim: "missing_claim" as const,
			};
		}

		if (
			existingClaim.status === "claimed" &&
			existingClaim.claimedByClerkUserId &&
			existingClaim.claimedByClerkUserId !== viewerIdentity.clerkUserId
		) {
			return {
				claim: "claimed_by_other_user" as const,
			};
		}

		if (existingClaim.checkoutEmailNormalized !== viewerIdentity.email) {
			return {
				claim: "email_mismatch" as const,
			};
		}

		const grantResult = await upsertProductAccessGrant(ctx, {
			clerkUserId: viewerIdentity.clerkUserId,
			source: "stripe_checkout",
			stripeCustomerId: existingClaim.stripeCustomerId,
			stripeCheckoutSessionId: existingClaim.stripeCheckoutSessionId,
			stripePaymentIntentId: existingClaim.stripePaymentIntentId,
		});

		if (existingClaim.status === "claimed") {
			await ctx.db.patch(existingClaim._id, {
				updatedAt: now,
			});

			return {
				claim: "already_claimed" as const,
				grantResult,
			};
		}

		await ctx.db.patch(existingClaim._id, {
			status: "claimed",
			claimedByClerkUserId: viewerIdentity.clerkUserId,
			claimedAt: now,
			updatedAt: now,
		});

		return {
			claim: "claimed" as const,
			grantResult,
		};
	},
});
