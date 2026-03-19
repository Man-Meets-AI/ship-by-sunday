"use client";

import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { assert } from "@/features/course/lesson/lib/assert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckboxRow } from "./checkbox-row";
import { inputWidthClass } from "./field-styles";

export function renderBasicFieldControl(
	field: WorkbenchField,
	value: unknown,
	onChange: (value: unknown) => void,
	options?: { invalid?: boolean },
) {
	const invalid = Boolean(options?.invalid);
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

	if (field.kind === "number") {
		return (
			<Field className={widthClass} data-invalid={invalid || undefined}>
				<FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
				{help}
				<FieldContent>
					<Input
						id={field.id}
						type="number"
						value={typeof value === "number" ? value : ""}
						onChange={(event) => onChange(Number(event.target.value))}
						aria-invalid={invalid}
					/>
				</FieldContent>
			</Field>
		);
	}

	if (field.kind === "radio_group") {
		assert(
			field.options,
			`Radio group field "${field.id}" is missing options.`,
		);

		return (
			<Field className={widthClass} data-invalid={invalid || undefined}>
				<FieldLabel>{field.label}</FieldLabel>
				{help}
				<FieldContent>
					<RadioGroup
						value={typeof value === "string" ? value : ""}
						onValueChange={onChange}
					>
						{field.options.map((option, index) => {
							const optionId = `${field.id}-${index}`;
							return (
								<div key={option} className="flex items-center gap-2">
									<RadioGroupItem value={option} id={optionId} />
									<Label
										htmlFor={optionId}
										className="cursor-pointer font-normal"
									>
										{option}
									</Label>
								</div>
							);
						})}
					</RadioGroup>
				</FieldContent>
			</Field>
		);
	}

	if (field.kind === "toggle") {
		return (
			<Field className={widthClass} data-invalid={invalid || undefined}>
				<FieldContent>
					<CheckboxRow
						id={field.id}
						label={field.label}
						checked={Boolean(value)}
						onChange={onChange}
					/>
				</FieldContent>
				{help}
			</Field>
		);
	}

	if (field.kind === "select") {
		assert(field.options, `Select field "${field.id}" is missing options.`);

		return (
			<Field className={widthClass} data-invalid={invalid || undefined}>
				<FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
				{help}
				<FieldContent>
					<Select
						value={typeof value === "string" ? value : ""}
						onValueChange={onChange}
					>
						<SelectTrigger id={field.id} aria-invalid={invalid}>
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

	return null;
}
