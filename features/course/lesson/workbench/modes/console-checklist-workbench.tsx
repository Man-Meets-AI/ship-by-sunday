import { FieldList } from "../fields/field-list";
import type { WorkbenchModeProps } from "../types";
import {
	LessonWorkbenchPageHeader,
	LessonWorkbenchStatusCards,
} from "./lesson-workbench-shadcn-chrome";

export function ConsoleChecklistWorkbench({
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
			<FieldList
				fields={fields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				className="grid gap-2 md:grid-cols-2"
			/>
		</div>
	);
}
