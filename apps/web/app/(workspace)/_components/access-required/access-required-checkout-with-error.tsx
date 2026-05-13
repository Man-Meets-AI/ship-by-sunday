"use client";

import { OctagonAlert, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

import { CheckoutButton } from "@/app/checkout/_components/checkout-button";
import { getCheckoutOfferIdForProtectedPath } from "@/platform/billing/checkout/checkout-offers";

const CHECKOUT_LOADING_LABELS = {
	saving: "Securing checkout…",
	redirecting: "Opening Stripe…",
} as const;

export function AccessRequiredCheckoutWithError({
	label,
	className,
}: {
	readonly label: string;
	readonly className?: string;
}) {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const pathname = usePathname();
	const offerId = getCheckoutOfferIdForProtectedPath(pathname ?? "/");

	const handleError = useCallback((message: string | null) => {
		setErrorMessage(message);
	}, []);

	const dismissError = useCallback(() => {
		setErrorMessage(null);
	}, []);

	return (
		<div className="flex w-full flex-col gap-2 sm:w-auto">
			{errorMessage ? (
				<div
					role="alert"
					data-testid="access-required-checkout-error"
					className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs leading-5 text-destructive"
				>
					<OctagonAlert
						className="mt-0.5 size-3.5 shrink-0"
						aria-hidden="true"
					/>
					<span className="flex-1 text-destructive-foreground/90">
						{errorMessage}
					</span>
					<button
						type="button"
						onClick={dismissError}
						className="ml-1 inline-flex size-5 shrink-0 items-center justify-center rounded-md text-destructive/80 transition-colors hover:bg-destructive/15 hover:text-destructive"
						aria-label="Dismiss error"
					>
						<X className="size-3.5" aria-hidden="true" />
					</button>
				</div>
			) : null}
			<CheckoutButton
				offerId={offerId}
				label={label}
				testId="access-required-buy-access"
				className={className}
				loadingLabels={CHECKOUT_LOADING_LABELS}
				onError={handleError}
			/>
		</div>
	);
}
