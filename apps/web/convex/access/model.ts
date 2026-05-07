import { ConvexError, v } from "convex/values";

import {
	getResolvedCheckoutIntentFields,
	normalizeCheckoutIntent,
	type BuyerStartingPoint,
	type CheckoutCtaId,
	type FulfillmentTrack,
} from "../../platform/billing/checkout/checkout-intent";
import {
	checkoutBuyerStartingPointValidator,
	checkoutCtaIdValidator,
	checkoutFulfillmentTrackValidator,
	checkoutResolvedFulfillmentTrackValidator,
} from "../checkoutIntentValidators";
import type {
	AccessMutationCtx,
	AccessQueryCtx,
	AccessReadCtx,
	ProductAccessGrantSource,
} from "./types";
import {
	productAccessDebugReturnValidator,
	productAccessGrantResultValidator,
	productAccessResetResultValidator,
	productAccessReturnValidator,
	productAccessSourceValidator,
} from "./validators";

export const viewerProductAccessArgs = {};
export const viewerProductAccessReturns = productAccessReturnValidator;

type ProductAccessGrantUpsertInput = {
	clerkUserId: string;
	source: ProductAccessGrantSource;
	stripeCustomerId?: string;
	stripeCheckoutSessionId?: string;
	stripePaymentIntentId?: string;
	buyerStartingPoint?: BuyerStartingPoint;
	checkoutCtaId?: CheckoutCtaId;
	fulfillmentTrack?: FulfillmentTrack;
};

function getNextProductAccessGrantSource({
	existingSource,
	incomingSource,
}: {
	existingSource: ProductAccessGrantSource;
	incomingSource: ProductAccessGrantSource;
}) {
	if (
		existingSource === "stripe_webhook" &&
		incomingSource === "stripe_checkout"
	) {
		return existingSource;
	}

	return incomingSource;
}

async function requireViewer(ctx: AccessReadCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw new ConvexError("Unauthorized");
	}

	return identity.subject;
}

function getStoredCheckoutIntentFields(
	intent: {
		buyerStartingPoint?: BuyerStartingPoint;
		checkoutCtaId?: CheckoutCtaId;
		fulfillmentTrack?: FulfillmentTrack;
	} | null,
) {
	return normalizeCheckoutIntent(intent);
}

export async function getProductAccessGrantByClerkUserId(
	ctx: AccessReadCtx,
	clerkUserId: string,
) {
	return ctx.db
		.query("productAccessGrants")
		.withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
		.unique();
}

export async function requireGrantedProductAccess(ctx: AccessReadCtx) {
	const clerkUserId = await requireViewer(ctx);
	const accessGrant = await getProductAccessGrantByClerkUserId(
		ctx,
		clerkUserId,
	);

	if (!accessGrant || accessGrant.status !== "granted") {
		throw new ConvexError("Access required");
	}

	return clerkUserId;
}

export async function requireExistingCodebaseProductAccess(ctx: AccessReadCtx) {
	const clerkUserId = await requireGrantedProductAccess(ctx);
	const accessGrant = await getProductAccessGrantByClerkUserId(
		ctx,
		clerkUserId,
	);
	const checkoutIntent = getStoredCheckoutIntentFields(accessGrant);

	if (checkoutIntent.fulfillmentTrack !== "existing_codebase_doctor") {
		throw new ConvexError("Existing codebase access required");
	}

	return clerkUserId;
}

export async function requireGeneratedCodebaseProductAccess(
	ctx: AccessReadCtx,
) {
	const clerkUserId = await requireGrantedProductAccess(ctx);
	const accessGrant = await getProductAccessGrantByClerkUserId(
		ctx,
		clerkUserId,
	);
	const checkoutIntent = getStoredCheckoutIntentFields(accessGrant);

	if (checkoutIntent.fulfillmentTrack !== "generated_codebase") {
		throw new ConvexError("Generated codebase access required");
	}

	return clerkUserId;
}

