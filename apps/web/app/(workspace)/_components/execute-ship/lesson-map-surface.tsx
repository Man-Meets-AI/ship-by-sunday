"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";

import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	getOrderedBonusBlocks,
	getRecommendedBuildLessonHref,
} from "@/lib/execute-ship/bonus-library-presentation";
import type { BonusMissionState } from "@/lib/execute-ship/bonus-mission-types";
import { BonusMissionBlockSection } from "./bonus-mission-block-card";
import { BonusMissionHeroCard } from "./bonus-mission-hero-card";

export function LessonMapSurface({
	id,
	currentBlockId = "BUILD",
	missionState,
	onDismiss,
}: {
	id?: string;
	currentBlockId?: string;
	missionState: BonusMissionState;
	onDismiss?: () => void;
}) {
	const orderedBlocks = getOrderedBonusBlocks(missionState);
	const reducedMotion = useReducedMotion() ?? false;
	const sectionRef = useRef<HTMLElement | null>(null);
	const headingRef = useRef<HTMLHeadingElement | null>(null);
	const previousFocusRef = useRef<Element | null>(null);

	useEffect(() => {
		previousFocusRef.current = document.activeElement;
		const section = sectionRef.current;
		const heading = headingRef.current;
		if (section) {
			section.scrollIntoView({
				block: "start",
				behavior: reducedMotion ? "auto" : "smooth",
			});
		}
		if (heading) {
			heading.focus({ preventScroll: true });
		}
	}, [reducedMotion]);

	const handleDismiss = useCallback(() => {
		if (!onDismiss) return;
		const previous = previousFocusRef.current;
		onDismiss();
		if (previous instanceof HTMLElement) {
			requestAnimationFrame(() => previous.focus());
		}
	}, [onDismiss]);

	useEffect(() => {
		if (!onDismiss) return;
		const handleKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.stopPropagation();
				handleDismiss();
			}
		};
		const section = sectionRef.current;
		section?.addEventListener("keydown", handleKey);
		return () => {
			section?.removeEventListener("keydown", handleKey);
		};
	}, [handleDismiss, onDismiss]);

	const motionProps = reducedMotion
		? { initial: { opacity: 1 }, animate: { opacity: 1 } }
		: {
				initial: { opacity: 0, y: 8 },
				animate: { opacity: 1, y: 0 },
				transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
			};

	return (
		<motion.section
			ref={sectionRef}
			id={id}
			data-testid="lesson-map-surface"
			tabIndex={-1}
			{...motionProps}
			className="space-y-6 rounded-[28px] border border-border/60 bg-muted/15 p-6 scroll-mt-24 focus:outline-none sm:p-8"
		>
			<div className="flex items-start justify-between gap-3">
				<div className="space-y-2">
					<h2
						ref={headingRef}
						tabIndex={-1}
						className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80 focus:outline-none"
					>
						Lesson Map
					</h2>
					<p className="text-sm leading-6 text-muted-foreground">
						Use this as the optional overview. Build remains the default path.
					</p>
				</div>
				{onDismiss ? (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={handleDismiss}
						data-testid="lesson-map-dismiss"
						className="shrink-0 gap-1.5"
					>
						<X className="size-3.5" aria-hidden />
						<span>Close</span>
					</Button>
				) : null}
			</div>
			<BonusMissionHeroCard
				exploredCount={missionState.exploredCount}
				totalLessons={missionState.totalLessons}
				recommendedLessonHref={getRecommendedBuildLessonHref(missionState)}
			/>
			<Accordion
				type="single"
				collapsible
				defaultValue={
					orderedBlocks.some((block) => block.id === currentBlockId)
						? currentBlockId
						: "BUILD"
				}
			>
				{orderedBlocks.map((block) => (
					<BonusMissionBlockSection key={block.id} block={block} />
				))}
			</Accordion>
		</motion.section>
	);
}
