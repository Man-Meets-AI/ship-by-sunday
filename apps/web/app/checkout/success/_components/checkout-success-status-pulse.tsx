"use client";

import { motion, useReducedMotion } from "motion/react";

type CheckoutSuccessStatusPulseProps = {
	readonly isPolling: boolean;
	readonly triggerArmedTransition?: boolean;
};

export function CheckoutSuccessStatusPulse({
	isPolling,
	triggerArmedTransition = false,
}: CheckoutSuccessStatusPulseProps) {
	const prefersReducedMotion = useReducedMotion() ?? false;
	const showArmedRing = !prefersReducedMotion && triggerArmedTransition;

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
			{showArmedRing ? (
				<motion.span
					data-testid="checkout-success-status-pulse-armed-ring"
					className="absolute inset-0 rounded-full ring-1 ring-foreground/40"
					initial={{ scale: 1, opacity: 0.4 }}
					animate={{ scale: 8, opacity: 0 }}
					transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
				/>
			) : null}
			<span className="relative inline-flex size-2 rounded-full bg-foreground" />
		</span>
	);
}
