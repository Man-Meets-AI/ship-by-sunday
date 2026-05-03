"use client";

import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { useBlueprintDemoReducedMotion } from "./blueprint-demo-motion";

const SAVED_PILL_VISIBLE_MS = 2000;

export function BlueprintDemoSavedLocally({
	lastSavedAt,
	scope,
}: {
	readonly lastSavedAt: number | null;
	readonly scope: "foundation" | "design" | "pricing";
}) {
	const [isVisible, setIsVisible] = useState(false);
	const prefersReducedMotion = useBlueprintDemoReducedMotion();

	useEffect(() => {
		if (lastSavedAt === null) {
			return;
		}
		setIsVisible(true);
		const handle = window.setTimeout(() => {
			setIsVisible(false);
		}, SAVED_PILL_VISIBLE_MS);
		return () => {
			window.clearTimeout(handle);
		};
	}, [lastSavedAt]);

	const motionProps = prefersReducedMotion
		? {
				initial: { opacity: 1 },
				animate: { opacity: 1 },
				exit: { opacity: 0 },
				transition: { duration: 0.0 },
			}
		: {
				initial: { opacity: 0, y: 4 },
				animate: { opacity: 1, y: 0 },
				exit: { opacity: 0, y: -2 },
				transition: { duration: 0.18, ease: "easeOut" as const },
			};

	return (
		<div
			className="pointer-events-none flex h-4 items-center justify-end"
			data-testid={`blueprint-demo-saved-locally-${scope}`}
			data-saved-visible={isVisible ? "true" : "false"}
			aria-live="polite"
		>
			<AnimatePresence>
				{isVisible ? (
					<motion.span
						{...motionProps}
						className="inline-flex items-center gap-1 rounded-full bg-muted/40 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground"
					>
						<Check className="size-3" aria-hidden />
						Saved locally
					</motion.span>
				) : null}
			</AnimatePresence>
		</div>
	);
}
