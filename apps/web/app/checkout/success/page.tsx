import type { Metadata } from "next";
import { api } from "@/convex/_generated/api";
import { CheckoutSuccessView } from "@/app/checkout/success/_components/checkout-success-view";
import { getCheckoutSessionState } from "@/features/checkout/server/checkout-session";
import { getPendingCheckoutSessionIdFromCookie } from "@/features/checkout/server/checkout-session-recovery";
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
	const { session_id: searchSessionId } = await searchParams;
	const sessionId =
		searchSessionId ??
		(await getPendingCheckoutSessionIdFromCookie()) ??
		undefined;
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
