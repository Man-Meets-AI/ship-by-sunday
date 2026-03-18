import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { CheckboxRow } from "./checkbox-row";
import {
	fieldLabelClass,
	inputBaseClass,
	inputWidthClass,
} from "./field-styles";

export function renderBasicFieldControl(
	field: WorkbenchField,
	value: unknown,
	onChange: (value: unknown) => void,
) {
	if (field.kind === "text" || field.kind === "url") {
		return (
			<label className={`block ${inputWidthClass(field)}`}>
				<span className={fieldLabelClass}>{field.label}</span>
				<input
					type={field.kind === "url" ? "url" : "text"}
					value={typeof value === "string" ? value : ""}
					onChange={(event) => onChange(event.target.value)}
					placeholder={field.placeholder}
					className={inputBaseClass}
				/>
			</label>
		);
	}

	if (field.kind === "number") {
		return (
			<label className={`block ${inputWidthClass(field)}`}>
				<span className={fieldLabelClass}>{field.label}</span>
				<input
					type="number"
					value={typeof value === "number" ? value : ""}
					onChange={(event) => onChange(Number(event.target.value) || 0)}
					className={inputBaseClass}
				/>
			</label>
		);
	}

	if (field.kind === "toggle") {
		return (
			<CheckboxRow
				label={field.label}
				checked={Boolean(value)}
				onChange={onChange}
			/>
		);
	}

	if (field.kind === "select") {
		return (
			<label className={`block ${inputWidthClass(field)}`}>
				<span className={fieldLabelClass}>{field.label}</span>
				<select
					value={typeof value === "string" ? value : ""}
					onChange={(event) => onChange(event.target.value)}
					className={inputBaseClass}
				>
					<option value="">Select one</option>
					{field.options?.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			</label>
		);
	}

	if (field.kind === "textarea") {
		return (
			<label className={`block ${inputWidthClass(field)}`}>
				<span className={fieldLabelClass}>{field.label}</span>
				<textarea
					value={typeof value === "string" ? value : ""}
					onChange={(event) => onChange(event.target.value)}
					rows={field.rows ?? 5}
					placeholder={field.placeholder}
					className={inputBaseClass}
				/>
			</label>
		);
	}

	return null;
}
