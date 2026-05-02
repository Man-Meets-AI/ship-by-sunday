"use client";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useStripeCheckout } from "@/app/checkout/_hooks/use-stripe-checkout";

export type CheckoutButtonLoadingLabels = {
	saving?: string;
	redirecting?: string;
};

const DEFAULT_REDIRECTING_LABEL = "Redirecting...";

export function CheckoutButton({
	label,
	className,
	testId,
	onBeforeCheckout,
	onError,
	loadingLabels,
}: {
	label: string;
	className?: string;
	testId?: string;
	onBeforeCheckout?: () => void | Promise<void>;
	onError?: (message: string | null) => void;
	loadingLabels?: CheckoutButtonLoadingLabels;
}) {
	const { startCheckout, phase, isLoading, error } = useStripeCheckout({
		onBeforeCheckout,
	});

	useEffect(() => {
		if (!onError) {
			return;
		}
		onError(error);
	}, [error, onError]);

	const savingLabel = loadingLabels?.saving ?? DEFAULT_REDIRECTING_LABEL;
	const redirectingLabel =
		loadingLabels?.redirecting ?? DEFAULT_REDIRECTING_LABEL;
	const activeLoadingLabel =
		phase === "saving" ? savingLabel : redirectingLabel;

	const showInternalAlert = !onError && error !== null;

	return (
		<div className="flex flex-col gap-2">
			<Button
				type="button"
				data-testid={testId}
				onClick={() => void startCheckout()}
				disabled={isLoading}
				aria-busy={isLoading ? "true" : "false"}
				className={className}
			>
				{isLoading ? (
					<>
						<Loader2 className="animate-spin" aria-hidden />
						{activeLoadingLabel}
					</>
				) : (
					label
				)}
			</Button>
			{showInternalAlert ? (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}
		</div>
	);
}
