import { FieldControl } from "../fields/field-control";
import { FieldList } from "../fields/field-list";
import { PromptImportCard } from "../shared/prompt-import-card";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import type { WorkbenchModeProps } from "../types";

export function ScoreTableWorkbench({
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
	const promptImport =
		lesson.promptImport?.promptTemplateId === "competitor_research"
			? lesson.promptImport
			: undefined;
	const tableField = promptImport
		? (fields.find((field) => field.id === promptImport.tableFieldId) ??
			fields[0])
		: fields[0];
	const restFields = promptImport
		? fields.filter((field) => field.id !== promptImport.tableFieldId)
		: fields.slice(1);

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			{promptImport ? (
				<PromptImportCard
					lesson={lesson}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
				/>
			) : null}
			{tableField ? (
				<WorkbenchCard label="Research table">
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
				className={
					restFields.length > 1 ? "grid gap-2 md:grid-cols-2" : "space-y-2"
				}
			/>
		</WorkbenchContainer>
	);
}
