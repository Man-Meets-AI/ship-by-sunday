"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getLessonHref } from "@/features/course/lesson/model/manifest";
import {
	getSkillRailNavigation,
	getSkillRailShortcutDirection,
	shouldHandleSkillRailShortcut,
	type SkillRailLesson,
	type SkillRailNavigationTarget,
} from "@/features/course/shared/utils/skill-rail-navigation";

export type SkillRailCompletionCue = {
	completedLessonId: string;
	nextLessonId: string | null;
};

const LOCKED_LESSON_REASON = "Complete the previous required lesson to unlock.";

type RailStepState = "done" | "current" | "upcoming" | "locked";

function getRailStepState(
	lesson: SkillRailLesson,
	currentLessonId?: string,
): RailStepState {
	if (lesson.id === currentLessonId) {
		return "current";
	}

	if (lesson.status === "completed") {
		return "done";
	}

	if (lesson.status === "locked") {
		return "locked";
	}

	return "upcoming";
}

function slotClasses({
	state,
	isCompleting,
	isUnlocking,
}: {
	state: RailStepState;
	isCompleting: boolean;
	isUnlocking: boolean;
}) {
	const base =
		"relative flex h-11 min-w-[118px] shrink-0 items-center gap-2 overflow-hidden border-r border-product-border/25 px-3 transition-colors duration-100";

	if (isCompleting) {
		return `${base} bg-product-accent/14 text-product-accent shadow-[inset_0_0_0_1px_rgba(var(--product-accent),0.28)]`;
	}

	if (isUnlocking) {
		return `${base} bg-product-accent/8 text-product-text`;
	}

	if (state === "current") {
		return `${base} bg-product-accent/14 text-product-text shadow-[inset_0_0_0_1px_rgba(var(--product-accent),0.28)]`;
	}

	if (state === "done") {
		return `${base} bg-product-surface/82 text-product-text/80`;
	}

	if (state === "upcoming") {
		return `${base} bg-product-surface/70 text-product-muted`;
	}

	return `${base} bg-product-surface/64 text-product-muted/45`;
}

