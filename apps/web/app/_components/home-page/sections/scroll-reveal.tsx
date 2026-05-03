"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function ScrollReveal({
	children,
	className,
	delay = 0,
	direction = "up",
}: {
	children: ReactNode;
	className?: string;
	delay?: number;
	direction?: "up" | "none";
}) {
	const prefersReducedMotion = useReducedMotion() ?? false;
	const initialY = prefersReducedMotion || direction !== "up" ? 0 : 24;
	const duration = prefersReducedMotion ? 0 : 0.6;
	const effectiveDelay = prefersReducedMotion ? 0 : delay;

	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, y: initialY }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{
				duration,
				ease: [0.22, 1, 0.36, 1],
				delay: effectiveDelay,
			}}
			viewport={{ once: true, amount: 0.15 }}
		>
			{children}
		</motion.div>
	);
}
