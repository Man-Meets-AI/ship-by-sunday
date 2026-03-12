import type { LessonContent } from "@/lib/course/manifest";

import { WorkbenchCard } from "./workbench-card";

export function TemplateDownloadCard({
	lessonContent,
}: {
	lessonContent: LessonContent;
}) {
	if (
		!lessonContent.workbench.templateDownloadLabel ||
		!lessonContent.workbench.templateDownloadHref
	) {
		return null;
	}

	return (
		<WorkbenchCard title="Template" eyebrow="Reference">
			<a
				href={lessonContent.workbench.templateDownloadHref}
				className="inline-flex rounded-none border border-product-border bg-product-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-product-text transition-colors hover:bg-product-surface-alt"
			>
				{lessonContent.workbench.templateDownloadLabel}
			</a>
		</WorkbenchCard>
	);
}
