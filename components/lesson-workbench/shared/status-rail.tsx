import type { LessonContent } from "@/lib/course/manifest";

export function StatusRail({
	lessonContent,
	completedTaskCount,
	totalTaskCount,
}: {
	lessonContent: LessonContent;
	completedTaskCount: number;
	totalTaskCount: number;
}) {
	return (
		<div className="grid gap-px border border-product-border/60 bg-product-border/60 sm:grid-cols-[minmax(0,1.7fr)_minmax(160px,0.6fr)_minmax(220px,0.9fr)_minmax(140px,0.5fr)]">
			<div className="bg-product-surface px-3 py-3">
				<p className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
					Do this now
				</p>
				<p className="mt-1 text-[12px] leading-relaxed text-product-text">
					{lessonContent.actionCard.jobNow}
				</p>
			</div>
			<div className="bg-product-surface px-3 py-3">
				<p className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
					Timebox
				</p>
				<p className="mt-1 text-[12px] leading-relaxed text-product-text">
					{lessonContent.actionCard.timebox}
				</p>
			</div>
			<div className="bg-product-surface px-3 py-3">
				<p className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
					Finish with
				</p>
				<p className="mt-1 text-[12px] leading-relaxed text-product-text">
					{lessonContent.actionCard.comeBackWith}
				</p>
			</div>
			<div className="bg-product-surface px-3 py-3">
				<p className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
					Progress
				</p>
				<p className="mt-1 text-[12px] leading-relaxed text-product-text">
					{completedTaskCount}/{totalTaskCount}
				</p>
			</div>
		</div>
	);
}
