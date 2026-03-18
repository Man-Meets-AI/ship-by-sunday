import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { Input } from "@/components/ui/input";
import { assert } from "@/features/course/lesson/lib/assert";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckboxRow } from "./checkbox-row";
import { fieldLabelClass, inputWidthClass } from "./field-styles";

export function renderBasicFieldControl(
	field: WorkbenchField,
	value: unknown,
	onChange: (value: unknown) => void,
) {
	if (field.kind === "text" || field.kind === "url") {
		return (
			<label className={`block ${inputWidthClass(field)}`}>
				<span className={fieldLabelClass}>{field.label}</span>
				<Input
					type={field.kind === "url" ? "url" : "text"}
					value={typeof value === "string" ? value : ""}
					onChange={(event) => onChange(event.target.value)}
					placeholder={field.placeholder}
					className="mt-2"
				/>
			</label>
		);
	}

	if (field.kind === "number") {
		return (
			<label className={`block ${inputWidthClass(field)}`}>
				<span className={fieldLabelClass}>{field.label}</span>
				<Input
					type="number"
					value={typeof value === "number" ? value : ""}
					onChange={(event) => onChange(Number(event.target.value))}
					className="mt-2"
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
		assert(field.options, `Select field "${field.id}" is missing options.`);

		return (
			<label className={`block ${inputWidthClass(field)}`}>
				<span className={fieldLabelClass}>{field.label}</span>
				<Select
					value={typeof value === "string" ? value : ""}
					onValueChange={onChange}
				>
					<SelectTrigger className="mt-2">
						<SelectValue placeholder="Select one" />
					</SelectTrigger>
					<SelectContent>
						{field.options.map((option) => (
							<SelectItem key={option} value={option}>
								{option}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</label>
		);
	}

	if (field.kind === "textarea") {
		return (
			<label className={`block ${inputWidthClass(field)}`}>
				<span className={fieldLabelClass}>{field.label}</span>
				<Textarea
					value={typeof value === "string" ? value : ""}
					onChange={(event) => onChange(event.target.value)}
					rows={field.rows ?? 5}
					placeholder={field.placeholder}
					className="mt-2"
				/>
			</label>
		);
	}

	return null;
}
