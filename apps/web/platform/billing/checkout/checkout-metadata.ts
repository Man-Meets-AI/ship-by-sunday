import { productConfig } from "../../../config/product";
import { isCheckoutOfferId, type CheckoutOfferId } from "./checkout-offers";

export const checkoutMetadataSchema = "mma_checkout_v1";
export const checkoutMetadataApp = "man_meets_ai";
export const checkoutAccessProduct = "paid_app_access";

export const checkoutSurfaces = [
	"hosted_checkout",
	"express_checkout",
] as const;

export type CheckoutSurface = (typeof checkoutSurfaces)[number];

export type CheckoutPurchaseMetadata = {
	metadataSchema: typeof checkoutMetadataSchema;
	app: typeof checkoutMetadataApp;
	accessProduct: typeof checkoutAccessProduct;
	purchaseIntentId: string;
	offerId?: CheckoutOfferId;
	checkoutSurface: CheckoutSurface;
	clerkUserId?: string;
};

const checkoutSurfaceSet = new Set<string>(checkoutSurfaces);

export function isCheckoutSurface(value: string): value is CheckoutSurface {
	return checkoutSurfaceSet.has(value);
}

export function buildCheckoutPurchaseMetadata({
	checkoutSurface,
	clerkUserId,
	offerId,
	purchaseIntentId,
}: {
	checkoutSurface: CheckoutSurface;
	clerkUserId: string | null;
	offerId: CheckoutOfferId;
	purchaseIntentId: string;
}): CheckoutPurchaseMetadata {
	return {
		metadataSchema: checkoutMetadataSchema,
		app: checkoutMetadataApp,
		accessProduct: checkoutAccessProduct,
		purchaseIntentId,
		offerId,
		checkoutSurface,
		...(clerkUserId ? { clerkUserId } : {}),
	};
}

export function readCheckoutPurchaseMetadata(
	metadata: Record<string, string> | null | undefined,
): CheckoutPurchaseMetadata | null {
	if (
		metadata?.metadataSchema !== checkoutMetadataSchema ||
		metadata.app !== checkoutMetadataApp ||
		metadata.accessProduct !== checkoutAccessProduct ||
		!metadata.purchaseIntentId ||
		!isCheckoutSurface(metadata.checkoutSurface)
	) {
		return null;
	}

	return {
		metadataSchema: checkoutMetadataSchema,
		app: checkoutMetadataApp,
		accessProduct: checkoutAccessProduct,
		purchaseIntentId: metadata.purchaseIntentId,
		...(isCheckoutOfferId(metadata.offerId)
			? { offerId: metadata.offerId }
			: {}),
		checkoutSurface: metadata.checkoutSurface,
		...(metadata.clerkUserId ? { clerkUserId: metadata.clerkUserId } : {}),
	};
}

export function isPaidAppCheckoutMetadata(
	metadata: Record<string, string> | null | undefined,
): boolean {
	return (
		readCheckoutPurchaseMetadata(metadata) !== null ||
		metadata?.courseSlug === productConfig.courseSlug
	);
}

export function readCheckoutMetadataClerkUserId({
	clientReferenceId,
	metadata,
}: {
	clientReferenceId?: string | null;
	metadata: Record<string, string> | null | undefined;
}) {
	return (
		readCheckoutPurchaseMetadata(metadata)?.clerkUserId ??
		metadata?.clerkUserId ??
		clientReferenceId ??
		null
	);
}
