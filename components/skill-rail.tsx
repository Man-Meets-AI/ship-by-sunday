"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getLessonHref } from "@/lib/course/manifest";
import {
	getSkillRailNavigation,
	getSkillRailShortcutDirection,
	shouldHandleSkillRailShortcut,
	type SkillRailLesson,
	type SkillRailNavigationTarget,
} from "@/components/skill-rail-navigation";

export type SkillRailCompletionCue = {
	completedLessonId: string;
	nextLessonId: string | null;
};

function slotClasses({
	isCurrent,
	status,
	isCompleting,
	isUnlocking,
}: {
	isCurrent: boolean;
	status: SkillRailLesson["status"];
	isCompleting: boolean;
	isUnlocking: boolean;
}) {
	const base =
		"relative flex h-9 shrink-0 items-center overflow-hidden border-r border-product-border/25 px-3 text-[11px] font-medium uppercase tracking-wide transition-colors duration-100";

	if (isCompleting) {
		return `${base} bg-product-accent/14 text-product-accent shadow-[inset_0_0_0_1px_rgba(var(--product-accent),0.28)]`;
	}

	if (isUnlocking) {
		return `${base} bg-product-accent/8 text-product-text`;
	}

	if (isCurrent) {
		return `${base} bg-product-accent/12 text-product-accent`;
	}

	if (status === "completed") {
		return `${base} text-product-text/70`;
	}

	if (status === "in_progress" || status === "available") {
		return `${base} text-product-muted`;
	}

	// locked
	return `${base} text-product-muted/30`;
}

function SkillRailNavKey({
	label,
	title,
	target,
}: {
	label: "Q" | "E";
	title: string;
	target: SkillRailNavigationTarget | null;
}) {
	const className = `sbs-rail-nav-key font-mono text-[10px] uppercase tracking-[0.22em] ${
		target
			? "cursor-pointer text-product-text transition-colors hover:text-product-accent"
			: "cursor-not-allowed text-product-muted/40"
	}`;

	if (!target) {
		return (
			<button
				type="button"
				disabled
				title={title}
				aria-label={title}
				aria-keyshortcuts={label}
				data-disabled="true"
				className={className}
			>
				{label}
			</button>
		);
	}

	return (
		<Link
			href={target.href}
			scroll={false}
			title={title}
			aria-label={title}
			aria-keyshortcuts={label}
			data-disabled="false"
			className={className}
		>
			{label}
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
		<div className="flex w-full min-w-0 items-stretch">
			<div className="flex shrink-0 items-center border-r border-product-border/25 px-3">
				<span className="font-mono text-[9px] uppercase tracking-[0.3em] text-product-muted">
					{label}
				</span>
			</div>

			<div className="flex min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{showStageNavigation ? (
					<SkillRailNavKey
						label="Q"
						title="Open previous lesson in this stage"
						target={previousTarget}
					/>
				) : null}
				{lessons.map((lesson) => {
					const isCurrent = lesson.id === currentLessonId;
					const isCompleting = completionCue?.completedLessonId === lesson.id;
					const isUnlocking = completionCue?.nextLessonId === lesson.id;
					const classes = slotClasses({
						isCurrent,
						status: lesson.status,
						isCompleting,
						isUnlocking,
					});

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
							<span className="relative z-[1] whitespace-nowrap">
								{lesson.shortTitle}
							</span>
							{lesson.status === "completed" && !isCurrent && !isCompleting && (
								<span className="absolute bottom-0 left-0 z-[1] h-[2px] w-full bg-product-accent/40" />
							)}
							{(isCurrent || isCompleting) && (
								<span className="absolute bottom-0 left-0 z-[1] h-[2px] w-full bg-product-accent" />
							)}
						</>
					);

					if (lesson.status === "locked") {
						return (
							<div
								key={lesson.id}
								aria-disabled="true"
								className={`${classes} cursor-not-allowed`}
							>
								{content}
							</div>
						);
					}

					return (
						<Link
							key={lesson.id}
							href={getLessonHref(lesson.id)}
							scroll={false}
							className={`${classes} hover:bg-product-accent/8 hover:text-product-text`}
						>
							{content}
						</Link>
					);
				})}
				{showStageNavigation ? (
					<SkillRailNavKey
						label="E"
						title="Open next lesson in this stage"
						target={nextTarget}
					/>
				) : null}
			</div>
		</div>
	);
}
