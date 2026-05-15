"use client";

import {
	CheckoutButton,
	type CheckoutButtonLoadingLabels,
} from "@/app/checkout/_components/checkout-button";
import type { CheckoutOfferId } from "@/platform/billing/checkout/checkout-offers";

type HomePageCheckoutCtaProps = {
	readonly offerId: CheckoutOfferId;
	readonly label: string;
	readonly className?: string;
	readonly testId?: string;
	readonly onBeforeCheckout?: () => void | Promise<void>;
	readonly onError?: (message: string | null) => void;
	readonly loadingLabels?: CheckoutButtonLoadingLabels;
};

export function HomePageCheckoutCta({
	offerId,
	label,
	className,
	testId,
	onBeforeCheckout,
	onError,
	loadingLabels,
}: HomePageCheckoutCtaProps) {
	return (
		<CheckoutButton
			offerId={offerId}
			label={label}
			className={className}
			testId={testId}
			onBeforeCheckout={onBeforeCheckout}
			onError={onError}
			loadingLabels={loadingLabels}
		/>
	);
}
