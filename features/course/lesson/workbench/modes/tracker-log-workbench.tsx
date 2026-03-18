import { FieldControl } from "../fields/field-control";
import { FieldList } from "../fields/field-list";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import type { WorkbenchModeProps } from "../types";

export function TrackerLogWorkbench({
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
	const [tableField, ...restFields] = fields;

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			{tableField ? (
				<WorkbenchCard label={tableField.label}>
					<FieldControl
						field={tableField}
						value={fieldValues[tableField.id]}
						onChange={(value) => onFieldChange(tableField.id, value)}
						pinnedArtifacts={pinnedArtifacts}
						showLabel={false}
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
