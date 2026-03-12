import type { WorkbenchModeProps } from "../types";
import { FieldList } from "../fields/field-list";
import { ArtifactContext } from "../shared/artifact-context";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";

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
			<WorkbenchCard title="External workspace" eyebrow="Focus mode">
				<p className="text-xs font-medium leading-snug text-product-muted">
					{actionLabel}
				</p>
			</WorkbenchCard>
			<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
			<FieldList
				fields={fields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				className="grid gap-2 md:grid-cols-2"
			/>
		</WorkbenchContainer>
	);
}
