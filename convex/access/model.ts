import { ConvexError, v } from "convex/values";

import type {
	AccessMutationCtx,
	AccessQueryCtx,
	AccessReadCtx,
	ProductAccessGrantSource,
} from "./types";
import {
	productAccessDebugReturnValidator,
	productAccessGrantResultValidator,
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
};

async function requireViewer(ctx: AccessReadCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw new ConvexError("Unauthorized");
	}

	return identity.subject;
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

async function upsertProductAccessGrant(
	ctx: AccessMutationCtx,
	input: ProductAccessGrantUpsertInput,
) {
	const now = Date.now();
	const existingGrant = await getProductAccessGrantByClerkUserId(
		ctx,
		input.clerkUserId,
	);

	if (existingGrant) {
		await ctx.db.patch(existingGrant._id, {
			status: "granted",
			source: input.source,
			stripeCustomerId: input.stripeCustomerId,
			stripeCheckoutSessionId: input.stripeCheckoutSessionId,
			stripePaymentIntentId: input.stripePaymentIntentId,
			updatedAt: now,
			revokedAt: undefined,
		});

		return { granted: "patched" as const };
	}

	await ctx.db.insert("productAccessGrants", {
		clerkUserId: input.clerkUserId,
		status: "granted",
		source: input.source,
		stripeCustomerId: input.stripeCustomerId,
		stripeCheckoutSessionId: input.stripeCheckoutSessionId,
		stripePaymentIntentId: input.stripePaymentIntentId,
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
	};
}

export const grantProductAccessArgs = {
	clerkUserId: v.string(),
	source: v.optional(productAccessSourceValidator),
	stripeCustomerId: v.optional(v.string()),
	stripeCheckoutSessionId: v.optional(v.string()),
	stripePaymentIntentId: v.optional(v.string()),
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
	},
) {
	return upsertProductAccessGrant(ctx, {
		clerkUserId: args.clerkUserId,
		source: "stripe_webhook",
		stripeCustomerId: args.stripeCustomerId,
		stripeCheckoutSessionId: args.stripeCheckoutSessionId,
		stripePaymentIntentId: args.stripePaymentIntentId,
	});
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
