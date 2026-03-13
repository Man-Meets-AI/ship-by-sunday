import type { LessonContent } from "@/lib/course/manifest";

import {
	workbenchChromeLabelClass,
	workbenchInsetClass,
} from "./workbench-readability";

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
		<div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(180px,0.7fr)_minmax(220px,0.95fr)_minmax(150px,0.48fr)]">
			<div className={`${workbenchInsetClass} px-4 py-4`}>
				<p className={workbenchChromeLabelClass}>Do this now</p>
				<p className="mt-2 max-w-[34ch] text-[14px] leading-[1.72] text-product-text">
					{lessonContent.actionCard.jobNow}
				</p>
			</div>
			<div className={`${workbenchInsetClass} px-4 py-4`}>
				<p className={workbenchChromeLabelClass}>Timebox</p>
				<p className="mt-2 text-[14px] leading-[1.65] text-product-text">
					{lessonContent.actionCard.timebox}
				</p>
			</div>
			<div className={`${workbenchInsetClass} px-4 py-4`}>
				<p className={workbenchChromeLabelClass}>Finish with</p>
				<p className="mt-2 max-w-[30ch] text-[14px] leading-[1.72] text-product-text">
					{lessonContent.actionCard.comeBackWith}
				</p>
			</div>
			<div className={`${workbenchInsetClass} px-4 py-4`}>
				<p className={workbenchChromeLabelClass}>Progress</p>
				<p className="mt-2 text-[14px] leading-[1.65] text-product-text">
					{completedTaskCount}/{totalTaskCount}
				</p>
			</div>
		</div>
	);
}
