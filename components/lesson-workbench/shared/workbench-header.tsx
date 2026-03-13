import type { LessonConfig, LessonContent } from "@/lib/course/manifest";

import {
	workbenchIntroCopyClass,
	workbenchMetaRowClass,
	workbenchTitleClass,
} from "./workbench-readability";

function renderLessonTitle(title: string) {
	const protectedPhrase = "Ship by Sunday";
	const phraseStart = title.indexOf(protectedPhrase);

	if (phraseStart === -1) {
		return title;
	}

	const before = title.slice(0, phraseStart);
	const after = title.slice(phraseStart + protectedPhrase.length);

	return (
		<>
			{before}
			<span className="whitespace-nowrap">{protectedPhrase}</span>
			{after}
		</>
	);
}

export function WorkbenchHeader({
	lesson,
	lessonContent,
}: {
	lesson: LessonConfig;
	lessonContent: LessonContent;
}) {
	return (
		<div className="space-y-4">
			<div className={workbenchMetaRowClass}>
				<span className="border border-product-border/55 bg-product-surface-strong/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em]">
					{lesson.id}
				</span>
				<span className="border border-product-border/55 bg-product-surface px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em]">
					{lesson.artifact.label}
				</span>
				{lessonContent.lessonMeta.runtimeLabel ? (
					<span className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
						{lessonContent.lessonMeta.runtimeLabel}
					</span>
				) : null}
			</div>
			<h1 className={workbenchTitleClass}>{renderLessonTitle(lesson.title)}</h1>
			<p className={workbenchIntroCopyClass}>{lessonContent.intro}</p>
		</div>
	);
}
