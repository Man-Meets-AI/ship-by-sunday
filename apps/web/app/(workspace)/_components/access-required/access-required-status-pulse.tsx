type AccessRequiredStatusPulseProps = {
	readonly isPolling: boolean;
};

export function AccessRequiredStatusPulse({
	isPolling,
}: AccessRequiredStatusPulseProps) {
	return (
		<span
			className="relative inline-flex size-2 shrink-0 items-center justify-center"
			data-testid="access-required-status-pulse"
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