function RailStepIcon({ state }: { state: RailStepState }) {
	if (state === "done") {
		return (
			<span
				aria-hidden="true"
				className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-product-accent/45 text-product-accent"
			>
				<svg
					width="10"
					height="10"
					viewBox="0 0 12 12"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<polyline points="2 6.5 4.5 9 10 3.5" />
				</svg>
			</span>
		);
	}

	if (state === "locked") {
		return (
			<span
				aria-hidden="true"
				className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-product-border/60 text-product-muted/60"
			>
				<svg
					width="9"
					height="9"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<rect x="4.5" y="10" width="15" height="10" rx="2" />
					<path d="M8 10V7a4 4 0 0 1 8 0v3" />
				</svg>
			</span>
		);
	}

	return (
		<span
			aria-hidden="true"
			className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
				state === "current"
					? "border-product-accent bg-product-accent/25"
					: "border-product-border/70"
			}`}
		>
			<span
				className={`h-1.5 w-1.5 rounded-full ${
					state === "current" ? "bg-product-accent" : "bg-product-muted/55"
				}`}
			/>
		</span>
	);
}

function getLessonAriaLabel(lesson: SkillRailLesson, state: RailStepState) {
	if (state === "current") {
		return `${lesson.shortTitle}. Current lesson.`;
	}

	if (state === "done") {
		return `${lesson.shortTitle}. Completed lesson.`;
	}

	if (state === "locked") {
		return `${lesson.shortTitle}. Locked.`;
	}

	return `${lesson.shortTitle}. Available lesson.`;
}

function isCrossStageNavigationTarget(
	target: SkillRailNavigationTarget | null,
	lessons: SkillRailLesson[],
) {
	if (!target) {
		return false;
	}

	return !lessons.some((lesson) => lesson.id === target.id);
}

function SkillRailChevron({ direction }: { direction: "previous" | "next" }) {
	return (
		<svg
			aria-hidden="true"
			width="10"
			height="10"
			viewBox="0 0 10 10"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="shrink-0"
		>
			{direction === "previous" ? (
				<polyline points="6.5 1.75 3 5 6.5 8.25" />
			) : (
				<polyline points="3.5 1.75 7 5 3.5 8.25" />
			)}
		</svg>
	);
}

function SkillRailNavButton({
	direction,
	target,
	isCrossStage,
}: {
	direction: "previous" | "next";
	target: SkillRailNavigationTarget | null;
	isCrossStage: boolean;
}) {
	const shortcutKeys =
		direction === "previous" ? "ArrowLeft Q" : "ArrowRight E";
	const actionLabel =
		direction === "previous"
			? isCrossStage
				? "Previous stage"
				: "Previous"
			: isCrossStage
				? "Next stage"
				: "Next";
	const title = target
		? `Open ${direction} ${isCrossStage ? "stage" : "lesson"}${
				target.shortTitle ? `: ${target.shortTitle}` : ""
			}`
		: `No ${direction} lesson available`;
	const className = `flex h-11 min-w-[104px] shrink-0 items-center justify-center gap-1.5 border-r border-product-border/25 px-2.5 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors ${
		target
			? "cursor-pointer bg-product-surface/86 text-product-text hover:bg-product-accent/10 hover:text-product-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-product-accent/50"
			: "cursor-not-allowed bg-product-surface/74 text-product-muted/45"
	}`;

	const content = (
		<>
			{direction === "previous" ? (
				<SkillRailChevron direction="previous" />
			) : null}
			<span>{actionLabel}</span>
			{direction === "next" ? <SkillRailChevron direction="next" /> : null}
		</>
	);

	if (!target) {
		return (
			<button
				type="button"
				disabled
				title={title}
				aria-label={title}
				aria-keyshortcuts={shortcutKeys}
				data-disabled="true"
				className={className}
			>
				{content}
			</button>
		);
	}

	return (
		<Link
			href={target.href}
			scroll={false}
			title={title}
			aria-label={title}
			aria-keyshortcuts={shortcutKeys}
			data-disabled="false"
			className={className}
		>
			{content}
		</Link>
	);
}

function SkillRailStep({
	lesson,
	state,
	isCompleting,
	isUnlocking,
	isCurrent,
}: {
	lesson: SkillRailLesson;
	state: RailStepState;
	isCompleting: boolean;
	isUnlocking: boolean;
	isCurrent: boolean;
}) {
	const classes = slotClasses({
		state,
		isCompleting,
		isUnlocking,
	});
	const accessibilityLabel = getLessonAriaLabel(lesson, state);

	const content = (
		<>
			{isCompleting ? (
				<>
					<span
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 sbs-rail-complete-slot"
					/>
					<span
						aria-hidden="true"
						className="pointer-events-none absolute inset-y-0 left-[-20%] w-1/2 sbs-rail-complete-sweep"
					/>
				</>
			) : null}
			{isUnlocking ? (
				<span
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 sbs-rail-unlock-slot"
				/>
			) : null}
			<div className="relative z-[1] flex min-w-0 items-center gap-2">
				<RailStepIcon state={state} />
				<span className="truncate text-[11px] font-semibold uppercase tracking-[0.08em]">
					{lesson.shortTitle}
				</span>
			</div>
			{(state === "current" || isCompleting) && (
				<span className="absolute bottom-0 left-0 z-[1] h-[2px] w-full bg-product-accent" />
			)}
		</>
	);

	if (state === "locked") {
		return (
			<button
				type="button"
				aria-disabled="true"
				aria-label={accessibilityLabel}
				title={LOCKED_LESSON_REASON}
				onClick={(event) => {
					event.preventDefault();
				}}
				className={`${classes} cursor-not-allowed text-left`}
			>
				{content}
			</button>
		);
	}

	return (
		<Link
			href={getLessonHref(lesson.id)}
			scroll={false}
			aria-label={accessibilityLabel}
			aria-current={isCurrent ? "step" : undefined}
			className={`${classes} hover:bg-product-accent/8 hover:text-product-text`}
		>
			{content}
		</Link>
	);
}

export function SkillRail({
	label,
	lessons,
	navigationLessons,
	currentLessonId,
	completionCue,
}: {
	label: string;
	subtitle?: string;
	lessons: SkillRailLesson[];
	navigationLessons?: SkillRailLesson[];
	currentLessonId?: string;
	completionCue?: SkillRailCompletionCue | null;
}) {
	const router = useRouter();
	const showStageNavigation = Boolean(currentLessonId);
	const resolvedNavigationLessons = navigationLessons ?? lessons;
	const { previousTarget, nextTarget } = useMemo(
		() => getSkillRailNavigation(resolvedNavigationLessons, currentLessonId),
		[resolvedNavigationLessons, currentLessonId],
	);
	const previousIsCrossStage = isCrossStageNavigationTarget(
		previousTarget,
		lessons,
	);
	const nextIsCrossStage = isCrossStageNavigationTarget(nextTarget, lessons);

	useEffect(() => {
		if (!currentLessonId) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (!shouldHandleSkillRailShortcut(event)) {
				return;
			}

			const direction = getSkillRailShortcutDirection(event.key);
			const target =
				direction === "previous"
					? previousTarget
					: direction === "next"
						? nextTarget
						: null;

			if (!target) {
				return;
			}

			event.preventDefault();
			router.push(target.href, { scroll: false });
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [currentLessonId, nextTarget, previousTarget, router]);

	return (
		<nav
			aria-label={`${label} lesson navigation`}
			className="flex w-full min-w-0 items-stretch border border-product-border/30 bg-product-surface/78"
		>
			{showStageNavigation ? (
				<SkillRailNavButton
					direction="previous"
					target={previousTarget}
					isCrossStage={previousIsCrossStage}
				/>
			) : null}
			<div className="flex min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{lessons.map((lesson) => {
					const isCurrent = lesson.id === currentLessonId;
					const state = getRailStepState(lesson, currentLessonId);

					return (
						<SkillRailStep
							key={lesson.id}
							lesson={lesson}
							state={state}
							isCurrent={isCurrent}
							isCompleting={completionCue?.completedLessonId === lesson.id}
							isUnlocking={completionCue?.nextLessonId === lesson.id}
						/>
					);
				})}
			</div>
			{showStageNavigation ? (
				<SkillRailNavButton
					direction="next"
					target={nextTarget}
					isCrossStage={nextIsCrossStage}
				/>
			) : null}
		</nav>
	);
}
