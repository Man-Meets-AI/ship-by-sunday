import { ConvexError, v } from "convex/values";

import {
	getResolvedCheckoutIntentFields,
	normalizeCheckoutIntent,
	type BuyerStartingPoint,
	type CheckoutCtaId,
	type FulfillmentTrack,
} from "../../src/platform/billing/checkout/checkout-intent";
import {
	productSurfaceCapabilities,
	resolveProductSurfaceCapabilities,
	type ProductSurfaceCapability,
} from "../../src/platform/access/product-surface-capabilities";
import {
	getCheckoutOffer,
	getCheckoutOfferCapabilities,
	getCheckoutOfferIdForLegacyFulfillmentTrack,
	readCheckoutOfferId,
	type CheckoutOfferId,
} from "../../src/platform/billing/checkout/checkout-offers";
import {
	checkoutBuyerStartingPointValidator,
	checkoutCtaIdValidator,
	checkoutFulfillmentTrackValidator,
	checkoutResolvedFulfillmentTrackValidator,
	checkoutOfferIdValidator,
} from "../billing/validators";
import { getBillingProductSurfaceAccessState } from "../billing/model";
import type {
	EntitlementMutationCtx,
	EntitlementQueryCtx,
	EntitlementReadCtx,
	ProductAccessGrantSource,
} from "./types";
import {
	productAccessDebugReturnValidator,
	productAccessCapabilityValidator,
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
	capabilities?: ProductSurfaceCapability[];
	checkoutOfferId?: CheckoutOfferId;
	buyerStartingPoint?: BuyerStartingPoint;
	checkoutCtaId?: CheckoutCtaId;
	fulfillmentTrack?: FulfillmentTrack;
};

const legacyProductSplitCapabilities = [
	"generate_codebase",
	"tutorials",
	"worker",
] as const satisfies readonly ProductSurfaceCapability[];

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

