"use client";

import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import { assert } from "@/lib/assert";
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

import { renderChecklistLabel } from "../../fields/checklist-label";
import { inputWidthClass } from "../../fields/field-styles";
import { normalizeChecklistValue } from "../../fields/value-codecs";

export type CodexMarketingSiteMarketingFieldProps = {
	field: WorkbenchField;
	value: unknown;
	onChange: (value: unknown) => void;
	invalid?: boolean;
};

export function CodexMarketingSiteMarketingField({
	field,
	value,
	onChange,
	invalid = false,
}: CodexMarketingSiteMarketingFieldProps) {
	const widthClass = inputWidthClass(field);
	const help = field.helpText ? (
		<FieldDescription>{field.helpText}</FieldDescription>
	) : null;

	if (field.kind === "text" || field.kind === "url") {
		return (
			<Field className={widthClass} data-invalid={invalid || undefined}>
				<FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
				{help}
				<FieldContent>
					<Input
						id={field.id}
						type={field.kind === "url" ? "url" : "text"}
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
		const checklistOptions = field.options;
		const checklistItems = normalizeChecklistValue(value, checklistOptions);

		return (
			<Field className="block w-full" data-invalid={invalid || undefined}>
				<FieldLabel>{field.label}</FieldLabel>
				{help}
				<FieldContent>
					<div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
						{checklistItems.map((item, index) => {
							const rowId = `${field.id}-${index}`;
							return (
								<div
									key={rowId}
									className="flex cursor-pointer items-start gap-3 px-3 py-2.5"
								>
									<Checkbox
										id={rowId}
										checked={item.checked}
										className="mt-0.5"
										aria-invalid={invalid}
										onCheckedChange={(nextChecked) => {
											const nextItems = checklistItems.map(
												(current, currentIndex) =>
													currentIndex === index
														? { ...current, checked: Boolean(nextChecked) }
														: current,
											);
											onChange(nextItems);
										}}
									/>
									<Label
										htmlFor={rowId}
										className="min-w-0 flex-1 cursor-pointer text-sm leading-relaxed font-normal text-foreground"
									>
										{renderChecklistLabel(item.label)}
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
