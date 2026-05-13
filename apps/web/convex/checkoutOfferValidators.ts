import { v } from "convex/values";

export const checkoutOfferIdValidator = v.union(
	v.literal("starter"),
	v.literal("workers"),
);
