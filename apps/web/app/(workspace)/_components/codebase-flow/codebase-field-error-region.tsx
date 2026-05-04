"use client";

import { motion } from "motion/react";
import { FieldError } from "@/components/ui/field";
import { useCodebasePageReducedMotion } from "@/app/(workspace)/_components/codebase-flow/codebase-page-motion";

export function CodebaseFieldErrorRegion({
	errorId,
	errorMessage,
}: {
	errorId?: string;
	errorMessage?: string;
}) {
	const prefersReducedMotion = useCodebasePageReducedMotion();
	return (
		<motion.div
			key={errorMessage ? "error-visible" : "error-empty"}
			initial={prefersReducedMotion ? false : { opacity: 0, y: -2 }}
			animate={{ opacity: 1, y: 0 }}
			transition={
				prefersReducedMotion
					? { duration: 0 }
					: { duration: 0.18, ease: "easeOut" }
			}
		>
			<FieldError id={errorId}>{errorMessage}</FieldError>
		</motion.div>
	);
}
