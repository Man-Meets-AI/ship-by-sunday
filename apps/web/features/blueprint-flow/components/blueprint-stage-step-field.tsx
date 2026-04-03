"use client";

import { memo, type ChangeEvent } from "react";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
	BlueprintStepDefinition,
} from "@blueprint-compiler";
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
	getBlueprintFieldScaleDefinition,
	blueprintFieldHelperText,
	blueprintFieldInputKind,
	blueprintFieldLabel,
} from "@/features/blueprint-flow/lib/blueprint-field-helpers";
import { getBlueprintStageFieldInputId } from "@/features/blueprint-flow/lib/blueprint-step-save-feedback";
import { BlueprintStageScaleField } from "./blueprint-stage-scale-field";

type BlueprintStageStepFieldProps = {
	fieldKey: CanonicalProjectFactKey;
	facts: CanonicalProjectFactsDraft;
	step: BlueprintStepDefinition;
	value: string;
	errorMessage?: string;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
};

function BlueprintStageStepFieldComponent({
	fieldKey,
	facts,
	step,
	value,
	errorMessage,
	onChange,
}: BlueprintStageStepFieldProps) {
	if (getBlueprintFieldScaleDefinition(fieldKey)) {
		return (
			<BlueprintStageScaleField
				fieldKey={fieldKey}
				facts={facts}
				stepId={step.id}
				value={value}
				errorMessage={errorMessage}
				onChange={onChange}
			/>
		);
	}

	const inputId = getBlueprintStageFieldInputId(step.id, fieldKey);
	const errorId = errorMessage ? `${inputId}-error` : undefined;
	const helperText = blueprintFieldHelperText(fieldKey, facts);
	const handleChange = (
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => onChange(fieldKey, event.target.value);

	return (
		<Field className="gap-2" data-invalid={errorMessage ? true : undefined}>
			<FieldLabel htmlFor={inputId}>
				{blueprintFieldLabel(fieldKey, facts)}
			</FieldLabel>
			<FieldContent>
				{blueprintFieldInputKind(fieldKey) === "textarea" ? (
					<Textarea
						id={inputId}
						value={value}
						onChange={handleChange}
						rows={fieldKey === "section_narrative" ? 6 : 4}
						aria-describedby={errorId}
						aria-invalid={errorMessage ? true : undefined}
					/>
				) : (
					<Input
						id={inputId}
						type={
							blueprintFieldInputKind(fieldKey) === "number" ? "number" : "text"
						}
						value={value}
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

export const BlueprintStageStepField = memo(
	BlueprintStageStepFieldComponent,
	(previousProps, nextProps) =>
		previousProps.fieldKey === nextProps.fieldKey &&
		previousProps.step.id === nextProps.step.id &&
		previousProps.value === nextProps.value &&
		previousProps.errorMessage === nextProps.errorMessage &&
		blueprintFieldLabel(previousProps.fieldKey, previousProps.facts) ===
			blueprintFieldLabel(nextProps.fieldKey, nextProps.facts) &&
		blueprintFieldHelperText(previousProps.fieldKey, previousProps.facts) ===
			blueprintFieldHelperText(nextProps.fieldKey, nextProps.facts),
);
