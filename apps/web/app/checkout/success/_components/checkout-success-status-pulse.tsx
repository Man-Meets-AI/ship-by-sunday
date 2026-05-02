type CheckoutSuccessStatusPulseProps = {
	readonly isPolling: boolean;
};

export function CheckoutSuccessStatusPulse({
	isPolling,
}: CheckoutSuccessStatusPulseProps) {
	return (
		<span
			className="relative inline-flex size-2 shrink-0 items-center justify-center"
			data-testid="checkout-success-status-pulse"
			data-polling={isPolling ? "true" : "false"}
			aria-hidden="true"
		>
			{isPolling ? (
				<span className="absolute inset-0 rounded-full bg-foreground/30 motion-safe:animate-ping" />
			) : null}
			<span className="relative inline-flex size-2 rounded-full bg-foreground" />
		</span>
	);
}
