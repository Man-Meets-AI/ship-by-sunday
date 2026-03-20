import type { ReactNode } from "react";

import type {
	LessonConfig,
	LessonContent,
} from "@/features/course/lesson/model/manifest";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { renderLessonTitle } from "../../shared/workbench-header";
import type { WorkbenchModeProps } from "../../types";

function BriefAssemblerHeader({
	lesson,
	lessonContent,
}: {
	lesson: LessonConfig;
	lessonContent: LessonContent;
}) {
	return (
		<Card>
			<CardHeader>
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
				<CardTitle className="text-balance text-3xl font-semibold sm:text-4xl">
					{renderLessonTitle(lesson.title)}
				</CardTitle>
				<CardDescription className="max-w-prose pt-0.5 text-base leading-relaxed">
					{lessonContent.intro}
				</CardDescription>
			</CardHeader>
		</Card>
	);
}

function BriefAssemblerStatusRail({
	lessonContent,
	completedTaskCount,
	totalTaskCount,
}: {
	lessonContent: LessonContent;
	completedTaskCount: number;
	totalTaskCount: number;
}) {
	const progressValue =
		totalTaskCount > 0
			? Math.round((completedTaskCount / totalTaskCount) * 100)
			: 0;

	const rows: { label: string; body: string; lineClamp?: boolean }[] = [
		{
			label: "Do this now",
			body: lessonContent.actionCard.jobNow,
			lineClamp: true,
		},
		{ label: "Timebox", body: lessonContent.actionCard.timebox },
		{
			label: "Finish with",
			body: lessonContent.actionCard.comeBackWith,
			lineClamp: true,
		},
	];

	return (
		<div
			role="list"
			className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
		>
			{rows.map((row) => (
				<Card key={row.label} role="listitem" className="py-3">
					<CardHeader className="gap-1.5 px-4 py-0">
						<CardTitle className="text-xs font-semibold tracking-tight text-muted-foreground">
							{row.label}
						</CardTitle>
						<CardDescription
							className={
								row.lineClamp
									? "line-clamp-4 text-foreground"
									: "text-foreground"
							}
						>
							{row.body}
						</CardDescription>
					</CardHeader>
				</Card>
			))}
			<Card role="listitem" className="py-3">
				<CardHeader className="gap-1.5 px-4 py-0">
					<CardTitle className="text-xs font-semibold tracking-tight text-muted-foreground">
						Progress
					</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-2 pt-0">
					<p className="text-sm font-medium tabular-nums text-foreground">
						{completedTaskCount}/{totalTaskCount}
					</p>
					<Progress value={progressValue} className="h-1.5" />
				</CardContent>
			</Card>
		</div>
	);
}

export type DefaultBriefAssemblerWorkbenchProps = Pick<
	WorkbenchModeProps,
	"lesson" | "lessonContent" | "completedTaskCount" | "objectiveTasks"
> & {
	artifactsSlot: ReactNode;
	fieldsSlot: ReactNode;
};

export function DefaultBriefAssemblerWorkbench({
	lesson,
	lessonContent,
	completedTaskCount,
	objectiveTasks,
	artifactsSlot,
	fieldsSlot,
}: DefaultBriefAssemblerWorkbenchProps) {
	return (
		<div className="w-full space-y-4 pb-1">
			<BriefAssemblerHeader lesson={lesson} lessonContent={lessonContent} />
			<BriefAssemblerStatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			{artifactsSlot}
			{fieldsSlot}
		</div>
	);
}
