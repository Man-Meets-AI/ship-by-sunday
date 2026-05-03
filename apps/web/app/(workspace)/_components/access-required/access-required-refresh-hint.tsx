"use client";

import { motion, useReducedMotion } from "motion/react";

export function AccessRequiredRefreshHint({
	refreshHint,
}: {
	readonly refreshHint: string;
}) {
	const prefersReducedMotion = useReducedMotion() ?? false;

	return (
		<p
			className="min-h-[1.25rem] text-xs leading-5 text-muted-foreground"
			data-testid="access-required-refresh-hint"
			aria-live="polite"
		>
			<motion.span
				key={refreshHint}
				className="block"
				initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={
					prefersReducedMotion
						? { duration: 0 }
						: { duration: 0.2, ease: "easeOut" }
				}
			>
				{refreshHint}
			</motion.span>
		</p>
	);
}
