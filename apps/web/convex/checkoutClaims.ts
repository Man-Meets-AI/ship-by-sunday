import { ConvexError, v } from "convex/values";

import {
	getResolvedCheckoutIntentFields,
	normalizeCheckoutIntent,
	type BuyerStartingPoint,
	type CheckoutCtaId,
	type FulfillmentTrack,
} from "../platform/billing/checkout/checkout-intent";
import { internalMutation, internalQuery } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { upsertProductAccessGrant } from "./access/model";
import {
	checkoutBuyerStartingPointValidator,
	checkoutCtaIdValidator,
	checkoutFulfillmentTrackValidator,
} from "./checkoutIntentValidators";

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
		buyerStartingPoint: v.optional(checkoutBuyerStartingPointValidator),
		checkoutCtaId: v.optional(checkoutCtaIdValidator),
		fulfillmentTrack: v.optional(checkoutFulfillmentTrackValidator),
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

export const pendingCheckoutClaimResetResultValidator = v.object({
	reset: v.union(v.literal("deleted"), v.literal("noop")),
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

const paidCheckoutClaimRepairResultValidator = v.union(
	v.object({
		repair: v.literal("repaired"),
		grantResult: v.object({
			granted: v.union(v.literal("inserted"), v.literal("patched")),
		}),
	}),
	v.object({
		repair: v.literal("already_claimed_by_target"),
		grantResult: v.object({
			granted: v.union(v.literal("inserted"), v.literal("patched")),
		}),
	}),
	v.object({
		repair: v.literal("claimed_by_other_user"),
	}),
	v.object({
		repair: v.literal("missing_claim"),
	}),
	v.object({
		repair: v.literal("payment_not_paid"),
	}),
	v.object({
		repair: v.literal("checkout_email_mismatch"),
	}),
);

export function normalizeCheckoutEmail(email: string) {
	return email.trim().toLowerCase();
}

function requireNonEmptySupportInput(value: string, fieldName: string) {
	const trimmedValue = value.trim();
	if (!trimmedValue) {
		throw new ConvexError(`${fieldName} is required`);
	}

	return trimmedValue;
}

function isRepairableCheckoutPaymentStatus(paymentStatus: unknown) {
	return paymentStatus === "paid" || paymentStatus === "no_payment_required";
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
		.withIndex(
			"by_checkout_email_normalized_and_status_and_updated_at",
			(queryBuilder) =>
				queryBuilder
					.eq("checkoutEmailNormalized", checkoutEmailNormalized)
					.eq("status", "pending"),
		)
		.order("desc")
		.take(1);

	return matchingClaims[0] ?? null;
}

function getPendingCheckoutClaimIntentFields(
	claim: {
		buyerStartingPoint?: BuyerStartingPoint;
		checkoutCtaId?: CheckoutCtaId;
		fulfillmentTrack?: FulfillmentTrack;
	} | null,
) {
	return normalizeCheckoutIntent(claim);
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
		buyerStartingPoint: v.optional(checkoutBuyerStartingPointValidator),
		checkoutCtaId: v.optional(checkoutCtaIdValidator),
		fulfillmentTrack: v.optional(checkoutFulfillmentTrackValidator),
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
		const checkoutIntent = existingClaim
			? getResolvedCheckoutIntentFields(existingClaim, args)
			: getPendingCheckoutClaimIntentFields(args);

		if (existingClaim) {
			await ctx.db.patch(existingClaim._id, {
				checkoutEmail: args.checkoutEmail,
				checkoutEmailNormalized,
				courseSlug: args.courseSlug,
				paymentStatus: args.paymentStatus,
				stripeCustomerId: args.stripeCustomerId,
				stripePaymentIntentId: args.stripePaymentIntentId,
				buyerStartingPoint: checkoutIntent.buyerStartingPoint,
				checkoutCtaId: checkoutIntent.checkoutCtaId,
				fulfillmentTrack: checkoutIntent.fulfillmentTrack,
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
			buyerStartingPoint: checkoutIntent.buyerStartingPoint,
			checkoutCtaId: checkoutIntent.checkoutCtaId,
			fulfillmentTrack: checkoutIntent.fulfillmentTrack,
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
			...getPendingCheckoutClaimIntentFields(existingClaim),
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

export const repairPaidCheckoutClaim = internalMutation({
	args: {
		stripeCheckoutSessionId: v.string(),
		checkoutEmail: v.string(),
		clerkUserId: v.string(),
	},
	returns: paidCheckoutClaimRepairResultValidator,
	handler: async (ctx, args) => {
		const stripeCheckoutSessionId = requireNonEmptySupportInput(
			args.stripeCheckoutSessionId,
			"stripeCheckoutSessionId",
		);
		const checkoutEmailNormalized = normalizeCheckoutEmail(
			requireNonEmptySupportInput(args.checkoutEmail, "checkoutEmail"),
		);
		const clerkUserId = requireNonEmptySupportInput(
			args.clerkUserId,
			"clerkUserId",
		);
		const existingClaim = await getPendingCheckoutClaimBySessionIdRecord(
			ctx,
			stripeCheckoutSessionId,
		);

		if (!existingClaim) {
			return {
				repair: "missing_claim" as const,
			};
		}

		if (existingClaim.checkoutEmailNormalized !== checkoutEmailNormalized) {
			return {
				repair: "checkout_email_mismatch" as const,
			};
		}

		if (!isRepairableCheckoutPaymentStatus(existingClaim.paymentStatus)) {
			return {
				repair: "payment_not_paid" as const,
			};
		}

		if (
			existingClaim.claimedByClerkUserId &&
			existingClaim.claimedByClerkUserId !== clerkUserId
		) {
			return {
				repair: "claimed_by_other_user" as const,
			};
		}

		if (
			existingClaim.status === "claimed" &&
			existingClaim.claimedByClerkUserId !== clerkUserId
		) {
			return {
				repair: "claimed_by_other_user" as const,
			};
		}

		const now = Date.now();
		const grantResult = await upsertProductAccessGrant(ctx, {
			clerkUserId,
			source: "stripe_checkout",
			stripeCustomerId: existingClaim.stripeCustomerId,
			stripeCheckoutSessionId: existingClaim.stripeCheckoutSessionId,
			stripePaymentIntentId: existingClaim.stripePaymentIntentId,
			...getPendingCheckoutClaimIntentFields(existingClaim),
		});

		if (existingClaim.status === "claimed") {
			await ctx.db.patch(existingClaim._id, {
				updatedAt: now,
			});

			return {
				repair: "already_claimed_by_target" as const,
				grantResult,
			};
		}

		await ctx.db.patch(existingClaim._id, {
			status: "claimed",
			claimedByClerkUserId: clerkUserId,
			claimedAt: now,
			updatedAt: now,
		});

		return {
			repair: "repaired" as const,
			grantResult,
		};
	},
});

export const resetPendingCheckoutClaimsForEmail = internalMutation({
	args: {
		checkoutEmail: v.string(),
	},
	returns: pendingCheckoutClaimResetResultValidator,
	handler: async (ctx, args) => {
		const checkoutEmailNormalized = normalizeCheckoutEmail(args.checkoutEmail);
		let deletedAny = false;

		while (true) {
			const claimsToDelete = await ctx.db
				.query("pendingCheckoutClaims")
				.withIndex(
					"by_checkout_email_normalized_and_status_and_updated_at",
					(queryBuilder) =>
						queryBuilder
							.eq("checkoutEmailNormalized", checkoutEmailNormalized)
							.eq("status", "pending"),
				)
				.take(50);

			if (claimsToDelete.length === 0) {
				return {
					reset: deletedAny ? ("deleted" as const) : ("noop" as const),
				};
			}

			deletedAny = true;
			for (const claim of claimsToDelete) {
				await ctx.db.delete(claim._id);
			}
		}
	},
});
