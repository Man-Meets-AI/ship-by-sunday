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

	const isExternalLink = /^https?:\/\//i.test(
		lessonContent.workbench.templateDownloadHref,
	);

	return (
		<WorkbenchCard label="Template">
			<a
				href={lessonContent.workbench.templateDownloadHref}
				target={isExternalLink ? "_blank" : undefined}
				rel={isExternalLink ? "noreferrer" : undefined}
				className="inline-flex rounded-none border border-product-border bg-product-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-product-text transition-colors hover:bg-product-surface-alt"
			>
				{lessonContent.workbench.templateDownloadLabel}
			</a>
		</WorkbenchCard>
	);
}
