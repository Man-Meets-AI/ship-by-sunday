"use client";

import type { ChangeEvent } from "react";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/codebase-compiler";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CodebaseFieldCharacterCounter } from "@/app/(app)/_components/codebase-flow/codebase-field-character-counter";
import { CodebaseFieldErrorRegion } from "@/app/(app)/_components/codebase-flow/codebase-field-error-region";
import { getCodebaseFieldCharacterBudget } from "@/lib/codebase-flow/codebase-field-character-budgets";
import {
	codebaseFieldHelperText,
	codebaseFieldInputKind,
	codebaseFieldLabel,
	codebaseFieldPlaceholder,
} from "@/lib/codebase-flow/codebase-field-helpers";
import { getCodebaseStageFieldInputId } from "@/lib/codebase-flow/codebase-step-save-feedback";

export function CodebaseStageTextField({
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
	const inputId = getCodebaseStageFieldInputId(stepId, fieldKey);
	const errorId = errorMessage ? `${inputId}-error` : undefined;
	const helperText = codebaseFieldHelperText(fieldKey, facts);
	const placeholder = codebaseFieldPlaceholder(fieldKey, facts) ?? undefined;
	const inputKind = codebaseFieldInputKind(fieldKey);
	const isShortField = fieldKey === "pricing";
	const characterBudget =
		inputKind === "textarea" ? getCodebaseFieldCharacterBudget(fieldKey) : null;
	const isOverBudget =
		characterBudget !== null && value.length > characterBudget;
	const budgetId = characterBudget !== null ? `${inputId}-budget` : undefined;
	const describedBy =
		[errorId, isOverBudget ? budgetId : undefined].filter(Boolean).join(" ") ||
		undefined;
	const updateCodebaseTextField = (
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => onChange(fieldKey, event.target.value);

	return (
		<Field className="gap-2.5" data-invalid={errorMessage ? true : undefined}>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<FieldLabel htmlFor={inputId}>
					{codebaseFieldLabel(fieldKey, facts)}
				</FieldLabel>
			</div>
			<FieldContent>
				{inputKind === "textarea" ? (
					<Textarea
						id={inputId}
						className="min-h-24"
						textareaClassName="min-h-24 py-2.5 text-sm leading-relaxed"
						value={value}
						placeholder={placeholder}
						onChange={updateCodebaseTextField}
						rows={fieldKey === "section_narrative" ? 6 : 4}
						aria-describedby={describedBy}
						aria-invalid={errorMessage ? true : undefined}
					/>
				) : (
					<Input
						id={inputId}
						type={inputKind === "number" ? "number" : "text"}
						className={isShortField ? "max-w-48" : undefined}
						inputClassName="h-10 leading-10 sm:h-10 sm:leading-10"
						value={value}
						placeholder={placeholder}
						onChange={updateCodebaseTextField}
						aria-describedby={describedBy}
						aria-invalid={errorMessage ? true : undefined}
					/>
				)}
				{helperText ? <FieldDescription>{helperText}</FieldDescription> : null}
				{isOverBudget && characterBudget !== null && budgetId ? (
					<CodebaseFieldCharacterCounter
						budget={characterBudget}
						count={value.length}
						fieldKey={fieldKey}
						id={budgetId}
					/>
				) : null}
				<CodebaseFieldErrorRegion
					errorId={errorId}
					errorMessage={errorMessage}
				/>
			</FieldContent>
		</Field>
	);
}
