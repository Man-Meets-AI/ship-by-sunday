import "server-only";

import { fetchQuery } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import type { ProductAccess } from "@/lib/product-access";
import { CLERK_CONVEX_TOKEN_TEMPLATE } from "@/platform/auth/convex-auth";
import type { CheckoutOfferId } from "@/platform/billing/checkout/checkout-offers";

type ConvexTokenProvider = (options: {
	template: typeof CLERK_CONVEX_TOKEN_TEMPLATE;
}) => Promise<string | null>;

export async function hasActiveWorkersAccessForCheckout({
	offerId,
	getToken,
}: {
	offerId: CheckoutOfferId;
	getToken?: ConvexTokenProvider;
}) {
	if (offerId !== "workers" || !getToken) {
		return false;
	}

	const token = await getToken({ template: CLERK_CONVEX_TOKEN_TEMPLATE });
	if (!token) {
		return false;
	}

	const access = (await fetchQuery(
		api.entitlements.viewerProductAccess,
		{},
		{ token },
	)) as ProductAccess;

	return access.hasAccess && access.capabilities.includes("worker");
}
