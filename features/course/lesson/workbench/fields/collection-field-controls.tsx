import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { Textarea } from "@/components/ui/textarea";
import { assert } from "@/features/course/lesson/lib/assert";
import { CheckboxRow } from "./checkbox-row";
import { EditableTableField } from "./editable-table-field";
import { fieldLabelClass, inputWidthClass } from "./field-styles";
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
			<div className="block">
				<span className={fieldLabelClass}>{field.label}</span>
				<div className="mt-2 space-y-2">
					{checklistItems.map((item, index) => (
						<CheckboxRow
							key={item.label}
							label={item.label}
							checked={item.checked}
							onChange={(checked) => {
								const nextItems = checklistItems.map((current, currentIndex) =>
									currentIndex === index ? { ...current, checked } : current,
								);
								onChange(nextItems);
							}}
						/>
					))}
				</div>
			</div>
		);
	}

	if (field.kind === "board") {
		return (
			<label className={`block ${inputWidthClass(field)}`}>
				<span className={fieldLabelClass}>{field.label}</span>
				<Textarea
					value={toLineList(value)}
					onChange={(event) => onChange(parseLines(event.target.value))}
					rows={field.rows ?? 6}
					placeholder={field.placeholder ?? "One item per line"}
					className="mt-2"
				/>
			</label>
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
			<label className={`block ${inputWidthClass(field)}`}>
				{showLabel ? (
					<span className={fieldLabelClass}>{field.label}</span>
				) : null}
				<Textarea
					value={toTableText(value)}
					onChange={(event) => onChange(parseTable(event.target.value))}
					rows={6}
					placeholder="One row per line. Separate columns with |"
					className={showLabel ? "mt-2 font-mono" : "font-mono"}
				/>
			</label>
		);
	}

	return null;
}
