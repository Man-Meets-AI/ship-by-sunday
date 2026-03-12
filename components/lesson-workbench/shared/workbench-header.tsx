import type { LessonConfig, LessonContent } from "@/lib/course/manifest";

export function WorkbenchHeader({
	lesson,
	lessonContent,
}: {
	lesson: LessonConfig;
	lessonContent: LessonContent;
}) {
	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center gap-1.5 text-product-muted select-none">
				<span className="border border-product-border/70 bg-product-surface-strong/70 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.18em]">
					{lesson.id}
				</span>
				<span className="border border-product-border/70 bg-product-surface px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.18em]">
					{lesson.artifact.label}
				</span>
				{lessonContent.lessonMeta.runtimeLabel ? (
					<span className="font-mono text-[8px] uppercase tracking-[0.18em] text-product-muted">
						{lessonContent.lessonMeta.runtimeLabel}
					</span>
				) : null}
			</div>
			<h1 className="max-w-3xl font-display text-2xl uppercase leading-tight tracking-[0.04em] text-product-text sm:text-[2rem]">
				{lesson.title}
			</h1>
			<p className="max-w-3xl text-[13px] leading-relaxed text-product-muted">
				{lessonContent.intro}
			</p>
		</div>
	);
}
