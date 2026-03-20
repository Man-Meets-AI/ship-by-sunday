import { v } from "convex/values";

export const productAccessGrantStatusValidator = v.union(
	v.literal("granted"),
	v.literal("pending"),
	v.literal("revoked"),
	v.literal("refunded"),
);

export const productAccessSourceValidator = v.union(
	v.literal("manual"),
	v.literal("stripe_checkout"),
	v.literal("stripe_webhook"),
);

export const productAccessGrantOutcomeValidator = v.union(
	v.literal("inserted"),
	v.literal("patched"),
);

export const productAccessReturnValidator = v.object({
	clerkUserId: v.union(v.string(), v.null()),
	hasAccess: v.boolean(),
	status: v.union(
		v.literal("signed_out"),
		v.literal("token_missing"),
		v.literal("no_access"),
		productAccessGrantStatusValidator,
	),
});

export const productAccessGrantResultValidator = v.object({
	granted: productAccessGrantOutcomeValidator,
});

export const productAccessGrantDocumentValidator = v.object({
	_id: v.id("productAccessGrants"),
	_creationTime: v.number(),
	clerkUserId: v.string(),
	status: productAccessGrantStatusValidator,
	source: productAccessSourceValidator,
	stripeCustomerId: v.optional(v.string()),
	stripeCheckoutSessionId: v.optional(v.string()),
	stripePaymentIntentId: v.optional(v.string()),
	grantedAt: v.number(),
	updatedAt: v.number(),
	revokedAt: v.optional(v.number()),
});

export const productAccessDebugReturnValidator = v.union(
	productAccessGrantDocumentValidator,
	v.null(),
);
