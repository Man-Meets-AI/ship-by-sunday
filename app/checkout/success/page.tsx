import { CheckoutSuccessView } from "@/components/checkout-success-view";
import { getCheckoutSessionState } from "@/lib/server/checkout-session";
import { getInitialProductTheme } from "@/lib/server/product-theme";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ session_id?: string }>;
}) {
	const initialTheme = await getInitialProductTheme();
	const { session_id: sessionId } = await searchParams;
	const checkoutSessionState = await getCheckoutSessionState(sessionId);

	return (
		<CheckoutSuccessView
			initialTheme={initialTheme}
			checkoutSessionState={checkoutSessionState}
		/>
	);
}
