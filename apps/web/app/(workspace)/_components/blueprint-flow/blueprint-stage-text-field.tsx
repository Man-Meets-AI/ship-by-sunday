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
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BlueprintFieldCharacterCounter } from "@/app/(workspace)/_components/blueprint-flow/blueprint-field-character-counter";
import { BlueprintFieldErrorRegion } from "@/app/(workspace)/_components/blueprint-flow/blueprint-field-error-region";
import { getBlueprintFieldCharacterBudget } from "@/lib/blueprint-flow/blueprint-field-character-budgets";
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
	const characterBudget =
		inputKind === "textarea"
			? getBlueprintFieldCharacterBudget(fieldKey)
			: null;
	const isOverBudget =
		characterBudget !== null && value.length > characterBudget;
	const budgetId = characterBudget !== null ? `${inputId}-budget` : undefined;
	const describedBy =
		[errorId, isOverBudget ? budgetId : undefined].filter(Boolean).join(" ") ||
		undefined;
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
						aria-describedby={describedBy}
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
						aria-describedby={describedBy}
						aria-invalid={errorMessage ? true : undefined}
					/>
				)}
				{helperText ? <FieldDescription>{helperText}</FieldDescription> : null}
				{isOverBudget && characterBudget !== null && budgetId ? (
					<BlueprintFieldCharacterCounter
						budget={characterBudget}
						count={value.length}
						fieldKey={fieldKey}
						id={budgetId}
					/>
				) : null}
				<BlueprintFieldErrorRegion
					errorId={errorId}
					errorMessage={errorMessage}
				/>
			</FieldContent>
		</Field>
	);
}
