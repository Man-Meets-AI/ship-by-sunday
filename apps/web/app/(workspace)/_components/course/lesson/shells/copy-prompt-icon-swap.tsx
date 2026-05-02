"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Clipboard } from "lucide-react";

export function CopyPromptIconSwap({ isCopied }: { isCopied: boolean }) {
	const reducedMotion = useReducedMotion() ?? false;

	const motionProps = reducedMotion
		? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
		: {
				initial: { opacity: 0, scale: 0.85 },
				animate: { opacity: 1, scale: 1 },
				exit: { opacity: 0, scale: 0.85 },
				transition: { duration: 0.15, ease: "easeOut" as const },
			};

	return (
		<span
			aria-hidden
			className="relative inline-flex size-3.5 items-center justify-center"
		>
			<AnimatePresence mode="wait" initial={false}>
				{isCopied ? (
					<motion.span
						key="copied"
						{...motionProps}
						className="absolute inset-0 flex items-center justify-center"
					>
						<Check className="size-3.5" />
					</motion.span>
				) : (
					<motion.span
						key="copy"
						{...motionProps}
						className="absolute inset-0 flex items-center justify-center"
					>
						<Clipboard className="size-3.5" />
					</motion.span>
				)}
			</AnimatePresence>
		</span>
	);
}