export async function upsertProductAccessGrant(
	ctx: AccessMutationCtx,
	input: ProductAccessGrantUpsertInput,
) {
	const now = Date.now();
	const existingStripeGrant = input.stripeCheckoutSessionId
		? await ctx.db
				.query("productAccessGrants")
				.withIndex("by_stripe_checkout_session_id", (q) =>
					q.eq("stripeCheckoutSessionId", input.stripeCheckoutSessionId!),
				)
				.unique()
		: null;

	if (
		existingStripeGrant &&
		existingStripeGrant.clerkUserId !== input.clerkUserId
	) {
		throw new ConvexError(
			`Stripe checkout session already granted to ${existingStripeGrant.clerkUserId}`,
		);
	}

	const existingGrant = await getProductAccessGrantByClerkUserId(
		ctx,
		input.clerkUserId,
	);

	const grantToPatch = existingStripeGrant ?? existingGrant;
	if (grantToPatch) {
		const checkoutIntent = getResolvedCheckoutIntentFields(grantToPatch, input);
		await ctx.db.patch(grantToPatch._id, {
			status: "granted",
			source: getNextProductAccessGrantSource({
				existingSource: grantToPatch.source,
				incomingSource: input.source,
			}),
			stripeCustomerId: input.stripeCustomerId,
			stripeCheckoutSessionId: input.stripeCheckoutSessionId,
			stripePaymentIntentId: input.stripePaymentIntentId,
			fulfillmentTrack: checkoutIntent.fulfillmentTrack,
			updatedAt: now,
			revokedAt: undefined,
		});

		return { granted: "patched" as const };
	}

	const checkoutIntent = getStoredCheckoutIntentFields(input);
	await ctx.db.insert("productAccessGrants", {
		clerkUserId: input.clerkUserId,
		status: "granted",
		source: input.source,
		stripeCustomerId: input.stripeCustomerId,
		stripeCheckoutSessionId: input.stripeCheckoutSessionId,
		stripePaymentIntentId: input.stripePaymentIntentId,
		fulfillmentTrack: checkoutIntent.fulfillmentTrack,
		grantedAt: now,
		updatedAt: now,
	});

	return { granted: "inserted" as const };
}

export async function viewerProductAccessHandler(ctx: AccessQueryCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		return {
			clerkUserId: null,
			hasAccess: false,
			status: "signed_out" as const,
		};
	}

	const accessGrant = await getProductAccessGrantByClerkUserId(
		ctx,
		identity.subject,
	);

	return {
		clerkUserId: identity.subject,
		hasAccess: accessGrant?.status === "granted",
		status: accessGrant?.status ?? ("no_access" as const),
		...(accessGrant ? getStoredCheckoutIntentFields(accessGrant) : undefined),
	};
}

export const grantProductAccessArgs = {
	clerkUserId: v.string(),
	source: v.optional(productAccessSourceValidator),
	stripeCustomerId: v.optional(v.string()),
	stripeCheckoutSessionId: v.optional(v.string()),
	stripePaymentIntentId: v.optional(v.string()),
	buyerStartingPoint: v.optional(checkoutBuyerStartingPointValidator),
	checkoutCtaId: v.optional(checkoutCtaIdValidator),
	fulfillmentTrack: v.optional(checkoutFulfillmentTrackValidator),
};
export const grantProductAccessReturns = productAccessGrantResultValidator;

export async function grantProductAccessHandler(
	ctx: AccessMutationCtx,
	args: {
		clerkUserId: string;
		source?: ProductAccessGrantSource;
		stripeCustomerId?: string;
		stripeCheckoutSessionId?: string;
		stripePaymentIntentId?: string;
		buyerStartingPoint?: BuyerStartingPoint;
		checkoutCtaId?: CheckoutCtaId;
		fulfillmentTrack?: FulfillmentTrack;
	},
) {
	return upsertProductAccessGrant(ctx, {
		...args,
		source: args.source ?? "manual",
	});
}