async function requireViewerClerkUserId(ctx: EntitlementReadCtx) {
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

function getIncomingCheckoutIntentFields(
	input: Pick<
		ProductAccessGrantUpsertInput,
		| "buyerStartingPoint"
		| "checkoutCtaId"
		| "checkoutOfferId"
		| "fulfillmentTrack"
	>,
) {
	return {
		buyerStartingPoint: input.buyerStartingPoint,
		checkoutCtaId: input.checkoutCtaId,
		fulfillmentTrack:
			input.fulfillmentTrack ??
			(input.checkoutOfferId
				? getCheckoutOffer(input.checkoutOfferId).fulfillmentTrack
				: undefined),
	};
}

function getStoredProductSurfaceCapabilities(
	accessGrant: {
		status?: string;
		capabilities?: string[];
		legacyWorkersAccessEndsAt?: number;
		offerIds?: string[];
		lastCheckoutOfferId?: CheckoutOfferId;
		fulfillmentTrack?: FulfillmentTrack;
	} | null,
): ProductSurfaceCapability[] {
	if (!accessGrant || accessGrant.status !== "granted") {
		return [];
	}

	return applyStoredCapabilityExpirations(
		getProductSurfaceCapabilitiesFromGrantFields(accessGrant),
		accessGrant,
	);
}

function isBillingBackedProductAccessGrant(
	accessGrant: {
		source?: ProductAccessGrantSource;
		stripeCustomerId?: string;
		stripeCheckoutSessionId?: string;
		stripePaymentIntentId?: string;
	} | null,
) {
	return Boolean(
		accessGrant &&
		(accessGrant.source === "stripe_checkout" ||
			accessGrant.source === "stripe_webhook" ||
			accessGrant.stripeCustomerId ||
			accessGrant.stripeCheckoutSessionId ||
			accessGrant.stripePaymentIntentId),
	);
}

async function getEffectiveProductSurfaceCapabilities(
	ctx: EntitlementReadCtx,
	clerkUserId: string,
	accessGrant: {
		status?: string;
		source?: ProductAccessGrantSource;
		capabilities?: string[];
		legacyWorkersAccessEndsAt?: number;
		offerIds?: string[];
		lastCheckoutOfferId?: CheckoutOfferId;
		fulfillmentTrack?: FulfillmentTrack;
		stripeCustomerId?: string;
		stripeCheckoutSessionId?: string;
		stripePaymentIntentId?: string;
	} | null,
) {
	if (!accessGrant || accessGrant.status !== "granted") {
		return [];
	}

	if (!isBillingBackedProductAccessGrant(accessGrant)) {
		return getStoredProductSurfaceCapabilities(accessGrant);
	}

	const billingAccessState = await getBillingProductSurfaceAccessState(
		ctx,
		clerkUserId,
	);
	const billingCapabilities = getUniqueProductSurfaceCapabilities(
		billingAccessState.activeCapabilities,
	);
	const storedCapabilities = getStoredProductSurfaceCapabilities(accessGrant);
	const hasActiveLegacyWorkersAccess =
		hasUnexpiredLegacyWorkersAccess(accessGrant);
	const shouldUseStoredWorkersCapability =
		!billingAccessState.hasWorkersBillingRecords ||
		hasActiveLegacyWorkersAccess;

	if (billingAccessState.hasBillingRecords) {
		return getUniqueProductSurfaceCapabilities([
			...billingCapabilities,
			...(billingAccessState.hasStarterBillingRecords
				? []
				: storedCapabilities.filter((capability) =>
						["generate_codebase", "tutorials"].includes(capability),
					)),
			...(shouldUseStoredWorkersCapability
				? storedCapabilities.filter((capability) => capability === "worker")
				: []),
		]);
	}

	return storedCapabilities;
}

function getUniqueProductSurfaceCapabilities(
	capabilities: readonly ProductSurfaceCapability[],
) {
	return productSurfaceCapabilities.filter((capability) =>
		capabilities.includes(capability),
	);
}

function hasUnexpiredLegacyWorkersAccess(grant: {
	legacyWorkersAccessEndsAt?: number;
}) {
	return Boolean(
		grant.legacyWorkersAccessEndsAt &&
		grant.legacyWorkersAccessEndsAt > Date.now(),
	);
}

function applyStoredCapabilityExpirations(
	capabilities: readonly ProductSurfaceCapability[],
	grant: {
		legacyWorkersAccessEndsAt?: number;
	},
) {
	if (!grant.legacyWorkersAccessEndsAt) {
		return getUniqueProductSurfaceCapabilities(capabilities);
	}

	return getUniqueProductSurfaceCapabilities(
		capabilities.filter(
			(capability) =>
				capability !== "worker" || hasUnexpiredLegacyWorkersAccess(grant),
		),
	);
}

function getProductSurfaceCapabilitiesForOfferIds(
	offerIds: readonly string[] | undefined,
) {
	return getUniqueProductSurfaceCapabilities(
		(offerIds ?? []).flatMap(
			(offerId) =>
				getCheckoutOfferCapabilities(readCheckoutOfferId(offerId)) ?? [],
		),
	);
}

function getProductSurfaceCapabilitiesForFulfillmentTrack(
	fulfillmentTrack: FulfillmentTrack | undefined,
) {
	if (!fulfillmentTrack) {
		return [];
	}

	const offerId = getCheckoutOfferIdForLegacyFulfillmentTrack(fulfillmentTrack);
	return getCheckoutOfferCapabilities(offerId) ?? [];
}

function getProductSurfaceCapabilitiesFromGrantFields(grant: {
	capabilities?: string[];
	offerIds?: string[];
	lastCheckoutOfferId?: CheckoutOfferId;
	fulfillmentTrack?: FulfillmentTrack;
}): ProductSurfaceCapability[] {
	if (grant.capabilities) {
		return resolveProductSurfaceCapabilities(grant.capabilities);
	}

	return getUniqueProductSurfaceCapabilities([
		...getProductSurfaceCapabilitiesForOfferIds(grant.offerIds),
		...(getCheckoutOfferCapabilities(grant.lastCheckoutOfferId) ?? []),
		...getProductSurfaceCapabilitiesForFulfillmentTrack(grant.fulfillmentTrack),
	]);
}

function getIncomingProductSurfaceCapabilities(
	input: Pick<
		ProductAccessGrantUpsertInput,
		"capabilities" | "checkoutOfferId" | "fulfillmentTrack"
	>,
): ProductSurfaceCapability[] | undefined {
	if (input.capabilities) {
		return resolveProductSurfaceCapabilities(input.capabilities);
	}

	if (input.checkoutOfferId) {
		return getCheckoutOfferCapabilities(input.checkoutOfferId) ?? [];
	}

	const fulfillmentTrackCapabilities =
		getProductSurfaceCapabilitiesForFulfillmentTrack(input.fulfillmentTrack);
	return fulfillmentTrackCapabilities.length > 0
		? fulfillmentTrackCapabilities
		: undefined;
}

function getMergedProductSurfaceCapabilities({
	existingGrant,
	incomingCapabilities,
}: {
	existingGrant: {
		capabilities?: string[];
		offerIds?: string[];
		lastCheckoutOfferId?: CheckoutOfferId;
		fulfillmentTrack?: FulfillmentTrack;
	};
	incomingCapabilities?: ProductSurfaceCapability[];
}): ProductSurfaceCapability[] {
	return getUniqueProductSurfaceCapabilities([
		...getProductSurfaceCapabilitiesFromGrantFields(existingGrant),
		...(incomingCapabilities ?? []),
	]);
}

function getMergedCheckoutOfferIds({
	existingOfferIds,
	incomingOfferId,
}: {
	existingOfferIds?: string[];
	incomingOfferId?: CheckoutOfferId;
}): CheckoutOfferId[] | undefined {
	if (!incomingOfferId && !existingOfferIds) {
		return undefined;
	}

	const mergedOfferIds = new Set<CheckoutOfferId>();
	for (const offerId of existingOfferIds ?? []) {
		if (offerId === "starter" || offerId === "workers") {
			mergedOfferIds.add(offerId);
		}
	}
	if (incomingOfferId) {
		mergedOfferIds.add(incomingOfferId);
	}

	return [...mergedOfferIds];
}

function getMergedLegacyProductSplitOfferIds(existingOfferIds?: string[]) {
	const mergedOfferIds = new Set<CheckoutOfferId>();
	for (const offerId of existingOfferIds ?? []) {
		if (offerId === "starter" || offerId === "workers") {
			mergedOfferIds.add(offerId);
		}
	}
	mergedOfferIds.add("starter");
	mergedOfferIds.add("workers");

	return (["starter", "workers"] as const).filter((offerId) =>
		mergedOfferIds.has(offerId),
	);
}

export async function getProductAccessGrantByClerkUserId(
	ctx: EntitlementReadCtx,
	clerkUserId: string,
) {
	return ctx.db
		.query("productAccessGrants")
		.withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
		.unique();
}

export async function requireGrantedProductAccess(ctx: EntitlementReadCtx) {
	const clerkUserId = await requireViewerClerkUserId(ctx);
	const accessGrant = await getProductAccessGrantByClerkUserId(
		ctx,
		clerkUserId,
	);
	const effectiveCapabilities = await getEffectiveProductSurfaceCapabilities(
		ctx,
		clerkUserId,
		accessGrant,
	);

	if (
		!accessGrant ||
		accessGrant.status !== "granted" ||
		(isBillingBackedProductAccessGrant(accessGrant) &&
			effectiveCapabilities.length === 0)
	) {
		throw new ConvexError("Access required");
	}

	return clerkUserId;
}

export async function requireExistingCodebaseProductAccess(
	ctx: EntitlementReadCtx,
) {
	const clerkUserId = await requireGrantedProductAccess(ctx);
	const accessGrant = await getProductAccessGrantByClerkUserId(
		ctx,
		clerkUserId,
	);
	const effectiveCapabilities = await getEffectiveProductSurfaceCapabilities(
		ctx,
		clerkUserId,
		accessGrant,
	);

	if (!effectiveCapabilities.includes("worker")) {
		throw new ConvexError("Existing codebase access required");
	}

	return clerkUserId;
}

export async function requireGeneratedCodebaseProductAccess(
	ctx: EntitlementReadCtx,
) {
	const clerkUserId = await requireGrantedProductAccess(ctx);
	const accessGrant = await getProductAccessGrantByClerkUserId(
		ctx,
		clerkUserId,
	);
	const effectiveCapabilities = await getEffectiveProductSurfaceCapabilities(
		ctx,
		clerkUserId,
		accessGrant,
	);

	if (!effectiveCapabilities.includes("generate_codebase")) {
		throw new ConvexError("Generated codebase access required");
	}

	return clerkUserId;
}

export async function requireTutorialsProductAccess(ctx: EntitlementReadCtx) {
	const clerkUserId = await requireGrantedProductAccess(ctx);
	const accessGrant = await getProductAccessGrantByClerkUserId(
		ctx,
		clerkUserId,
	);
	const effectiveCapabilities = await getEffectiveProductSurfaceCapabilities(
		ctx,
		clerkUserId,
		accessGrant,
	);

	if (!effectiveCapabilities.includes("tutorials")) {
		throw new ConvexError("Tutorials access required");
	}

	return clerkUserId;
}

export async function upsertProductAccessGrant(
	ctx: EntitlementMutationCtx,
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
	const incomingCapabilities = getIncomingProductSurfaceCapabilities(input);
	if (grantToPatch) {
		const checkoutIntent = getResolvedCheckoutIntentFields(
			grantToPatch,
			getIncomingCheckoutIntentFields(input),
		);
		const capabilities = getMergedProductSurfaceCapabilities({
			existingGrant: grantToPatch,
			incomingCapabilities,
		});
		const offerIds = getMergedCheckoutOfferIds({
			existingOfferIds: grantToPatch.offerIds,
			incomingOfferId: input.checkoutOfferId,
		});
		await ctx.db.patch(grantToPatch._id, {
			status: "granted",
			source: getNextProductAccessGrantSource({
				existingSource: grantToPatch.source,
				incomingSource: input.source,
			}),
			stripeCustomerId: input.stripeCustomerId,
			stripeCheckoutSessionId: input.stripeCheckoutSessionId,
			stripePaymentIntentId: input.stripePaymentIntentId,
			capabilities,
			offerIds,
			lastCheckoutOfferId:
				input.checkoutOfferId ?? grantToPatch.lastCheckoutOfferId,
			fulfillmentTrack: checkoutIntent.fulfillmentTrack,
			updatedAt: now,
			revokedAt: undefined,
		});

		return { granted: "patched" as const };
	}

	const checkoutIntent = getStoredCheckoutIntentFields(
		getIncomingCheckoutIntentFields(input),
	);
	await ctx.db.insert("productAccessGrants", {
		clerkUserId: input.clerkUserId,
		status: "granted",
		source: input.source,
		stripeCustomerId: input.stripeCustomerId,
		stripeCheckoutSessionId: input.stripeCheckoutSessionId,
		stripePaymentIntentId: input.stripePaymentIntentId,
		capabilities: incomingCapabilities ?? [],
		offerIds: input.checkoutOfferId ? [input.checkoutOfferId] : undefined,
		lastCheckoutOfferId: input.checkoutOfferId,
		fulfillmentTrack: checkoutIntent.fulfillmentTrack,
		grantedAt: now,
		updatedAt: now,
	});

	return { granted: "inserted" as const };
}

export async function viewerProductAccessHandler(ctx: EntitlementQueryCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		return {
			clerkUserId: null,
			hasAccess: false,
			status: "signed_out" as const,
			capabilities: [],
		};
	}

	const accessGrant = await getProductAccessGrantByClerkUserId(
		ctx,
		identity.subject,
	);
	const capabilities = await getEffectiveProductSurfaceCapabilities(
		ctx,
		identity.subject,
		accessGrant,
	);
	const billingBackedAccess = isBillingBackedProductAccessGrant(accessGrant);
	const hasAccess =
		accessGrant?.status === "granted" &&
		(!billingBackedAccess || capabilities.length > 0);
	const status =
		accessGrant?.status === "granted" && !hasAccess
			? ("no_access" as const)
			: (accessGrant?.status ?? ("no_access" as const));

	return {
		clerkUserId: identity.subject,
		hasAccess,
		status,
		capabilities,
		...(accessGrant ? getStoredCheckoutIntentFields(accessGrant) : undefined),
	};
}

