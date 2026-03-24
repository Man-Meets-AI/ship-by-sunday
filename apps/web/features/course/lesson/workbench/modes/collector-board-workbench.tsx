import { FieldControl } from "../fields/field-control";
import { FieldList } from "../fields/field-list";
import type { WorkbenchModeProps } from "../types";
import {
	LessonWorkbenchLabeledCard,
	LessonWorkbenchPageHeader,
	LessonWorkbenchStatusCards,
} from "./lesson-workbench-shadcn-chrome";

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
	const totalTaskCount = Math.max(objectiveTasks.length, 1);

	return (
		<div className="w-full space-y-4 pb-1">
			<LessonWorkbenchPageHeader
				lesson={lesson}
				lessonContent={lessonContent}
			/>
			<LessonWorkbenchStatusCards
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={totalTaskCount}
			/>
			{boardField ? (
				<LessonWorkbenchLabeledCard label={boardField.label}>
					<FieldControl
						field={boardField}
						value={fieldValues[boardField.id]}
						onChange={(value) => onFieldChange(boardField.id, value)}
						pinnedArtifacts={pinnedArtifacts}
					/>
				</LessonWorkbenchLabeledCard>
			) : null}
			<FieldList
				fields={restFields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				className="grid gap-2 md:grid-cols-2"
			/>
		</div>
	);
}
