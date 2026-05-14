import { v } from "convex/values";

export const checkoutOfferIdValidator = v.union(
	v.literal("starter"),
	v.literal("workers"),
);

export const checkoutBuyerStartingPointValidator = v.union(
	v.literal("no_codebase"),
	v.literal("existing_codebase"),
	v.literal("unspecified"),
);

export const checkoutFulfillmentTrackValidator = v.union(
	v.literal("generated_codebase"),
	v.literal("existing_codebase_doctor"),
	v.literal("unspecified"),
);

export const checkoutResolvedFulfillmentTrackValidator = v.union(
	v.literal("generated_codebase"),
	v.literal("existing_codebase_doctor"),
);

export const checkoutCtaIdValidator = v.union(
	v.literal("hero_primary"),
	v.literal("pricing_primary"),
	v.literal("codebase_demo_generated"),
	v.literal("codebase_demo_existing"),
	v.literal("choice_generated"),
	v.literal("choice_existing"),
	v.literal("unspecified"),
);

export const checkoutIntentFieldsValidator = {
	buyerStartingPoint: v.optional(checkoutBuyerStartingPointValidator),
	checkoutCtaId: v.optional(checkoutCtaIdValidator),
	fulfillmentTrack: v.optional(checkoutFulfillmentTrackValidator),
} as const;
