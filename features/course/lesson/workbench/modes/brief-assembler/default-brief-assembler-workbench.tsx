import type { WorkbenchModeProps } from "../../types";
import { FieldList } from "../../fields/field-list";
import { ArtifactContext } from "../../shared/artifact-context";
import { StatusRail } from "../../shared/status-rail";
import { WorkbenchContainer } from "../../shared/workbench-container";
import { WorkbenchHeader } from "../../shared/workbench-header";

export function DefaultBriefAssemblerWorkbench({
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
	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
			<FieldList
				fields={fields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				className="space-y-2"
			/>
		</WorkbenchContainer>
	);
}
