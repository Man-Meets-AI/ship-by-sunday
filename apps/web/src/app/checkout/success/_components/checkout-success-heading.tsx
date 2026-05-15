"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type CheckoutSuccessHeadingProps = {
	readonly heading: string;
};

export function CheckoutSuccessHeading({
	heading,
}: CheckoutSuccessHeadingProps) {
	const prefersReducedMotion = useReducedMotion() ?? false;

	if (prefersReducedMotion) {
		return (
			<span data-testid="checkout-success-heading" data-heading={heading}>
				{heading}
			</span>
		);
	}

	return (
		<span
			data-testid="checkout-success-heading"
			data-heading={heading}
			className="relative inline-block"
		>
			<AnimatePresence initial={false} mode="wait">
				<motion.span
					key={heading}
					initial={{ opacity: 0, y: 4 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -4 }}
					transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
				>
					{heading}
				</motion.span>
			</AnimatePresence>
		</span>
	);
}
