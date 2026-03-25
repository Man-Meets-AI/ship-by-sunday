"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Play } from "lucide-react";

import { renderLessonTitle } from "../shared/workbench-header";
import type { WorkbenchModeProps } from "../types";
import { RoadmapInlineVideoCard } from "./roadmap-inline-video-card";
import { RoadmapSprintOverview } from "./roadmap-sprint-overview";

const VIDEO_HELPER = "Play the lesson video, then work through the map.";

function RoadmapStatusCards({
	lessonContent,
	completedTaskCount,
	totalTaskCount,
}: {
	lessonContent: WorkbenchModeProps["lessonContent"];
	completedTaskCount: number;
	totalTaskCount: number;
}) {
	const progressValue =
		totalTaskCount > 0
			? Math.round((completedTaskCount / totalTaskCount) * 100)
			: 0;

	return (
		<div
			role="list"
			className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
		>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-xs font-semibold tracking-tight text-muted-foreground">
						Do this now
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="line-clamp-4 text-sm text-foreground">
						{lessonContent.actionCard.jobNow}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-xs font-semibold tracking-tight text-muted-foreground">
						Timebox
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-foreground">
						{lessonContent.actionCard.timebox}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-xs font-semibold tracking-tight text-muted-foreground">
						Finish with
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="line-clamp-4 text-sm text-foreground">
						{lessonContent.actionCard.comeBackWith}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-xs font-semibold tracking-tight text-muted-foreground">
						Progress
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-2">
						<p className="text-sm font-medium tabular-nums text-foreground">
							{completedTaskCount}/{totalTaskCount}
						</p>
						<Progress value={progressValue} className="h-1.5" />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

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
		<Card className="gap-0 overflow-hidden py-0">
			<CardHeader className="border-b border-border/60 bg-muted/30 px-4 py-3 sm:px-5">
				<div className="flex flex-wrap items-center gap-2">
					<Badge
						variant="outline"
						className="h-6 gap-1 border-primary/25 bg-primary/8 px-2.5 text-xs font-medium text-primary"
					>
						<Play className="size-3 opacity-90" aria-hidden />
						Watch first
					</Badge>
					<span className="text-xs text-muted-foreground">{VIDEO_HELPER}</span>
				</div>
			</CardHeader>
			<CardContent className="p-4 sm:p-5 sm:pt-4">
				<RoadmapInlineVideoCard coachContent={lessonContent.coach} />
			</CardContent>
		</Card>
	);

	const showStatusRail = lesson.id !== "1.2";

	const roadmapBody = (
		<div className="space-y-5">
			{showStatusRail ? (
				<RoadmapStatusCards
					lessonContent={lessonContent}
					completedTaskCount={completedTaskCount}
					totalTaskCount={Math.max(objectiveTasks.length, 1)}
				/>
			) : null}
			<RoadmapSprintOverview lesson={lesson} lessonContent={lessonContent} />
		</div>
	);

	return (
		<div className="w-full space-y-4 pb-1">
			<div className="space-y-3">
				<div className="flex flex-wrap items-center gap-2 text-muted-foreground">
					<Badge variant="secondary" className="text-xs font-medium">
						{lesson.id}
					</Badge>
					<Badge variant="outline" className="text-xs font-medium">
						{lesson.artifact.label}
					</Badge>
					{lessonContent.lessonMeta.runtimeLabel ? (
						<span className="text-xs font-medium text-muted-foreground">
							{lessonContent.lessonMeta.runtimeLabel}
						</span>
					) : null}
				</div>
				<h1 className="text-balance text-3xl font-semibold text-foreground sm:text-4xl">
					{renderLessonTitle(lesson.title)}
				</h1>
				<p className="max-w-prose pt-0.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
					{lessonContent.intro}
				</p>
			</div>
			<Separator className="bg-border" />
			{showSplitWorkbenchMedia ? (
				<div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(300px,0.88fr)_minmax(0,1.12fr)] xl:items-start">
					<div className="min-w-0 xl:sticky xl:top-0 xl:z-1 xl:self-start">
						{inlineVideo}
					</div>
					<div className="min-w-0">{roadmapBody}</div>
				</div>
			) : showInlineVideo ? (
				<div className="space-y-5">
					{inlineVideo}
					{roadmapBody}
				</div>
			) : (
				roadmapBody
			)}
		</div>
	);
}
