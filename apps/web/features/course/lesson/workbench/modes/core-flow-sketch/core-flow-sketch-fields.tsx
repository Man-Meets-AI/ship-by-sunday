"use client";

import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { assert } from "@/lib/assert";
import { inputWidthClass } from "@/features/course/lesson/workbench/fields/field-styles";
import { normalizeChecklistValue } from "@/features/course/lesson/workbench/fields/value-codecs";

export type CoreFlowSketchFieldProps = {
	field: WorkbenchField;
	value: unknown;
	onChange: (value: unknown) => void;
	invalid?: boolean;
};

export function CoreFlowSketchField({
	field,
	value,
	onChange,
	invalid = false,
}: CoreFlowSketchFieldProps) {
	const widthClass = inputWidthClass(field);
	const help = field.helpText ? (
		<FieldDescription>{field.helpText}</FieldDescription>
	) : null;

	if (field.kind === "text") {
		return (
			<Field className={widthClass} data-invalid={invalid || undefined}>
				<FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
				{help}
				<FieldContent>
					<Input
						id={field.id}
						type="text"
						value={typeof value === "string" ? value : ""}
						onChange={(event) => onChange(event.target.value)}
						placeholder={field.placeholder}
						aria-invalid={invalid}
					/>
				</FieldContent>
			</Field>
		);
	}

	if (field.kind === "textarea") {
		return (
			<Field className={widthClass} data-invalid={invalid || undefined}>
				<FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
				{help}
				<FieldContent>
					<Textarea
						id={field.id}
						value={typeof value === "string" ? value : ""}
						onChange={(event) => onChange(event.target.value)}
						rows={field.rows ?? 5}
						placeholder={field.placeholder}
						aria-invalid={invalid}
					/>
				</FieldContent>
			</Field>
		);
	}

	if (field.kind === "checklist") {
		assert(field.options, `Checklist field "${field.id}" is missing options.`);
		const checklistItems = normalizeChecklistValue(value, field.options);

		return (
			<Field className="block w-full" data-invalid={invalid || undefined}>
				<FieldLabel>{field.label}</FieldLabel>
				{help}
				<FieldContent>
					<div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
						{checklistItems.map((item, index) => {
							const optionId = `${field.id}-${index}`;
							return (
								<div
									key={item.label}
									className="flex items-start gap-3 px-3 py-2.5"
								>
									<Checkbox
										id={optionId}
										checked={item.checked}
										className="mt-0.5"
										onCheckedChange={(nextChecked) => {
											const nextItems = checklistItems.map((current, i) =>
												i === index
													? { ...current, checked: Boolean(nextChecked) }
													: current,
											);
											onChange(nextItems);
										}}
									/>
									<Label
										htmlFor={optionId}
										className="min-w-0 flex-1 cursor-pointer text-sm leading-relaxed font-normal"
									>
										{item.label}
									</Label>
								</div>
							);
						})}
					</div>
				</FieldContent>
			</Field>
		);
	}

	return null;
}