export const grantProductAccessFromStripeArgs = {
	clerkUserId: v.string(),
	stripeCustomerId: v.optional(v.string()),
	stripeCheckoutSessionId: v.optional(v.string()),
	stripePaymentIntentId: v.optional(v.string()),
	buyerStartingPoint: v.optional(checkoutBuyerStartingPointValidator),
	checkoutCtaId: v.optional(checkoutCtaIdValidator),
	fulfillmentTrack: v.optional(checkoutFulfillmentTrackValidator),
};
export const grantProductAccessFromStripeReturns =
	productAccessGrantResultValidator;

export async function grantProductAccessFromStripeHandler(
	ctx: AccessMutationCtx,
	args: {
		clerkUserId: string;
		stripeCustomerId?: string;
		stripeCheckoutSessionId?: string;
		stripePaymentIntentId?: string;
		buyerStartingPoint?: BuyerStartingPoint;
		checkoutCtaId?: CheckoutCtaId;
		fulfillmentTrack?: FulfillmentTrack;
	},
) {
	return upsertProductAccessGrant(ctx, {
		clerkUserId: args.clerkUserId,
		source: "stripe_webhook",
		stripeCustomerId: args.stripeCustomerId,
		stripeCheckoutSessionId: args.stripeCheckoutSessionId,
		stripePaymentIntentId: args.stripePaymentIntentId,
		buyerStartingPoint: args.buyerStartingPoint,
		checkoutCtaId: args.checkoutCtaId,
		fulfillmentTrack: args.fulfillmentTrack,
	});
}

export const resolveViewerFulfillmentTrackArgs = {
	fulfillmentTrack: checkoutResolvedFulfillmentTrackValidator,
};
export const resolveViewerFulfillmentTrackReturns = v.object({
	fulfillmentTrack: checkoutResolvedFulfillmentTrackValidator,
});

export async function resolveViewerFulfillmentTrackHandler(
	ctx: AccessMutationCtx,
	args: {
		fulfillmentTrack: Exclude<FulfillmentTrack, "unspecified">;
	},
) {
	const clerkUserId = await requireGrantedProductAccess(ctx);
	const accessGrant = await getProductAccessGrantByClerkUserId(
		ctx,
		clerkUserId,
	);
	if (!accessGrant) {
		throw new ConvexError("Access required");
	}
	const existingCheckoutIntent = getStoredCheckoutIntentFields(accessGrant);
	if (existingCheckoutIntent.fulfillmentTrack !== "unspecified") {
		throw new ConvexError("Fulfillment track already resolved");
	}

	const now = Date.now();
	await ctx.db.patch(accessGrant._id, {
		fulfillmentTrack: args.fulfillmentTrack,
		updatedAt: now,
	});

	return {
		fulfillmentTrack: args.fulfillmentTrack,
	};
}

export const resetProductAccessArgs = {
	clerkUserId: v.string(),
};
export const resetProductAccessReturns = productAccessResetResultValidator;

export async function resetProductAccessHandler(
	ctx: AccessMutationCtx,
	args: {
		clerkUserId: string;
	},
) {
	const existingGrant = await getProductAccessGrantByClerkUserId(
		ctx,
		args.clerkUserId,
	);

	if (!existingGrant) {
		return {
			reset: "noop" as const,
		};
	}

	await ctx.db.delete(existingGrant._id);

	return {
		reset: "deleted" as const,
	};
}

export const getProductAccessDebugArgs = {
	clerkUserId: v.optional(v.string()),
	stripeCheckoutSessionId: v.optional(v.string()),
};
export const getProductAccessDebugReturns = productAccessDebugReturnValidator;

export async function getProductAccessDebugHandler(
	ctx: AccessQueryCtx,
	args: {
		clerkUserId?: string;
		stripeCheckoutSessionId?: string;
	},
) {
	if (args.stripeCheckoutSessionId) {
		const accessGrant = await ctx.db
			.query("productAccessGrants")
			.withIndex("by_stripe_checkout_session_id", (q) =>
				q.eq("stripeCheckoutSessionId", args.stripeCheckoutSessionId!),
			)
			.unique();

		return accessGrant ?? null;
	}

	if (!args.clerkUserId) {
		return null;
	}

	const accessGrant = await getProductAccessGrantByClerkUserId(
		ctx,
		args.clerkUserId,
	);

	return accessGrant ?? null;
}
