"use client";

import { motion } from "motion/react";
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
	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, y: direction === "up" ? 24 : 0 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
			viewport={{ once: true, amount: 0.15 }}
		>
			{children}
		</motion.div>
	);
}
