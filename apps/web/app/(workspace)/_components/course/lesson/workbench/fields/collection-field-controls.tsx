"use client";

import type { WorkbenchField } from "@/lib/course/lesson/model/manifest";

import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { assert } from "@/lib/assert";
import { ChecklistOptionRow } from "./checklist-option-row";
import { EditableTableField } from "./editable-table-field";
import { inputWidthClass } from "./field-styles";
import {
	normalizeChecklistValue,
	parseLines,
	parseTable,
	toLineList,
	toTableText,
} from "./value-codecs";

export function renderCollectionFieldControl(
	field: WorkbenchField,
	value: unknown,
	onChange: (value: unknown) => void,
	renderOptions?: {
		showLabel?: boolean;
	},
) {
	const showLabel = renderOptions?.showLabel ?? true;

	if (field.kind === "checklist") {
		assert(field.options, `Checklist field "${field.id}" is missing options.`);
		const checklistOptions = field.options;
		const checklistItems = normalizeChecklistValue(value, checklistOptions);

		return (
			<Field className="block w-full">
				{showLabel ? <FieldLabel>{field.label}</FieldLabel> : null}
				<FieldContent>
					<div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
						{checklistItems.map((item, index) => (
							<ChecklistOptionRow
								key={`${field.id}-${index}`}
								label={item.label}
								checked={item.checked}
								onChange={(checked) => {
									const nextItems = checklistItems.map(
										(current, currentIndex) =>
											currentIndex === index
												? { ...current, checked }
												: current,
									);
									onChange(nextItems);
								}}
							/>
						))}
					</div>
				</FieldContent>
			</Field>
		);
	}

	if (field.kind === "board") {
		return (
			<Field className={`block ${inputWidthClass(field)}`}>
				<FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
				<FieldContent>
					<Textarea
						id={field.id}
						value={toLineList(value)}
						onChange={(event) => onChange(parseLines(event.target.value))}
						rows={field.rows ?? 6}
						placeholder={field.placeholder ?? "One item per line"}
					/>
				</FieldContent>
			</Field>
		);
	}

	if (field.kind === "table") {
		if (field.columns && field.columns.length > 0) {
			return (
				<EditableTableField
					field={field}
					value={value}
					onChange={onChange}
					showLabel={showLabel}
				/>
			);
		}

		return (
			<Field className={`block ${inputWidthClass(field)}`}>
				{showLabel ? (
					<FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
				) : null}
				<FieldContent>
					<Textarea
						id={field.id}
						value={toTableText(value)}
						onChange={(event) => onChange(parseTable(event.target.value))}
						rows={6}
						placeholder="One row per line. Separate columns with |"
						className="font-mono"
					/>
				</FieldContent>
			</Field>
		);
	}

	return null;
}
