"use client";

import type { ChangeEvent } from "react";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/blueprint-compiler";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	blueprintFieldHelperText,
	blueprintFieldInputKind,
	blueprintFieldLabel,
	blueprintFieldPlaceholder,
} from "@/lib/blueprint-flow/blueprint-field-helpers";
import { getBlueprintStageFieldInputId } from "@/lib/blueprint-flow/blueprint-step-save-feedback";

export function BlueprintStageTextField({
	errorMessage,
	facts,
	fieldKey,
	onChange,
	stepId,
	value,
}: {
	errorMessage?: string;
	facts: CanonicalProjectFactsDraft;
	fieldKey: CanonicalProjectFactKey;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
	stepId: string;
	value: string;
}) {
	const inputId = getBlueprintStageFieldInputId(stepId, fieldKey);
	const errorId = errorMessage ? `${inputId}-error` : undefined;
	const helperText = blueprintFieldHelperText(fieldKey, facts);
	const placeholder = blueprintFieldPlaceholder(fieldKey, facts) ?? undefined;
	const inputKind = blueprintFieldInputKind(fieldKey);
	const isShortField = fieldKey === "pricing";
	const handleChange = (
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => onChange(fieldKey, event.target.value);

	return (
		<Field className="gap-2.5" data-invalid={errorMessage ? true : undefined}>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<FieldLabel htmlFor={inputId}>
					{blueprintFieldLabel(fieldKey, facts)}
				</FieldLabel>
			</div>
			<FieldContent>
				{inputKind === "textarea" ? (
					<Textarea
						id={inputId}
						className="min-h-24 py-2.5 text-sm leading-relaxed"
						value={value}
						placeholder={placeholder}
						onChange={handleChange}
						rows={fieldKey === "section_narrative" ? 6 : 4}
						aria-describedby={errorId}
						aria-invalid={errorMessage ? true : undefined}
					/>
				) : (
					<Input
						id={inputId}
						type={inputKind === "number" ? "number" : "text"}
						className={isShortField ? "h-10 max-w-48" : "h-10"}
						value={value}
						placeholder={placeholder}
						onChange={handleChange}
						aria-describedby={errorId}
						aria-invalid={errorMessage ? true : undefined}
					/>
				)}
				{helperText ? <FieldDescription>{helperText}</FieldDescription> : null}
				<FieldError id={errorId}>{errorMessage}</FieldError>
			</FieldContent>
		</Field>
	);
}
