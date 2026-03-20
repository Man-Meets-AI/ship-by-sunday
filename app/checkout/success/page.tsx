import type { Metadata } from "next";
import { api } from "@/convex/_generated/api";
import { CheckoutSuccessView } from "@/features/checkout/components/checkout-success-view";
import { getCheckoutSessionState } from "@/features/checkout/server/checkout-session";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ session_id?: string }>;
}) {
	const { session_id: sessionId } = await searchParams;
	const checkoutSessionState = await getCheckoutSessionState(sessionId);
	const initialProductAccess =
		checkoutSessionState.kind === "validated"
			? await fetchAuthenticatedQuery(api.access.viewerProductAccess, {})
			: null;

	return (
		<CheckoutSuccessView
			checkoutSessionState={checkoutSessionState}
			initialProductAccess={initialProductAccess}
		/>
	);
}
