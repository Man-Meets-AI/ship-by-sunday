import type { WorkbenchModeProps } from "../types";
import { FieldControl } from "../fields/field-control";
import { FieldList } from "../fields/field-list";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";

export function ScopeSplitWorkbench({
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
	const [leftField, rightField, ...restFields] = fields;

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			<div className="grid gap-2 lg:grid-cols-2">
				{leftField ? (
					<WorkbenchCard title={leftField.label} eyebrow="In scope">
						<FieldControl
							field={leftField}
							value={fieldValues[leftField.id]}
							onChange={(value) => onFieldChange(leftField.id, value)}
							pinnedArtifacts={pinnedArtifacts}
						/>
					</WorkbenchCard>
				) : null}
				{rightField ? (
					<WorkbenchCard title={rightField.label} eyebrow="Out of scope">
						<FieldControl
							field={rightField}
							value={fieldValues[rightField.id]}
							onChange={(value) => onFieldChange(rightField.id, value)}
							pinnedArtifacts={pinnedArtifacts}
						/>
					</WorkbenchCard>
				) : null}
			</div>
			<FieldList
				fields={restFields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				className="space-y-2"
			/>
		</WorkbenchContainer>
	);
}
