import type { WorkbenchField } from "@/lib/course/manifest";

import { CheckboxRow } from "./checkbox-row";
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
) {
	if (field.kind === "checklist") {
		const options = field.options ?? [];
		const checklistItems = normalizeChecklistValue(value, options);

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
					placeholder="One item per line"
					className={inputBaseClass}
				/>
			</label>
		);
	}

	if (field.kind === "table") {
		return (
			<label className={`block ${inputWidthClass(field)}`}>
				<span className={fieldLabelClass}>{field.label}</span>
				<textarea
					value={toTableText(value)}
					onChange={(event) => onChange(parseTable(event.target.value))}
					rows={6}
					placeholder="One row per line. Separate columns with |"
					className={`${inputBaseClass} font-mono`}
				/>
			</label>
		);
	}

	return null;
}
