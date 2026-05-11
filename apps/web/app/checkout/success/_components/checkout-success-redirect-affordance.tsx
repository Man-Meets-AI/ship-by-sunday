"use client";

import { Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

type CheckoutSuccessRedirectAffordanceProps = {
	readonly canAutoRedirect: boolean;
};

export function CheckoutSuccessRedirectAffordance({
	canAutoRedirect,
}: CheckoutSuccessRedirectAffordanceProps) {
	const prefersReducedMotion = useReducedMotion() ?? false;

	if (!canAutoRedirect) {
		return null;
	}

	const initial = prefersReducedMotion
		? { opacity: 1, y: 0 }
		: { opacity: 0, y: 4 };
	const transition = prefersReducedMotion
		? { duration: 0 }
		: { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };

	return (
		<motion.p
			data-testid="checkout-success-redirect-affordance"
			className="inline-flex items-center gap-2 text-sm text-muted-foreground"
			initial={initial}
			animate={{ opacity: 1, y: 0 }}
			transition={transition}
		>
			<Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
			<span>Opening home…</span>
		</motion.p>
	);
}
