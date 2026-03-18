import { CheckoutSuccessView } from "@/features/checkout/components/checkout-success-view";
import { getCheckoutSessionState } from "@/features/checkout/server/checkout-session";
import { getInitialProductTheme } from "@/features/course/shared/server/product-theme";

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
