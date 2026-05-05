"use client";

import { useCallback, useState } from "react";

import {
	CheckoutButton,
	type CheckoutButtonLoadingLabels,
} from "@/app/checkout/_components/checkout-button";
import { ExpressCheckoutButton } from "@/app/checkout/_components/express-checkout-button";
import { cn } from "@/lib/utils";
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

const DEFAULT_EXPRESS_CHECKOUT_BUTTON_HEIGHT = 44;
const TALL_EXPRESS_CHECKOUT_BUTTON_HEIGHT = 55;

export function HomePageCheckoutCta({
	label,
	checkoutIntent,
	className,
	testId,
	onBeforeCheckout,
	onError,
	loadingLabels,
}: HomePageCheckoutCtaProps) {
	const [isExpressCheckoutAvailable, setIsExpressCheckoutAvailable] =
		useState(false);
	const expressButtonHeight = className?.includes("h-16")
		? TALL_EXPRESS_CHECKOUT_BUTTON_HEIGHT
		: DEFAULT_EXPRESS_CHECKOUT_BUTTON_HEIGHT;

	const handleExpressError = useCallback(
		(message: string | null) => {
			if (message) {
				setIsExpressCheckoutAvailable(false);
			}
			onError?.(message);
		},
		[onError],
	);

	return (
		<div className="flex w-full flex-col gap-2">
			<ExpressCheckoutButton
				className={cn("w-full", isExpressCheckoutAvailable ? "" : "hidden")}
				testId={testId ? `${testId}-express` : undefined}
				checkoutIntent={checkoutIntent}
				buttonHeight={expressButtonHeight}
				onBeforeCheckout={onBeforeCheckout}
				onAvailableChange={setIsExpressCheckoutAvailable}
				onError={handleExpressError}
			/>
			<div className={isExpressCheckoutAvailable ? "hidden" : ""}>
				<CheckoutButton
					label={label}
					checkoutIntent={checkoutIntent}
					className={className}
					testId={testId}
					onBeforeCheckout={onBeforeCheckout}
					onError={onError}
					loadingLabels={loadingLabels}
				/>
			</div>
		</div>
	);
}
