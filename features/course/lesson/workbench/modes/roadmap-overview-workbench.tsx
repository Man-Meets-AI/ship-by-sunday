"use client";

import { Separator } from "@/components/ui/separator";

import { FocusInlineLessonVideo } from "../shared/focus-inline-lesson-video";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import { WorkbenchMediaLayout } from "../shared/workbench-media-layout";
import type { WorkbenchModeProps } from "../types";
import { RoadmapSprintOverview } from "./roadmap-sprint-overview";

export function RoadmapOverviewWorkbench({
	lesson,
	lessonContent,
	objectiveTasks,
	completedTaskCount,
	layoutMode,
}: WorkbenchModeProps) {
	const showInlineVideo = lesson.coachVideoPlacement === "workbench";
	const showSplitWorkbenchMedia =
		showInlineVideo &&
		lesson.workbenchMediaLayout === "split" &&
		layoutMode === "focus";

	const inlineVideo = (
		<FocusInlineLessonVideo
			coachContent={lessonContent.coach}
			helperText="Play the lesson video, then work through the map."
		/>
	);

	const roadmapBody = (
		<div className="space-y-5">
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			<RoadmapSprintOverview lessonContent={lessonContent} />
		</div>
	);

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<Separator className="bg-border" />
			{showSplitWorkbenchMedia ? (
				<WorkbenchMediaLayout media={inlineVideo}>
					{roadmapBody}
				</WorkbenchMediaLayout>
			) : showInlineVideo ? (
				<div className="space-y-5">
					{inlineVideo}
					{roadmapBody}
				</div>
			) : (
				roadmapBody
			)}
		</WorkbenchContainer>
	);
}
