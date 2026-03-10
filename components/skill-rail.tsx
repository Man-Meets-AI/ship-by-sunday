"use client";

import Link from "next/link";

import { getLessonHref } from "@/app/lessonRegistry";

type SkillRailLesson = {
	id: string;
	shortTitle: string;
	status: "available" | "completed" | "in_progress" | "locked";
};

function skillRailItemClass(isCurrent: boolean, status: SkillRailLesson["status"]) {
	if (isCurrent) {
		return "border-product-accent text-product-accent bg-product-surface shadow-panel";
	}

	if (status === "completed") {
		return "border-product-border/70 bg-product-surface text-product-text";
	}

	if (status === "in_progress" || status === "available") {
		return "border-product-border/70 bg-product-surface-strong/80 text-product-text";
	}

	return "border-product-border/50 bg-product-surface-strong/40 text-product-muted opacity-60";
}

export function SkillRail({
	label,
	subtitle,
	lessons,
	currentLessonId,
}: {
	label: string;
	subtitle: string;
	lessons: SkillRailLesson[];
	currentLessonId?: string;
}) {
	return (
		<div className="flex items-stretch gap-3 overflow-hidden">
			<div className="flex w-[104px] shrink-0 flex-col justify-end border-r border-product-border/70 pr-3">
				<p className="font-mono text-[11px] uppercase tracking-[0.28em] text-product-text">
					{label}
				</p>
				<p className="mt-2 text-sm font-medium leading-tight text-product-muted">
					{subtitle}
				</p>
			</div>

			<div className="flex min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{lessons.map((lesson) => {
					const isCurrent = lesson.id === currentLessonId;
					const itemClass = `group relative flex h-[104px] w-[110px] shrink-0 flex-col justify-between border p-3 ${skillRailItemClass(
						isCurrent,
						lesson.status,
					)}`;
					const itemContent = (
						<>
							<div>
								<p className="font-mono text-[10px] uppercase tracking-[0.24em] text-current/75">
									{lesson.id}
								</p>
								<p className="mt-2 font-display text-[1.85rem] uppercase leading-[0.86] tracking-[0.03em]">
									{lesson.shortTitle}
								</p>
							</div>
							<div>
								<p className="text-xs font-medium capitalize text-current/80">
									{lesson.status.replace("_", " ")}
								</p>
								<div
									className={`mt-2 h-[3px] w-8 ${
										isCurrent
											? "bg-product-accent"
											: lesson.status === "locked"
												? "bg-product-border/40"
												: "bg-product-border"
									}`}
								/>
							</div>
						</>
					);

					if (lesson.status === "locked") {
						return (
							<div key={lesson.id} aria-disabled="true" className={`${itemClass} cursor-not-allowed`}>
								{itemContent}
							</div>
						);
					}

					return (
						<Link
							key={lesson.id}
							href={getLessonHref(lesson.id)}
							className={`${itemClass} transition-colors hover:bg-product-surface-alt/85`}
						>
							{itemContent}
						</Link>
					);
				})}
			</div>
		</div>
	);
}
