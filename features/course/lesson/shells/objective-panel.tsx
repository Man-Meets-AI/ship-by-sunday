"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	getLessonByKey,
	type LessonConfig,
} from "@/features/course/lesson/model/manifest";
import type { ObjectiveTask } from "@/features/course/lesson/model/registry";
import { cn } from "@/lib/utils";

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
		(nextLesson ? `${nextLesson.id} ${nextLesson.shortTitle}` : "Mission");
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
			<CardHeader className="sticky top-0 z-10 shrink-0 border-b border-border bg-card/95 py-2 backdrop-blur">
				<CardTitle className={eyebrowClass}>{lesson.objectiveTitle}</CardTitle>
			</CardHeader>
			<ScrollArea className="min-h-0 flex-1">
				<CardContent className="py-3">
					<CardDescription className="text-sm leading-relaxed">
						{lesson.helperText ?? lesson.winCondition}
					</CardDescription>
				</CardContent>
				<Separator />
				<CardContent className="py-3">
					<CardTitle className={eyebrowClass}>Output</CardTitle>
					<p className="mt-2 text-sm font-semibold leading-snug text-foreground">
						{lesson.artifact.label}
					</p>
				</CardContent>
				<Separator />
				<CardContent className="pb-4 pt-4">
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
									{group.tasks.map((task) => {
										const complete = task.status === "complete";
										const id = task.interactive
											? `objective-task-${task.id}`
											: `objective-task-readonly-${task.id}`;
										return (
											<div
												key={task.id}
												className={cn(
													"flex gap-3 px-1 py-1",
													task.interactive ? "items-center" : "items-start",
												)}
											>
												<Checkbox
													id={id}
													checked={complete}
													className={
														task.interactive
															? "size-3 shrink-0"
															: "mt-0.5 size-3 shrink-0"
													}
													disabled={!task.interactive}
													onCheckedChange={
														task.interactive
															? (v) =>
																	onObjectiveTaskToggle(task.id, Boolean(v))
															: undefined
													}
												/>
												<Label
													htmlFor={id}
													className={cn(
														"text-sm font-normal leading-normal",
														complete
															? "text-muted-foreground line-through"
															: "text-foreground",
													)}
												>
													{task.label}
												</Label>
											</div>
										);
									})}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</ScrollArea>
			<CardFooter className="shrink-0 flex-col items-stretch border-border/60 bg-muted/30 py-3">
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
