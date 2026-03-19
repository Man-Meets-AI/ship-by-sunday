"use client";

import { Card, CardTitle } from "@/components/ui/card";
import {
	getLesson,
	type LessonConfig,
} from "@/features/course/lesson/model/manifest";
import type { ObjectiveTask } from "@/features/course/lesson/model/registry";

import {
	GeneratedObjectiveTaskRow,
	ManualObjectiveTaskRow,
} from "./objective-task-rows";

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
	const nextLesson = lesson.nextLessonId
		? getLesson(lesson.nextLessonId)
		: undefined;
	const nextStepLabel =
		lesson.nextStepLabel ??
		(nextLesson ? `${nextLesson.id} ${nextLesson.shortTitle}` : "Mission");
	const completedCount = objectiveTasks.filter(
		(task) => task.status === "complete",
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
						objectiveTasks.find((task) => task.sectionId === sectionId)
							?.sectionTitle ?? sectionId,
					tasks: objectiveTasks.filter((task) => task.sectionId === sectionId),
				}))
			: [{ id: "all", title: null, tasks: objectiveTasks }];

	return (
		<Card className={panelCardClass}>
			<div className="sticky top-0 z-10 shrink-0 border-b border-border bg-card/95 px-4 py-2 backdrop-blur">
				<CardTitle className={eyebrowClass}>{lesson.objectiveTitle}</CardTitle>
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto">
				<div className="border-b border-border/60 px-4 py-3">
					<p className="text-sm leading-relaxed text-muted-foreground">
						{lesson.helperText ?? lesson.winCondition}
					</p>
				</div>
				<div className="border-b border-border/60 px-4 py-3">
					<CardTitle className={eyebrowClass}>Output</CardTitle>
					<p className="mt-2 text-sm font-semibold leading-snug text-foreground">
						{lesson.artifact.label}
					</p>
				</div>
				<div className="px-4 py-4">
					<div className="mb-3 flex items-center justify-between gap-2">
						<CardTitle className={eyebrowClass}>Tasks</CardTitle>
						<p className="font-mono text-xs tabular-nums tracking-wider text-muted-foreground">
							{completedCount}/{objectiveTasks.length}
						</p>
					</div>
					<div className="space-y-3">
						{taskGroups.map((group) => (
							<div key={group.id} className="space-y-1.5">
								{group.title ? (
									<CardTitle className={eyebrowClass}>{group.title}</CardTitle>
								) : null}
								<div className="space-y-0.5">
									{group.tasks.map((task) =>
										task.interactive ? (
											<ManualObjectiveTaskRow
												key={task.id}
												taskId={task.id}
												label={task.label}
												checked={task.status === "complete"}
												onChange={(checked) =>
													onObjectiveTaskToggle(task.id, checked)
												}
											/>
										) : (
											<GeneratedObjectiveTaskRow
												key={task.id}
												taskId={task.id}
												label={task.label}
												complete={task.status === "complete"}
											/>
										),
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			<div className="shrink-0 border-t border-border/60 bg-muted/30 px-4 py-3">
				<CardTitle className={eyebrowClass}>
					{lesson.nextStepLabel ? "Next step" : "Next unlock"}
				</CardTitle>
				<p className="mt-2 text-sm font-semibold leading-snug text-foreground">
					{nextStepLabel}
				</p>
			</div>
		</Card>
	);
}
