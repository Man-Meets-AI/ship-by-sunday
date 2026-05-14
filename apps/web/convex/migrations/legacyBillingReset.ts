import { v } from "convex/values";

import { internalMutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";

const legacyBillingAccessResetConfirmation =
	"reset_legacy_billing_access_state";
const maxLegacyBillingAccessResetBatchSize = 100;

const resetTableResultValidator = v.object({
	matched: v.number(),
	deleted: v.number(),
	hasMore: v.boolean(),
});

const resetLegacyBillingAccessStateResultValidator = v.object({
	dryRun: v.boolean(),
	batchSize: v.number(),
	tables: v.object({
		productAccessGrants: resetTableResultValidator,
		checkoutPurchaseIntents: resetTableResultValidator,
		pendingCheckoutClaims: resetTableResultValidator,
		stripeWebhookEvents: resetTableResultValidator,
	}),
	hasMore: v.boolean(),
});

type LegacyBillingAccessTableName =
	| "productAccessGrants"
	| "checkoutPurchaseIntents"
	| "pendingCheckoutClaims"
	| "stripeWebhookEvents";

function getBoundedBatchSize(batchSize: number | undefined) {
	if (batchSize === undefined) {
		return maxLegacyBillingAccessResetBatchSize;
	}

	if (!Number.isInteger(batchSize) || batchSize < 1) {
		return 1;
	}

	return Math.min(batchSize, maxLegacyBillingAccessResetBatchSize);
}

async function resetLegacyBillingAccessTable(
	ctx: MutationCtx,
	tableName: LegacyBillingAccessTableName,
	{
		batchSize,
		dryRun,
	}: {
		batchSize: number;
		dryRun: boolean;
	},
) {
	const matchedDocuments = await ctx.db.query(tableName).take(batchSize + 1);
	const documentsToDelete = matchedDocuments.slice(0, batchSize);

	if (!dryRun) {
		for (const document of documentsToDelete) {
			await ctx.db.delete(document._id);
		}
	}

	return {
		matched: documentsToDelete.length,
		deleted: dryRun ? 0 : documentsToDelete.length,
		hasMore: matchedDocuments.length > batchSize,
	};
}

export const resetLegacyBillingAccessState = internalMutation({
	args: {
		confirmation: v.literal(legacyBillingAccessResetConfirmation),
		dryRun: v.optional(v.boolean()),
		batchSize: v.optional(v.number()),
	},
	returns: resetLegacyBillingAccessStateResultValidator,
	handler: async (ctx, args) => {
		const dryRun = args.dryRun ?? true;
		const batchSize = getBoundedBatchSize(args.batchSize);
		const productAccessGrants = await resetLegacyBillingAccessTable(
			ctx,
			"productAccessGrants",
			{ batchSize, dryRun },
		);
		const checkoutPurchaseIntents = await resetLegacyBillingAccessTable(
			ctx,
			"checkoutPurchaseIntents",
			{ batchSize, dryRun },
		);
		const pendingCheckoutClaims = await resetLegacyBillingAccessTable(
			ctx,
			"pendingCheckoutClaims",
			{ batchSize, dryRun },
		);
		const stripeWebhookEvents = await resetLegacyBillingAccessTable(
			ctx,
			"stripeWebhookEvents",
			{ batchSize, dryRun },
		);

		return {
			dryRun,
			batchSize,
			tables: {
				productAccessGrants,
				checkoutPurchaseIntents,
				pendingCheckoutClaims,
				stripeWebhookEvents,
			},
			hasMore:
				productAccessGrants.hasMore ||
				checkoutPurchaseIntents.hasMore ||
				pendingCheckoutClaims.hasMore ||
				stripeWebhookEvents.hasMore,
		};
	},
});
