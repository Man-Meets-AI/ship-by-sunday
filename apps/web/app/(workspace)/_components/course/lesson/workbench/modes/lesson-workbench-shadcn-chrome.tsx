"use client";

import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type {
	LessonConfig,
	LessonContent,
} from "@/lib/course/lesson/model/manifest";

import { renderLessonTitle } from "../shared/workbench-header";

export function LessonWorkbenchPageHeader({
	lesson,
	lessonContent,
}: {
	lesson: LessonConfig;
	lessonContent: LessonContent;
}) {
	return (
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
	);
}

export function LessonWorkbenchStatusCards({
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

	return (
		<div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-xs font-semibold tracking-tight text-muted-foreground">
						Do this now
					</CardTitle>
					<CardDescription className="line-clamp-4 text-foreground">
						{lessonContent.actionCard.jobNow}
					</CardDescription>
				</CardHeader>
			</Card>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-xs font-semibold tracking-tight text-muted-foreground">
						Timebox
					</CardTitle>
					<CardDescription className="text-foreground">
						{lessonContent.actionCard.timebox}
					</CardDescription>
				</CardHeader>
			</Card>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-xs font-semibold tracking-tight text-muted-foreground">
						Finish with
					</CardTitle>
					<CardDescription className="line-clamp-4 text-foreground">
						{lessonContent.actionCard.comeBackWith}
					</CardDescription>
				</CardHeader>
			</Card>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-xs font-semibold tracking-tight text-muted-foreground">
						Progress
					</CardTitle>
					<div className="flex flex-col gap-2 pt-1">
						<p className="text-sm font-medium tabular-nums text-foreground">
							{completedTaskCount}/{totalTaskCount}
						</p>
						<Progress value={progressValue} className="h-1.5" />
					</div>
				</CardHeader>
			</Card>
		</div>
	);
}

export function LessonWorkbenchLabeledCard({
	label,
	children,
}: {
	label?: string;
	children: ReactNode;
}) {
	return (
		<Card className="gap-0 py-0">
			{label ? (
				<CardHeader className="border-b border-border/60 pb-4">
					<CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{label}
					</CardTitle>
				</CardHeader>
			) : null}
			<CardContent className="py-4">{children}</CardContent>
		</Card>
	);
}
