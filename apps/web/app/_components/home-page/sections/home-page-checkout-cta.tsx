"use client";

import {
	CheckoutButton,
	type CheckoutButtonLoadingLabels,
} from "@/app/checkout/_components/checkout-button";
import type { CheckoutIntentInput } from "@/platform/billing/checkout/checkout-intent";

type HomePageCheckoutCtaProps = {
	readonly label: string;
	readonly checkoutIntent: CheckoutIntentInput;
	readonly className?: string;
	readonly testId?: string;
	readonly onBeforeCheckout?: () => void | Promise<void>;
	readonly onError?: (message: string | null) => void;
	readonly loadingLabels?: CheckoutButtonLoadingLabels;
};

export function HomePageCheckoutCta({
	label,
	checkoutIntent,
	className,
	testId,
	onBeforeCheckout,
	onError,
	loadingLabels,
}: HomePageCheckoutCtaProps) {
	return (
		<CheckoutButton
			label={label}
			checkoutIntent={checkoutIntent}
			className={className}
			testId={testId}
			onBeforeCheckout={onBeforeCheckout}
			onError={onError}
			loadingLabels={loadingLabels}
		/>
	);
}
