"use client";

import { useCallback, useState } from "react";

import {
	CheckoutButton,
	type CheckoutButtonLoadingLabels,
} from "@/app/checkout/_components/checkout-button";
import { ExpressCheckoutButton } from "@/app/checkout/_components/express-checkout-button";
import { cn } from "@/lib/utils";

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
	const [isExpressCheckoutAvailable, setIsExpressCheckoutAvailable] =
		useState(false);
	const expressButtonHeight = className?.includes("h-16") ? 64 : 44;

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
				buttonHeight={expressButtonHeight}
				onBeforeCheckout={onBeforeCheckout}
				onAvailableChange={setIsExpressCheckoutAvailable}
				onError={handleExpressError}
			/>
			<div className={isExpressCheckoutAvailable ? "hidden" : ""}>
				<CheckoutButton
					label={label}
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
