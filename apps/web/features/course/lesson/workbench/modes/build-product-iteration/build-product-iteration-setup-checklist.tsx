"use client";

import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import { ChecklistFieldRows } from "@/features/course/lesson/workbench/fields/checklist-field-rows";

type Props = {
	checklistField: WorkbenchField;
	value: unknown;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalid: boolean;
	message: string;
};

export function BuildProductIterationSetupChecklist({
	checklistField,
	value,
	onFieldChange,
	invalid,
	message,
}: Props) {
	return (
		<>
			<ChecklistFieldRows
				field={checklistField}
				value={value}
				className="overflow-hidden rounded-lg border border-border"
				onChange={(nextItems) => onFieldChange(checklistField.id, nextItems)}
			/>
			{invalid ? <p className="text-sm text-destructive">{message}</p> : null}
		</>
	);
}
