import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LessonVideoSurface } from "@/features/course/lesson/components/lesson-video-surface";
import { renderChecklistLabel } from "@/features/course/lesson/workbench/fields/checklist-label";
import type { LessonResourceContent } from "@/features/course/lesson/model/manifest";
import { FieldList } from "../fields/field-list";
import { ArtifactContext } from "../shared/artifact-context";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import type { WorkbenchModeProps } from "../types";
import { ExternalWorkspacePromptImport } from "./external-workspace-prompt-import";

const resourceKindClass =
	"text-xs font-medium capitalize text-muted-foreground";

export function ExternalWorkspaceWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	fields,
	objectiveTasks,
	completedTaskCount,
}: WorkbenchModeProps) {
	const transcript = lessonContent.coach.transcript;
	const resourceLinks = (lessonContent.coach.resources ?? []).filter(
		(
			resource,
		): resource is Exclude<LessonResourceContent, { kind: "copy_prompt" }> =>
			resource.kind !== "copy_prompt",
	);
	const actionLabel =
		lesson.externalTool === "figma"
			? "Open Figma and keep this brief beside it."
			: lesson.externalTool === "deploy"
				? "Open the deploy platform and use this checklist beside it."
				: lesson.externalTool === "recording"
					? "Open your recording setup and keep this panel as the checklist."
					: "Open the code workspace and keep this lesson brief beside it.";

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			<WorkbenchCard label="Watch first">
				<div className="space-y-3">
					<p className="text-sm leading-relaxed text-muted-foreground">
						Watch the walkthrough once, then run the setup in sequence.
					</p>
					<LessonVideoSurface
						coachContent={lessonContent.coach}
						playerFrame="bare"
					/>
				</div>
			</WorkbenchCard>
			<WorkbenchCard label="External workspace">
				<p className="text-sm leading-relaxed text-muted-foreground">
					{actionLabel}
				</p>
			</WorkbenchCard>
			{lesson.checklist.length > 0 ? (
				<WorkbenchCard label="Run this sequence">
					<div
						className="divide-y divide-border overflow-hidden rounded-lg border border-border"
						role="list"
					>
						{lesson.checklist.map((item, index) => (
							<div
								key={item}
								role="listitem"
								className="flex items-start gap-3 px-3 py-2.5"
							>
								<span className="w-14 shrink-0 pt-0.5 text-xs font-semibold text-muted-foreground">
									Step {index + 1}
								</span>
								<span className="min-w-0 flex-1 text-sm leading-relaxed text-foreground">
									{renderChecklistLabel(item)}
								</span>
							</div>
						))}
					</div>
				</WorkbenchCard>
			) : null}
			{transcript?.status === "ready" && transcript.body ? (
				<WorkbenchCard label="Transcript">
					<div className="max-h-72 max-w-prose overflow-y-auto rounded-lg border border-border/60 bg-muted/20 p-3">
						<p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
							{transcript.body}
						</p>
					</div>
				</WorkbenchCard>
			) : null}
			{resourceLinks.length > 0 ? (
				<WorkbenchCard label="Resources">
					<div className="space-y-2">
						{resourceLinks.map((resource) => (
							<Button
								key={resource.id}
								asChild
								variant="outline"
								className="h-auto min-h-0 w-full flex-col items-stretch justify-start gap-0 px-4 py-4 text-left font-normal whitespace-normal"
							>
								<Link
									href={resource.href}
									target={resource.kind === "external" ? "_blank" : undefined}
								>
									<p className={resourceKindClass}>{resource.kind}</p>
									<p className="mt-2 text-sm font-semibold leading-snug text-foreground">
										{resource.label}
									</p>
								</Link>
							</Button>
						))}
					</div>
				</WorkbenchCard>
			) : null}
			<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
			<ExternalWorkspacePromptImport
				lesson={lesson}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				fieldValues={fieldValues}
			/>
			<FieldList
				fields={fields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				className="grid gap-4 md:grid-cols-2"
			/>
		</WorkbenchContainer>
	);
}
