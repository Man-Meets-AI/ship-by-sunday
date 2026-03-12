"use client";

import Link from "next/link";

import { getLessonHref } from "@/lib/course/manifest";

export type SkillRailCompletionCue = {
	completedLessonId: string;
	nextLessonId: string | null;
};

type SkillRailLesson = {
	id: string;
	shortTitle: string;
	status: "available" | "completed" | "in_progress" | "locked";
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

export function SkillRail({
	label,
	lessons,
	currentLessonId,
	completionCue,
}: {
	label: string;
	subtitle?: string;
	lessons: SkillRailLesson[];
	currentLessonId?: string;
	completionCue?: SkillRailCompletionCue | null;
}) {
	return (
		<div className="flex w-full min-w-0 items-stretch">
			<div className="flex shrink-0 items-center border-r border-product-border/25 px-3">
				<span className="font-mono text-[9px] uppercase tracking-[0.3em] text-product-muted">
					{label}
				</span>
			</div>

			<div className="flex min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
			</div>
		</div>
	);
}
