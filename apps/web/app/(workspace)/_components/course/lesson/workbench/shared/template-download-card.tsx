import { Button } from "@/components/ui/button";
import type { LessonContent } from "@/lib/course/lesson/model/manifest";

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
			<Button asChild variant="outline" size="sm">
				<a
					href={lessonContent.workbench.templateDownloadHref}
					target={isExternalLink ? "_blank" : undefined}
					rel={isExternalLink ? "noreferrer" : undefined}
				>
					{lessonContent.workbench.templateDownloadLabel}
				</a>
			</Button>
		</WorkbenchCard>
	);
}
