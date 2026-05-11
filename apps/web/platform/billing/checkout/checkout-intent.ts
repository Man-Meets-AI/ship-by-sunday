// Legacy checkout metadata plus the active post-purchase fulfillment track.
// New public checkout creation must not accept or write buyerStartingPoint or checkoutCtaId.
export const checkoutBuyerStartingPoints = [
	"no_codebase",
	"existing_codebase",
	"unspecified",
] as const;

export type BuyerStartingPoint = (typeof checkoutBuyerStartingPoints)[number];

export const checkoutFulfillmentTracks = [
	"generated_codebase",
	"existing_codebase_doctor",
	"unspecified",
] as const;

export type FulfillmentTrack = (typeof checkoutFulfillmentTracks)[number];

export const checkoutCtaIds = [
	"hero_primary",
	"pricing_primary",
	"codebase_demo_generated",
	"codebase_demo_existing",
	"choice_generated",
	"choice_existing",
	"unspecified",
] as const;

export type CheckoutCtaId = (typeof checkoutCtaIds)[number];

export type CheckoutIntent = {
	readonly buyerStartingPoint: BuyerStartingPoint;
	readonly checkoutCtaId: CheckoutCtaId;
	readonly fulfillmentTrack: FulfillmentTrack;
};

type CheckoutIntentRawField = string | null | undefined;

export type CheckoutIntentInput = {
	readonly buyerStartingPoint?: CheckoutIntentRawField;
	readonly checkoutCtaId?: CheckoutIntentRawField;
	readonly fulfillmentTrack?: CheckoutIntentRawField;
};

const checkoutBuyerStartingPointSet = new Set<string>(
	checkoutBuyerStartingPoints,
);
const checkoutFulfillmentTrackSet = new Set<string>(checkoutFulfillmentTracks);
const checkoutCtaIdSet = new Set<string>(checkoutCtaIds);

export function normalizeBuyerStartingPoint(
	value: CheckoutIntentRawField,
): BuyerStartingPoint {
	return typeof value === "string" && checkoutBuyerStartingPointSet.has(value)
		? (value as BuyerStartingPoint)
		: "unspecified";
}

export function normalizeFulfillmentTrack(
	value: CheckoutIntentRawField,
): FulfillmentTrack {
	return typeof value === "string" && checkoutFulfillmentTrackSet.has(value)
		? (value as FulfillmentTrack)
		: "unspecified";
}

export function normalizeCheckoutCtaId(
	value: CheckoutIntentRawField,
): CheckoutCtaId {
	return typeof value === "string" && checkoutCtaIdSet.has(value)
		? (value as CheckoutCtaId)
		: "unspecified";
}

export function getFulfillmentTrackForBuyerStartingPoint(
	buyerStartingPoint: BuyerStartingPoint,
): FulfillmentTrack {
	switch (buyerStartingPoint) {
		case "no_codebase":
			return "generated_codebase";
		case "existing_codebase":
			return "existing_codebase_doctor";
		case "unspecified":
			return "unspecified";
	}
}

export function normalizeCheckoutIntent(
	input: CheckoutIntentInput | null | undefined,
): CheckoutIntent {
	const buyerStartingPoint = normalizeBuyerStartingPoint(
		input?.buyerStartingPoint,
	);
	const requestedFulfillmentTrack = normalizeFulfillmentTrack(
		input?.fulfillmentTrack,
	);
	const fulfillmentTrack =
		buyerStartingPoint === "unspecified"
			? requestedFulfillmentTrack
			: getFulfillmentTrackForBuyerStartingPoint(buyerStartingPoint);

	return {
		buyerStartingPoint,
		checkoutCtaId: normalizeCheckoutCtaId(input?.checkoutCtaId),
		fulfillmentTrack,
	};
}

export function readCheckoutIntentFromMetadata(
	metadata: Record<string, string> | null | undefined,
) {
	return normalizeCheckoutIntent({
		buyerStartingPoint: metadata?.buyerStartingPoint,
		checkoutCtaId: metadata?.checkoutCtaId,
		fulfillmentTrack: metadata?.fulfillmentTrack,
	});
}

export function getResolvedCheckoutIntentFields(
	existingIntent: CheckoutIntentInput | null | undefined,
	incomingIntent: CheckoutIntentInput | null | undefined,
) {
	const normalizedIncomingIntent = normalizeCheckoutIntent(incomingIntent);
	const normalizedExistingIntent = normalizeCheckoutIntent(existingIntent);

	if (
		normalizedIncomingIntent.fulfillmentTrack === "unspecified" &&
		normalizedExistingIntent.fulfillmentTrack !== "unspecified"
	) {
		return normalizedExistingIntent;
	}

	return normalizedIncomingIntent;
}
