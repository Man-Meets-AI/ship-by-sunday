"use client";

import { CheckCircle2Icon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCodebasePageReducedMotion } from "@/app/(workspace)/_components/codebase-flow/codebase-page-motion";
import { cn } from "@/lib/utils";

export function CodebasePageSectionBadge({
	sectionId,
	sectionNumber,
	isComplete,
}: {
	sectionId: string;
	sectionNumber: number;
	isComplete: boolean;
}) {
	const prefersReducedMotion = useCodebasePageReducedMotion();

	return (
		<motion.span
			layout={prefersReducedMotion ? false : "preserve-aspect"}
			transition={
				prefersReducedMotion
					? { duration: 0 }
					: { duration: 0.25, ease: "easeOut" }
			}
			className={cn(
				"mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-medium transition-colors motion-reduce:transition-none",
				isComplete
					? "bg-foreground text-background"
					: "border border-border/80 text-muted-foreground",
			)}
			data-progress={isComplete ? "complete" : "incomplete"}
			data-testid={`codebase-page-section-badge-${sectionId}`}
		>
			<AnimatePresence mode="wait" initial={false}>
				{isComplete ? (
					<motion.span
						key="check"
						initial={
							prefersReducedMotion
								? { opacity: 1 }
								: { scale: 0.55, opacity: 0 }
						}
						animate={
							prefersReducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }
						}
						exit={{ opacity: 0 }}
						transition={
							prefersReducedMotion
								? { duration: 0 }
								: { type: "spring", stiffness: 520, damping: 22 }
						}
						className="flex"
					>
						<CheckCircle2Icon className="size-3.5" aria-hidden />
					</motion.span>
				) : (
					<motion.span
						key="number"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={
							prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }
						}
					>
						{sectionNumber}
					</motion.span>
				)}
			</AnimatePresence>
		</motion.span>
	);
}