export const grantProductAccessArgs = {
	clerkUserId: v.string(),
	source: v.optional(productAccessSourceValidator),
	stripeCustomerId: v.optional(v.string()),
	stripeCheckoutSessionId: v.optional(v.string()),
	stripePaymentIntentId: v.optional(v.string()),
	capabilities: v.optional(v.array(productAccessCapabilityValidator)),
	checkoutOfferId: v.optional(checkoutOfferIdValidator),
	buyerStartingPoint: v.optional(checkoutBuyerStartingPointValidator),
	checkoutCtaId: v.optional(checkoutCtaIdValidator),
	fulfillmentTrack: v.optional(checkoutFulfillmentTrackValidator),
};
export const grantProductAccessReturns = productAccessGrantResultValidator;

export async function grantProductAccessHandler(
	ctx: EntitlementMutationCtx,
	args: {
		clerkUserId: string;
		source?: ProductAccessGrantSource;
		stripeCustomerId?: string;
		stripeCheckoutSessionId?: string;
		stripePaymentIntentId?: string;
		capabilities?: ProductSurfaceCapability[];
		checkoutOfferId?: CheckoutOfferId;
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

export const grantLegacyProductSplitAccessArgs = {
	clerkUserId: v.string(),
	legacyWorkersAccessEndsAt: v.number(),
};
export const grantLegacyProductSplitAccessReturns =
	productAccessGrantResultValidator;

export async function grantLegacyProductSplitAccessHandler(
	ctx: EntitlementMutationCtx,
	args: {
		clerkUserId: string;
		legacyWorkersAccessEndsAt: number;
	},
) {
	const now = Date.now();
	const existingGrant = await getProductAccessGrantByClerkUserId(
		ctx,
		args.clerkUserId,
	);

	if (existingGrant) {
		const capabilities = getUniqueProductSurfaceCapabilities([
			...getProductSurfaceCapabilitiesFromGrantFields(existingGrant),
			...legacyProductSplitCapabilities,
		]);
		await ctx.db.patch(existingGrant._id, {
			status: "granted",
			capabilities,
			legacyWorkersAccessEndsAt: args.legacyWorkersAccessEndsAt,
			offerIds: getMergedLegacyProductSplitOfferIds(existingGrant.offerIds),
			updatedAt: now,
			revokedAt: undefined,
		});

		return { granted: "patched" as const };
	}

	await ctx.db.insert("productAccessGrants", {
		clerkUserId: args.clerkUserId,
		status: "granted",
		source: "manual",
		capabilities: [...legacyProductSplitCapabilities],
		legacyWorkersAccessEndsAt: args.legacyWorkersAccessEndsAt,
		offerIds: ["starter", "workers"],
		grantedAt: now,
		updatedAt: now,
	});

	return { granted: "inserted" as const };
}

export const grantProductAccessFromStripeArgs = {
	clerkUserId: v.string(),
	stripeCustomerId: v.optional(v.string()),
	stripeCheckoutSessionId: v.optional(v.string()),
	stripePaymentIntentId: v.optional(v.string()),
	capabilities: v.optional(v.array(productAccessCapabilityValidator)),
	checkoutOfferId: v.optional(checkoutOfferIdValidator),
	buyerStartingPoint: v.optional(checkoutBuyerStartingPointValidator),
	checkoutCtaId: v.optional(checkoutCtaIdValidator),
	fulfillmentTrack: v.optional(checkoutFulfillmentTrackValidator),
};
export const grantProductAccessFromStripeReturns =
	productAccessGrantResultValidator;

export async function grantProductAccessFromStripeHandler(
	ctx: EntitlementMutationCtx,
	args: {
		clerkUserId: string;
		stripeCustomerId?: string;
		stripeCheckoutSessionId?: string;
		stripePaymentIntentId?: string;
		capabilities?: ProductSurfaceCapability[];
		checkoutOfferId?: CheckoutOfferId;
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
		capabilities: args.capabilities,
		checkoutOfferId: args.checkoutOfferId,
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
	ctx: EntitlementMutationCtx,
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
	ctx: EntitlementMutationCtx,
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
	ctx: EntitlementQueryCtx,
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
