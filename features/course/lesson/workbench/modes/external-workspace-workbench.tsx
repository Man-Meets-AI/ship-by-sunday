import Link from "next/link";

import { LessonVideoSurface } from "@/features/course/lesson/components/lesson-video-surface";
import type { LessonResourceContent } from "@/features/course/lesson/model/manifest";

import type { WorkbenchModeProps } from "../types";
import { FieldList } from "../fields/field-list";
import { ArtifactContext } from "../shared/artifact-context";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import { workbenchChromeLabelClass } from "../shared/workbench-readability";

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
					<p className="text-[13px] leading-[1.7] text-product-muted">
						Watch the walkthrough once, then run the setup in sequence.
					</p>
					<LessonVideoSurface coachContent={lessonContent.coach} />
				</div>
			</WorkbenchCard>
			<WorkbenchCard label="External workspace">
				<p className="text-[13px] leading-[1.7] text-product-muted">
					{actionLabel}
				</p>
			</WorkbenchCard>
			{lesson.checklist.length > 0 ? (
				<WorkbenchCard label="Run this sequence">
					<ol className="space-y-2 pl-5 text-[14px] leading-[1.68] text-product-text">
						{lesson.checklist.map((item) => (
							<li key={item} className="list-decimal break-words">
								{item}
							</li>
						))}
					</ol>
				</WorkbenchCard>
			) : null}
			{transcript?.status === "ready" && transcript.body ? (
				<WorkbenchCard label="Transcript">
					<p className="max-w-[64ch] whitespace-pre-wrap text-[14px] leading-[1.72] text-product-text">
						{transcript.body}
					</p>
				</WorkbenchCard>
			) : null}
			{resourceLinks.length > 0 ? (
				<WorkbenchCard label="Resources">
					<div className="space-y-1.5">
						{resourceLinks.map((resource) => (
							<Link
								key={resource.id}
								href={resource.href}
								target={resource.kind === "external" ? "_blank" : undefined}
								className="block rounded-none border border-product-border/55 bg-product-surface-strong/80 px-4 py-4 transition-colors hover:bg-product-surface-alt"
							>
								<p className={workbenchChromeLabelClass}>{resource.kind}</p>
								<p className="mt-2 text-[14px] font-semibold leading-[1.45] text-product-text">
									{resource.label}
								</p>
							</Link>
						))}
					</div>
				</WorkbenchCard>
			) : null}
			<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
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
