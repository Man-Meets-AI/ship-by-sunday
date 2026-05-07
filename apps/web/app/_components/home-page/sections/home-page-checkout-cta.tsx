"use client";

import {
	CheckoutButton,
	type CheckoutButtonLoadingLabels,
} from "@/app/checkout/_components/checkout-button";

type HomePageCheckoutCtaProps = {
	readonly label: string;
	readonly className?: string;
	readonly testId?: string;
	readonly onBeforeCheckout?: () => void | Promise<void>;
	readonly onError?: (message: string | null) => void;
	readonly loadingLabels?: CheckoutButtonLoadingLabels;
};

export function HomePageCheckoutCta({
	label,
	className,
	testId,
	onBeforeCheckout,
	onError,
	loadingLabels,
}: HomePageCheckoutCtaProps) {
	return (
		<CheckoutButton
			label={label}
			className={className}
			testId={testId}
			onBeforeCheckout={onBeforeCheckout}
			onError={onError}
			loadingLabels={loadingLabels}
		/>
	);
}
