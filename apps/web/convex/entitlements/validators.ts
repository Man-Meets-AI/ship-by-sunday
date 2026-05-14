import { v } from "convex/values";

import {
	checkoutBuyerStartingPointValidator,
	checkoutCtaIdValidator,
	checkoutFulfillmentTrackValidator,
	checkoutOfferIdValidator,
} from "../billing/validators";

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

export const productAccessCapabilityValidator = v.union(
	v.literal("generate_codebase"),
	v.literal("tutorials"),
	v.literal("worker"),
);

export const productAccessGrantOutcomeValidator = v.union(
	v.literal("inserted"),
	v.literal("patched"),
);

export const productAccessResetOutcomeValidator = v.union(
	v.literal("deleted"),
	v.literal("noop"),
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
	capabilities: v.array(productAccessCapabilityValidator),
	buyerStartingPoint: v.optional(checkoutBuyerStartingPointValidator),
	checkoutCtaId: v.optional(checkoutCtaIdValidator),
	fulfillmentTrack: v.optional(checkoutFulfillmentTrackValidator),
});

export const productAccessGrantResultValidator = v.object({
	granted: productAccessGrantOutcomeValidator,
});

export const productAccessResetResultValidator = v.object({
	reset: productAccessResetOutcomeValidator,
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
	capabilities: v.optional(v.array(productAccessCapabilityValidator)),
	offerIds: v.optional(v.array(checkoutOfferIdValidator)),
	lastCheckoutOfferId: v.optional(checkoutOfferIdValidator),
	buyerStartingPoint: v.optional(checkoutBuyerStartingPointValidator),
	checkoutCtaId: v.optional(checkoutCtaIdValidator),
	fulfillmentTrack: v.optional(checkoutFulfillmentTrackValidator),
	grantedAt: v.number(),
	updatedAt: v.number(),
	revokedAt: v.optional(v.number()),
});

export const productAccessDebugReturnValidator = v.union(
	productAccessGrantDocumentValidator,
	v.null(),
);
