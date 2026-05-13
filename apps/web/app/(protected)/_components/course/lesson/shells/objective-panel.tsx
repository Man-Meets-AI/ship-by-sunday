"use client";

import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	getLessonByKey,
	type LessonConfig,
} from "@/lib/course/lesson/model/manifest";
import type { ObjectiveTask } from "@/lib/course/lesson/model/registry";
import { cn } from "@/lib/utils";

import { ObjectiveTaskCounter } from "./objective-task-counter";
import { ObjectiveTaskRow } from "./objective-task-row";

const panelCardClass = "flex min-w-0 flex-col gap-0 py-0 xl:h-full xl:min-h-0";
const eyebrowClass =
	"font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground";

export function ObjectivePanel({
	lesson,
	objectiveTasks,
	onObjectiveTaskToggle,
}: {
	lesson: LessonConfig;
	objectiveTasks: ObjectiveTask[];
	onObjectiveTaskToggle: (taskId: string, checked: boolean) => void;
}) {
	const nextLesson = lesson.nextLessonKey
		? getLessonByKey(lesson.nextLessonKey)
		: undefined;
	const nextStepLabel =
		lesson.nextStepLabel ??
		(nextLesson ? `${nextLesson.id} ${nextLesson.shortTitle}` : "Lesson Map");
	const completedCount = objectiveTasks.filter(
		(t) => t.status === "complete",
	).length;
	const sectionIds = Array.from(
		new Set(
			objectiveTasks
				.map((task) => task.sectionId)
				.filter((sectionId): sectionId is string => Boolean(sectionId)),
		),
	);
	const taskGroups =
		sectionIds.length > 1
			? sectionIds.map((sectionId) => ({
					id: sectionId,
					title:
						objectiveTasks.find((t) => t.sectionId === sectionId)
							?.sectionTitle ?? sectionId,
					tasks: objectiveTasks.filter((t) => t.sectionId === sectionId),
				}))
			: [{ id: "all", title: null, tasks: objectiveTasks }];

	return (
		<Card className={panelCardClass}>
			<CardHeader className="sticky top-0 z-10 shrink-0 border-b border-border bg-card/95 py-3 backdrop-blur">
				<CardTitle className={eyebrowClass}>{lesson.objectiveTitle}</CardTitle>
			</CardHeader>
			<ScrollArea className="min-h-0 flex-1">
				<div className="flex flex-col gap-6 p-4">
					<div className="space-y-1.5">
						<CardDescription className="text-[13px] leading-relaxed text-foreground/80">
							{lesson.helperText ?? lesson.winCondition}
						</CardDescription>
					</div>

					<div className="space-y-2">
						<CardTitle className={eyebrowClass}>Output</CardTitle>
						<p className="text-sm font-semibold leading-snug text-foreground">
							{lesson.artifact.label}
						</p>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
							<CardTitle className={eyebrowClass}>Tasks</CardTitle>
							<ObjectiveTaskCounter
								completedCount={completedCount}
								totalCount={objectiveTasks.length}
							/>
						</div>
						<div className="space-y-4">
							{taskGroups.map((group) => (
								<div key={group.id} className="space-y-3">
									{group.title ? (
										<CardTitle className={cn(eyebrowClass, "text-[9px]")}>
											{group.title}
										</CardTitle>
									) : null}
									<div className="space-y-1">
										{group.tasks.map((task) => (
											<ObjectiveTaskRow
												key={task.id}
												task={task}
												onToggle={onObjectiveTaskToggle}
											/>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</ScrollArea>
			<CardFooter className="shrink-0 flex-col items-stretch border-t border-border/60 py-4">
				<CardTitle className={eyebrowClass}>
					{lesson.nextStepLabel ? "Next step" : "Next unlock"}
				</CardTitle>
				<p className="mt-2 text-sm font-semibold leading-snug text-foreground">
					{nextStepLabel}
				</p>
			</CardFooter>
		</Card>
	);
}
