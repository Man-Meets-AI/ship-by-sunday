import type { WorkbenchModeProps } from "../types";
import { FieldControl } from "../fields/field-control";
import { FieldList } from "../fields/field-list";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";

export function CollectorBoardWorkbench({
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
	const [boardField, ...restFields] = fields;

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			{boardField ? (
				<WorkbenchCard title={boardField.label} eyebrow="Reference board">
					<FieldControl
						field={boardField}
						value={fieldValues[boardField.id]}
						onChange={(value) => onFieldChange(boardField.id, value)}
						pinnedArtifacts={pinnedArtifacts}
					/>
				</WorkbenchCard>
			) : null}
			<FieldList
				fields={restFields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				className="grid gap-2 md:grid-cols-2"
			/>
		</WorkbenchContainer>
	);
}
