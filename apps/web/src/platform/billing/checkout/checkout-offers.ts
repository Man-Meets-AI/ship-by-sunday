import { routeConfig } from "../../../config/product";
import type { ProductSurfaceCapability } from "../../access/product-surface-capabilities";
import type { FulfillmentTrack } from "./checkout-intent";

export const checkoutOfferIds = ["starter", "workers"] as const;

export type CheckoutOfferId = (typeof checkoutOfferIds)[number];

type CheckoutOffer = {
	readonly id: CheckoutOfferId;
	readonly name: string;
	readonly description: string;
	readonly priceUsdCents: number;
	readonly priceDisplay: string;
	readonly currency: "usd";
	readonly publicPath: string;
	readonly successPath: string;
	readonly capabilities: readonly ProductSurfaceCapability[];
	readonly fulfillmentTrack: FulfillmentTrack;
};

const checkoutOfferIdSet = new Set<string>(checkoutOfferIds);

export const checkoutOffers = {
	starter: {
		id: "starter",
		name: "Ship Your Idea by Sunday",
		description:
			"Starter codebase generator, template path, and guided videos for new builders.",
		priceUsdCents: 29700,
		priceDisplay: "$297",
		currency: "usd",
		publicPath: routeConfig.starter,
		successPath: routeConfig.starterHome,
		capabilities: ["generate_codebase", "tutorials"],
		fulfillmentTrack: "generated_codebase",
	},
	workers: {
		id: "workers",
		name: "Ship by Sunday Workers",
		description:
			"Existing-repo Worker install, doctor pass, top findings, one approved loop, and proof.",
		priceUsdCents: 60000,
		priceDisplay: "$600",
		currency: "usd",
		publicPath: routeConfig.workers,
		successPath: routeConfig.workspaceSetup,
		capabilities: ["worker"],
		fulfillmentTrack: "existing_codebase_doctor",
	},
} as const satisfies Record<CheckoutOfferId, CheckoutOffer>;

export function isCheckoutOfferId(value: string): value is CheckoutOfferId {
	return checkoutOfferIdSet.has(value);
}

export function readCheckoutOfferId(
	value: string | null | undefined,
): CheckoutOfferId | undefined {
	return typeof value === "string" && isCheckoutOfferId(value)
		? value
		: undefined;
}

export function requireCheckoutOfferId(value: string): CheckoutOfferId {
	if (!isCheckoutOfferId(value)) {
		throw new Error(`Unsupported checkout offer: ${value}`);
	}

	return value;
}

export function getCheckoutOffer(offerId: CheckoutOfferId): CheckoutOffer {
	return checkoutOffers[offerId];
}

export function getCheckoutOfferCapabilities(
	offerId: CheckoutOfferId | undefined,
): ProductSurfaceCapability[] | undefined {
	if (!offerId) {
		return undefined;
	}

	return [...checkoutOffers[offerId].capabilities];
}

export function getCheckoutOfferSuccessPath(
	offerId: CheckoutOfferId | undefined,
) {
	return offerId ? checkoutOffers[offerId].successPath : routeConfig.appHome;
}

export function getCheckoutOfferPublicPathForProtectedPath(pathname: string) {
	if (
		pathname === routeConfig.workers ||
		pathname.startsWith(`${routeConfig.workers}/`)
	) {
		return routeConfig.workers;
	}

	if (
		pathname === routeConfig.starter ||
		pathname.startsWith(`${routeConfig.starter}/`) ||
		pathname === routeConfig.legacyCodebase ||
		pathname.startsWith(`${routeConfig.legacyCodebase}/`) ||
		pathname === routeConfig.legacyTutorials ||
		pathname.startsWith(`${routeConfig.legacyTutorials}/`)
	) {
		return routeConfig.starter;
	}

	return routeConfig.starter;
}

export function getCheckoutOfferIdForProtectedPath(
	pathname: string,
): CheckoutOfferId {
	const offerPath = getCheckoutOfferPublicPathForProtectedPath(pathname);
	return offerPath === routeConfig.workers ? "workers" : "starter";
}

export function getCheckoutOfferIdForLegacyFulfillmentTrack(
	fulfillmentTrack: FulfillmentTrack,
): CheckoutOfferId | undefined {
	switch (fulfillmentTrack) {
		case "generated_codebase":
			return "starter";
		case "existing_codebase_doctor":
			return "workers";
		case "unspecified":
			return undefined;
	}
}
