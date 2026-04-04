"use client";

import type { ChangeEvent } from "react";
import type { CanonicalProjectFactKey } from "@shipbysunday/blueprint-compiler";
import {
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	blueprintFieldInputKind,
	blueprintFieldLabel,
} from "@/features/blueprint-flow/lib/blueprint-field-helpers";
import { getBlueprintStageFieldInputId } from "@/features/blueprint-flow/lib/blueprint-step-save-feedback";

export function BlueprintStageField({
	fieldKey,
	stepId,
	value,
	errorMessage,
	isInvalid,
	onChange,
}: {
	fieldKey: CanonicalProjectFactKey;
	stepId: string;
	value: string;
	errorMessage?: string;
	isInvalid?: boolean;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
}) {
	const kind = blueprintFieldInputKind(fieldKey);
	const inputId = getBlueprintStageFieldInputId(stepId, fieldKey);
	const errorId = errorMessage ? `${inputId}-error` : undefined;
	const handleChange = (
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		onChange(fieldKey, event.target.value);
	};

	return (
		<Field data-invalid={isInvalid || undefined}>
			<FieldLabel htmlFor={inputId}>{blueprintFieldLabel(fieldKey)}</FieldLabel>
			<FieldContent>
				{kind === "textarea" ? (
					<Textarea
						id={inputId}
						value={value}
						onChange={handleChange}
						rows={fieldKey === "section_narrative" ? 6 : 4}
						aria-describedby={errorId}
						aria-invalid={isInvalid || undefined}
					/>
				) : (
					<Input
						id={inputId}
						type={kind === "number" ? "number" : "text"}
						value={value}
						onChange={handleChange}
						aria-describedby={errorId}
						aria-invalid={isInvalid || undefined}
					/>
				)}
				<FieldError id={errorId}>{errorMessage}</FieldError>
			</FieldContent>
		</Field>
	);
}
