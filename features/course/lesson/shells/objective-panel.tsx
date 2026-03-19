import { Checkbox } from "@/components/ui/checkbox";
import {
	getLesson,
	type LessonConfig,
} from "@/features/course/lesson/model/manifest";
import type { ObjectiveTask } from "@/features/course/lesson/model/registry";
import {
	workbenchChromeLabelClass,
	workbenchPanelClass,
} from "@/features/course/lesson/workbench/shared/workbench-readability";

function ManualTaskRow({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<label className="flex items-center gap-2 px-1 py-1 transition-colors text-product-text">
			<Checkbox
				checked={checked}
				onCheckedChange={(nextChecked) => onChange(Boolean(nextChecked))}
				className="size-3 shrink-0"
			/>
			<span
				className={`text-[12px] leading-[1.5] ${checked ? "text-product-muted line-through" : ""}`}
			>
				{label}
			</span>
		</label>
	);
}

function GeneratedTaskRow({
	label,
	complete,
}: {
	label: string;
	complete: boolean;
}) {
	return (
		<div className="flex items-start gap-2 px-1 py-1">
			<span
				className={`mt-0.5 inline-block h-3 w-3 shrink-0 border ${
					complete
						? "border-product-accent bg-product-accent"
						: "border-product-border bg-product-surface"
				}`}
			/>
			<span
				className={`text-[12px] leading-[1.5] ${
					complete ? "text-product-muted line-through" : "text-product-text"
				}`}
			>
				{label}
			</span>
		</div>
	);
}

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
		<aside
			className={`flex min-w-0 flex-col xl:h-full xl:min-h-0 ${workbenchPanelClass}`}
		>
			<div className="sticky top-0 z-10 shrink-0 border-b border-product-border/55 bg-product-surface/95 px-4 py-2 backdrop-blur-lg">
				<p className={workbenchChromeLabelClass}>{lesson.objectiveTitle}</p>
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto">
				<div className="border-b border-product-border/45 px-4 py-3">
					<p className="text-[13px] leading-[1.7] text-product-muted">
						{lesson.helperText ?? lesson.winCondition}
					</p>
				</div>
				<div className="border-b border-product-border/45 px-4 py-3">
					<p className={workbenchChromeLabelClass}>Output</p>
					<p className="mt-2 text-[13px] font-semibold leading-[1.45] text-product-text">
						{lesson.artifact.label}
					</p>
				</div>
				<div className="px-4 py-4">
					<div className="mb-3 flex items-center justify-between gap-2">
						<p className={workbenchChromeLabelClass}>Tasks</p>
						<p className="font-mono text-[10px] tabular-nums tracking-[0.15em] text-product-muted">
							{completedCount}/{objectiveTasks.length}
						</p>
					</div>
					<div className="space-y-3">
						{taskGroups.map((group) => (
							<div key={group.id} className="space-y-1.5">
								{group.title ? (
									<p className={workbenchChromeLabelClass}>{group.title}</p>
								) : null}
								<div className="space-y-0.5">
									{group.tasks.map((task) =>
										task.interactive ? (
											<ManualTaskRow
												key={task.id}
												label={task.label}
												checked={task.status === "complete"}
												onChange={(checked) =>
													onObjectiveTaskToggle(task.id, checked)
												}
											/>
										) : (
											<GeneratedTaskRow
												key={task.id}
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
			<div className="shrink-0 border-t border-product-border/55 bg-product-surface-strong/70 px-4 py-3">
				<p className={workbenchChromeLabelClass}>
					{lesson.nextStepLabel ? "Next step" : "Next unlock"}
				</p>
				<p className="mt-2 text-[13px] font-semibold leading-[1.45] text-product-text">
					{nextStepLabel}
				</p>
			</div>
		</aside>
	);
}
