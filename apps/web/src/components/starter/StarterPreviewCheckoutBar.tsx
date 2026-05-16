import { OctagonAlert, ShieldCheck, X } from "lucide-react";

import { CheckoutButton } from "@/app/checkout/_components/checkout-button";
import { cn } from "@/lib/utils";

const CHECKOUT_LOADING_LABELS = {
	saving: "Saving your draft...",
	redirecting: "Opening checkout...",
} as const;

export function StarterPreviewCheckoutBar({
	label,
	lockedNote,
	offerPriceDisplay,
	errorMessage,
	onDismissError,
	onError,
	onBeforeCheckout,
}: {
	readonly label: string;
	readonly lockedNote: string;
	readonly offerPriceDisplay: string;
	readonly errorMessage: string | null;
	readonly onDismissError: () => void;
	readonly onError: (message: string | null) => void;
	readonly onBeforeCheckout: () => void | Promise<void>;
}) {
	return (
		<div
			className={cn(
				"flex flex-col gap-4 rounded-lg border border-border/70 bg-card p-5 text-card-foreground shadow-xs/5",
				"sm:flex-row sm:items-center sm:justify-between",
			)}
		>
			<div className="min-w-0 flex-1 space-y-2">
				<p className="flex items-start gap-2 text-sm font-medium text-foreground">
					<ShieldCheck
						className="mt-0.5 size-4 shrink-0 text-foreground/70"
						aria-hidden
					/>
					<span>{lockedNote}</span>
				</p>
				<p className="text-xs leading-5 text-muted-foreground">
					Starter checkout - {offerPriceDisplay}
				</p>
				{errorMessage ? (
					<div
						role="alert"
						data-testid="starter-preview-checkout-error"
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
							onClick={onDismissError}
							className="ml-1 inline-flex size-5 items-center justify-center rounded-md text-destructive/80 transition-colors hover:bg-destructive/15 hover:text-destructive"
							aria-label="Dismiss error"
						>
							<X className="size-3.5" aria-hidden="true" />
						</button>
					</div>
				) : null}
			</div>
			<div className="shrink-0">
				<CheckoutButton
					offerId="starter"
					label={label}
					testId="starter-preview-checkout-cta"
					className="h-11 px-5"
					onBeforeCheckout={onBeforeCheckout}
					onError={onError}
					loadingLabels={CHECKOUT_LOADING_LABELS}
				/>
			</div>
		</div>
	);
}
