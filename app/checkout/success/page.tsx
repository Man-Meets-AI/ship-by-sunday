import { CheckoutSuccessView } from "@/features/checkout/components/checkout-success-view";
import { getCheckoutSessionState } from "@/features/checkout/server/checkout-session";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ session_id?: string }>;
}) {
	const { session_id: sessionId } = await searchParams;
	const checkoutSessionState = await getCheckoutSessionState(sessionId);

	return <CheckoutSuccessView checkoutSessionState={checkoutSessionState} />;
}
