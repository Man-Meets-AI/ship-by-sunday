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

export type CheckoutIntentInput = {
	readonly buyerStartingPoint?: JsonValue;
	readonly checkoutCtaId?: JsonValue;
	readonly fulfillmentTrack?: JsonValue;
};

const checkoutBuyerStartingPointSet = new Set<string>(
	checkoutBuyerStartingPoints,
);
const checkoutFulfillmentTrackSet = new Set<string>(checkoutFulfillmentTracks);
const checkoutCtaIdSet = new Set<string>(checkoutCtaIds);

export const UNSPECIFIED_CHECKOUT_INTENT = {
	buyerStartingPoint: "unspecified",
	checkoutCtaId: "unspecified",
	fulfillmentTrack: "unspecified",
} as const satisfies CheckoutIntent;

export function normalizeBuyerStartingPoint(
	value: JsonValue | undefined,
): BuyerStartingPoint {
	return typeof value === "string" && checkoutBuyerStartingPointSet.has(value)
		? (value as BuyerStartingPoint)
		: "unspecified";
}

export function normalizeFulfillmentTrack(
	value: JsonValue | undefined,
): FulfillmentTrack {
	return typeof value === "string" && checkoutFulfillmentTrackSet.has(value)
		? (value as FulfillmentTrack)
		: "unspecified";
}

export function normalizeCheckoutCtaId(
	value: JsonValue | undefined,
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

export function getBuyerStartingPointForFulfillmentTrack(
	fulfillmentTrack: FulfillmentTrack,
): BuyerStartingPoint {
	switch (fulfillmentTrack) {
		case "generated_codebase":
			return "no_codebase";
		case "existing_codebase_doctor":
			return "existing_codebase";
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

export function normalizeCheckoutIntentRequestBody(
	body: JsonValue | undefined,
) {
	if (!body || typeof body !== "object" || Array.isArray(body)) {
		return UNSPECIFIED_CHECKOUT_INTENT;
	}

	const record = body as JsonObject & CheckoutIntentInput;
	if (
		record.checkoutIntent &&
		typeof record.checkoutIntent === "object" &&
		!Array.isArray(record.checkoutIntent)
	) {
		return normalizeCheckoutIntent(
			record.checkoutIntent as CheckoutIntentInput,
		);
	}

	return normalizeCheckoutIntent(record);
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

export function getCheckoutIntentMetadata(checkoutIntent: CheckoutIntent) {
	return {
		buyerStartingPoint: checkoutIntent.buyerStartingPoint,
		checkoutCtaId: checkoutIntent.checkoutCtaId,
		fulfillmentTrack: checkoutIntent.fulfillmentTrack,
	};
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
import type { JsonObject, JsonValue } from "@/lib/json-value";
