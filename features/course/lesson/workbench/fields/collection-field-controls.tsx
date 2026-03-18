import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { CheckboxRow } from "./checkbox-row";
import { EditableTableField } from "./editable-table-field";
import {
	fieldLabelClass,
	inputBaseClass,
	inputWidthClass,
} from "./field-styles";
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
		const checklistOptions = field.options ?? [];
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
				<textarea
					value={toLineList(value)}
					onChange={(event) => onChange(parseLines(event.target.value))}
					rows={field.rows ?? 6}
					placeholder={field.placeholder ?? "One item per line"}
					className={inputBaseClass}
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

		const tableTextareaClass = showLabel
			? inputBaseClass
			: inputBaseClass.replace("mt-1.5 ", "");

		return (
			<label className={`block ${inputWidthClass(field)}`}>
				{showLabel ? (
					<span className={fieldLabelClass}>{field.label}</span>
				) : null}
				<textarea
					value={toTableText(value)}
					onChange={(event) => onChange(parseTable(event.target.value))}
					rows={6}
					placeholder="One row per line. Separate columns with |"
					className={`${tableTextareaClass} font-mono`}
				/>
			</label>
		);
	}

	return null;
}
