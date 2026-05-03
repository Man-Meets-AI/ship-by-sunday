"use client";

import { motion, useReducedMotion } from "motion/react";

export function CoachPanelMotion({ children }: { children: React.ReactNode }) {
	const reducedMotion = useReducedMotion() ?? false;

	if (reducedMotion) {
		return <>{children}</>;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 4 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
		>
			{children}
		</motion.div>
	);
}
