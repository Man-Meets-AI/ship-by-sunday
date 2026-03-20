"use client";

import { Loader2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useStripeCheckout } from "@/features/checkout/hooks/use-stripe-checkout";

export function CheckoutButton({
	label,
	className,
	testId,
}: {
	label: string;
	className?: string;
	testId?: string;
}) {
	const { startCheckout, isLoading, error } = useStripeCheckout();
	const loadingLabel = "Redirecting...";

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
						{loadingLabel}
					</>
				) : (
					label
				)}
			</Button>
			{error ? (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}
		</div>
	);
}
