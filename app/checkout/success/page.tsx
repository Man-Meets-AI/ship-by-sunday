import { api } from "@/convex/_generated/api";
import { CheckoutSuccessView } from "@/features/checkout/components/checkout-success-view";
import { getCheckoutSessionState } from "@/features/checkout/server/checkout-session";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ session_id?: string }>;
}) {
	const { session_id: sessionId } = await searchParams;
	const checkoutSessionState = await getCheckoutSessionState(sessionId);

	return (
		<CheckoutSuccessView
			checkoutSessionState={checkoutSessionState}
			initialProductAccess={await fetchAuthenticatedQuery(
				api.access.viewerProductAccess,
				{},
			)}
		/>
	);
}
