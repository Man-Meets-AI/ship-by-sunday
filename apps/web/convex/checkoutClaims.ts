import { ConvexError, v } from "convex/values";

import {
	getResolvedCheckoutIntentFields,
	normalizeCheckoutIntent,
	type BuyerStartingPoint,
	type CheckoutCtaId,
	type FulfillmentTrack,
} from "../src/platform/billing/checkout/checkout-intent";
import {
	getCheckoutOffer,
	getCheckoutOfferIdForLegacyFulfillmentTrack,
	type CheckoutOfferId,
} from "../src/platform/billing/checkout/checkout-offers";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
	action,
	internalMutation,
	internalQuery,
	mutation,
} from "./_generated/server";
import type { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";
import { upsertProductAccessGrant } from "./entitlements/model";
import { productAccessGrantResultValidator } from "./entitlements/validators";
import {
	checkoutBuyerStartingPointValidator,
	checkoutCtaIdValidator,
	checkoutFulfillmentTrackValidator,
	checkoutOfferIdValidator,
} from "./billing/validators";
import { requireConvexEnv } from "./env";

const pendingCheckoutClaimStatusValidator = v.union(
	v.literal("pending"),
	v.literal("claimed"),
);

const checkoutSurfaceValidator = v.union(
	v.literal("hosted_checkout"),
	v.literal("express_checkout"),
);

const checkoutPurchaseIntentCreateResultValidator = v.object({
	purchaseIntentId: v.id("checkoutPurchaseIntents"),
});

const checkoutPurchaseIntentAttachResultValidator = v.object({
	attached: v.union(v.literal("attached"), v.literal("already_attached")),
});

const checkoutPurchaseIntentFulfillmentResultValidator = v.object({
	fulfilled: v.union(v.literal("fulfilled"), v.literal("missing_intent")),
});

type CheckoutPurchaseIntentCreateResult = {
	purchaseIntentId: Id<"checkoutPurchaseIntents">;
};

type CheckoutPurchaseIntentAttachResult = {
	attached: "attached" | "already_attached";
};

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
		checkoutPurchaseIntentId: v.optional(v.id("checkoutPurchaseIntents")),
		offerId: v.optional(checkoutOfferIdValidator),
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

function assertConvexWebhookMutationSecret(
	convexWebhookMutationSecret: string,
) {
	if (
		convexWebhookMutationSecret !==
		requireConvexEnv("CONVEX_WEBHOOK_MUTATION_SECRET")
	) {
		throw new Error("Unauthorized checkout claim sync call.");
	}
}

function getCheckoutOfferGrantFields(
	offerId: CheckoutOfferId | undefined,
	fallbackFulfillmentTrack?: FulfillmentTrack,
) {
	const resolvedOfferId =
		offerId ??
		(fallbackFulfillmentTrack
			? getCheckoutOfferIdForLegacyFulfillmentTrack(fallbackFulfillmentTrack)
			: undefined) ??
		"starter";
	const offer = getCheckoutOffer(resolvedOfferId);
	return {
		checkoutOfferId: resolvedOfferId,
		capabilities: [...offer.capabilities],
		fulfillmentTrack: offer.fulfillmentTrack,
	};
}

const hostedCheckoutProofTokenIdentifier =
	"release-proof:hosted-checkout-billing";

async function assertCheckoutPurchaseIntentWriteAllowed(
	ctx: ActionCtx,
	checkoutServerToken?: string,
) {
	const identity = await ctx.auth.getUserIdentity();
	if (identity?.tokenIdentifier === hostedCheckoutProofTokenIdentifier) {
		return;
	}

	if (
		!checkoutServerToken ||
		checkoutServerToken !==
			requireConvexEnv("CHECKOUT_FULFILLMENT_RETRY_SECRET")
	) {
		throw new ConvexError("Unauthorized checkout purchase intent write");
	}
}

export const createCheckoutPurchaseIntent = action({
	args: {
		checkoutServerToken: v.optional(v.string()),
		clerkUserId: v.optional(v.string()),
		checkoutEmail: v.optional(v.string()),
		checkoutSurface: checkoutSurfaceValidator,
		offerId: checkoutOfferIdValidator,
	},
	returns: checkoutPurchaseIntentCreateResultValidator,
	handler: async (ctx, args): Promise<CheckoutPurchaseIntentCreateResult> => {
		await assertCheckoutPurchaseIntentWriteAllowed(
			ctx,
			args.checkoutServerToken,
		);
		return await ctx.runMutation(
			internal.checkoutClaims.createCheckoutPurchaseIntentRecord,
			{
				clerkUserId: args.clerkUserId,
				checkoutEmail: args.checkoutEmail,
				checkoutSurface: args.checkoutSurface,
				offerId: args.offerId,
			},
		);
	},
});

export const createCheckoutPurchaseIntentRecord = internalMutation({
	args: {
		clerkUserId: v.optional(v.string()),
		checkoutEmail: v.optional(v.string()),
		checkoutSurface: checkoutSurfaceValidator,
		offerId: checkoutOfferIdValidator,
	},
	returns: checkoutPurchaseIntentCreateResultValidator,
	handler: async (ctx, args) => {
		const now = Date.now();
		const checkoutEmail = args.checkoutEmail?.trim();
		const purchaseIntentId = await ctx.db.insert("checkoutPurchaseIntents", {
			clerkUserId: args.clerkUserId,
			checkoutEmail: checkoutEmail || undefined,
			checkoutEmailNormalized: checkoutEmail
				? normalizeCheckoutEmail(checkoutEmail)
				: undefined,
			checkoutSurface: args.checkoutSurface,
			offerId: args.offerId,
			status: "created",
			createdAt: now,
			updatedAt: now,
		});

		return { purchaseIntentId };
	},
});

export const attachStripeCheckoutSessionToPurchaseIntent = action({
	args: {
		checkoutServerToken: v.optional(v.string()),
		purchaseIntentId: v.id("checkoutPurchaseIntents"),
		stripeCheckoutSessionId: v.string(),
	},
	returns: checkoutPurchaseIntentAttachResultValidator,
	handler: async (ctx, args): Promise<CheckoutPurchaseIntentAttachResult> => {
		await assertCheckoutPurchaseIntentWriteAllowed(
			ctx,
			args.checkoutServerToken,
		);
		return await ctx.runMutation(
			internal.checkoutClaims.attachStripeCheckoutSessionToPurchaseIntentRecord,
			{
				purchaseIntentId: args.purchaseIntentId,
				stripeCheckoutSessionId: args.stripeCheckoutSessionId,
			},
		);
	},
});

export const attachStripeCheckoutSessionToPurchaseIntentRecord =
	internalMutation({
		args: {
			purchaseIntentId: v.id("checkoutPurchaseIntents"),
			stripeCheckoutSessionId: v.string(),
		},
		returns: checkoutPurchaseIntentAttachResultValidator,
		handler: async (ctx, args) => {
			const purchaseIntent = await ctx.db.get(args.purchaseIntentId);
			if (!purchaseIntent) {
				throw new ConvexError("Checkout purchase intent not found");
			}
			if (
				purchaseIntent.stripeCheckoutSessionId === args.stripeCheckoutSessionId
			) {
				return { attached: "already_attached" as const };
			}
			if (purchaseIntent.stripeCheckoutSessionId) {
				throw new ConvexError(
					"Checkout purchase intent already has a Stripe session",
				);
			}

			await ctx.db.patch(args.purchaseIntentId, {
				stripeCheckoutSessionId: args.stripeCheckoutSessionId,
				status: "stripe_session_attached",
				updatedAt: Date.now(),
			});

			return { attached: "attached" as const };
		},
	});

async function recordCheckoutPurchaseIntentFulfillmentInTransaction(
	ctx: MutationCtx,
	{
		checkoutPurchaseIntentId,
		stripeCheckoutSessionId,
		clerkUserId,
	}: {
		checkoutPurchaseIntentId: Id<"checkoutPurchaseIntents"> | undefined;
		stripeCheckoutSessionId: string;
		clerkUserId?: string;
	},
) {
	if (!checkoutPurchaseIntentId) {
		return null;
	}

	const purchaseIntent = await ctx.db.get(checkoutPurchaseIntentId);
	if (!purchaseIntent) {
		return { fulfilled: "missing_intent" as const };
	}

	if (
		purchaseIntent.stripeCheckoutSessionId &&
		purchaseIntent.stripeCheckoutSessionId !== stripeCheckoutSessionId
	) {
		throw new ConvexError(
			"Checkout purchase intent belongs to a different Stripe session",
		);
	}

	const now = Date.now();
	await ctx.db.patch(checkoutPurchaseIntentId, {
		clerkUserId: clerkUserId ?? purchaseIntent.clerkUserId,
		stripeCheckoutSessionId,
		status: "fulfilled",
		fulfilledAt: now,
		updatedAt: now,
	});

	return { fulfilled: "fulfilled" as const };
}

function assertPurchaseIntentFulfilled(
	result: Awaited<
		ReturnType<typeof recordCheckoutPurchaseIntentFulfillmentInTransaction>
	>,
) {
	if (result?.fulfilled === "missing_intent") {
		throw new ConvexError("Checkout purchase intent not found");
	}
}

const grantProductAccessForCheckoutSessionArgs = {
	clerkUserId: v.string(),
	source: v.union(v.literal("stripe_checkout"), v.literal("stripe_webhook")),
	stripeCustomerId: v.optional(v.string()),
	stripeCheckoutSessionId: v.string(),
	stripePaymentIntentId: v.optional(v.string()),
	checkoutPurchaseIntentId: v.optional(v.id("checkoutPurchaseIntents")),
	offerId: v.optional(checkoutOfferIdValidator),
	buyerStartingPoint: v.optional(checkoutBuyerStartingPointValidator),
	checkoutCtaId: v.optional(checkoutCtaIdValidator),
	fulfillmentTrack: v.optional(checkoutFulfillmentTrackValidator),
} as const;

type GrantProductAccessForCheckoutSessionArgs = {
	clerkUserId: string;
	source: "stripe_checkout" | "stripe_webhook";
	stripeCustomerId?: string;
	stripeCheckoutSessionId: string;
	stripePaymentIntentId?: string;
	checkoutPurchaseIntentId?: Id<"checkoutPurchaseIntents">;
	offerId?: CheckoutOfferId;
	buyerStartingPoint?: BuyerStartingPoint;
	checkoutCtaId?: CheckoutCtaId;
	fulfillmentTrack?: FulfillmentTrack;
};

async function grantProductAccessForCheckoutSessionHandler(
	ctx: MutationCtx,
	args: GrantProductAccessForCheckoutSessionArgs,
) {
	const grantResult = await upsertProductAccessGrant(ctx, {
		clerkUserId: args.clerkUserId,
		source: args.source,
		stripeCustomerId: args.stripeCustomerId,
		stripeCheckoutSessionId: args.stripeCheckoutSessionId,
		stripePaymentIntentId: args.stripePaymentIntentId,
		buyerStartingPoint: args.buyerStartingPoint,
		checkoutCtaId: args.checkoutCtaId,
		...getCheckoutOfferGrantFields(args.offerId, args.fulfillmentTrack),
	});
	assertPurchaseIntentFulfilled(
		await recordCheckoutPurchaseIntentFulfillmentInTransaction(ctx, {
			checkoutPurchaseIntentId: args.checkoutPurchaseIntentId,
			stripeCheckoutSessionId: args.stripeCheckoutSessionId,
			clerkUserId: args.clerkUserId,
		}),
	);

	return grantResult;
}

export const grantProductAccessForCheckoutSession = internalMutation({
	args: grantProductAccessForCheckoutSessionArgs,
	returns: productAccessGrantResultValidator,
	handler: async (ctx, args) => {
		return await grantProductAccessForCheckoutSessionHandler(ctx, args);
	},
});

export const grantProductAccessForCheckoutSessionFromServer = mutation({
	args: {
		convexWebhookMutationSecret: v.string(),
		...grantProductAccessForCheckoutSessionArgs,
	},
	returns: productAccessGrantResultValidator,
	handler: async (ctx, args) => {
		assertConvexWebhookMutationSecret(args.convexWebhookMutationSecret);
		const { convexWebhookMutationSecret: _secret, ...grantArgs } = args;
		return await grantProductAccessForCheckoutSessionHandler(ctx, grantArgs);
	},
});

export const recordCheckoutPurchaseIntentFulfillment = internalMutation({
	args: {
		purchaseIntentId: v.id("checkoutPurchaseIntents"),
		stripeCheckoutSessionId: v.string(),
		clerkUserId: v.optional(v.string()),
	},
	returns: checkoutPurchaseIntentFulfillmentResultValidator,
	handler: async (ctx, args) => {
		const result = await recordCheckoutPurchaseIntentFulfillmentInTransaction(
			ctx,
			{
				checkoutPurchaseIntentId: args.purchaseIntentId,
				stripeCheckoutSessionId: args.stripeCheckoutSessionId,
				clerkUserId: args.clerkUserId,
			},
		);
		if (result?.fulfilled === "missing_intent") {
			return result;
		}

		return { fulfilled: "fulfilled" as const };
	},
});

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
		checkoutPurchaseIntentId: v.optional(v.id("checkoutPurchaseIntents")),
		offerId: v.optional(checkoutOfferIdValidator),
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
				checkoutPurchaseIntentId:
					args.checkoutPurchaseIntentId ??
					existingClaim.checkoutPurchaseIntentId,
				offerId: args.offerId ?? existingClaim.offerId,
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
			checkoutPurchaseIntentId: args.checkoutPurchaseIntentId,
			offerId: args.offerId,
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

		const checkoutIntent = getPendingCheckoutClaimIntentFields(existingClaim);
		const grantResult = await upsertProductAccessGrant(ctx, {
			clerkUserId: viewerIdentity.clerkUserId,
			source: "stripe_checkout",
			stripeCustomerId: existingClaim.stripeCustomerId,
			stripeCheckoutSessionId: existingClaim.stripeCheckoutSessionId,
			stripePaymentIntentId: existingClaim.stripePaymentIntentId,
			buyerStartingPoint: checkoutIntent.buyerStartingPoint,
			checkoutCtaId: checkoutIntent.checkoutCtaId,
			...getCheckoutOfferGrantFields(
				existingClaim.offerId,
				checkoutIntent.fulfillmentTrack,
			),
		});
		assertPurchaseIntentFulfilled(
			await recordCheckoutPurchaseIntentFulfillmentInTransaction(ctx, {
				checkoutPurchaseIntentId: existingClaim.checkoutPurchaseIntentId,
				stripeCheckoutSessionId: existingClaim.stripeCheckoutSessionId,
				clerkUserId: viewerIdentity.clerkUserId,
			}),
		);

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
		const checkoutIntent = getPendingCheckoutClaimIntentFields(existingClaim);
		const grantResult = await upsertProductAccessGrant(ctx, {
			clerkUserId,
			source: "stripe_checkout",
			stripeCustomerId: existingClaim.stripeCustomerId,
			stripeCheckoutSessionId: existingClaim.stripeCheckoutSessionId,
			stripePaymentIntentId: existingClaim.stripePaymentIntentId,
			buyerStartingPoint: checkoutIntent.buyerStartingPoint,
			checkoutCtaId: checkoutIntent.checkoutCtaId,
			...getCheckoutOfferGrantFields(
				existingClaim.offerId,
				checkoutIntent.fulfillmentTrack,
			),
		});
		assertPurchaseIntentFulfilled(
			await recordCheckoutPurchaseIntentFulfillmentInTransaction(ctx, {
				checkoutPurchaseIntentId: existingClaim.checkoutPurchaseIntentId,
				stripeCheckoutSessionId: existingClaim.stripeCheckoutSessionId,
				clerkUserId,
			}),
		);

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
