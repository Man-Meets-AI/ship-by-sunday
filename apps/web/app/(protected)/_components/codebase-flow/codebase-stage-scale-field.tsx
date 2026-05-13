"use client";

import { memo, useId } from "react";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/codebase-compiler";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldTitle,
} from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CodebaseFieldErrorRegion } from "@/app/(protected)/_components/codebase-flow/codebase-field-error-region";
import {
	getCodebaseFieldScaleDefinition,
	codebaseFieldHelperText,
	codebaseFieldLabel,
} from "@/lib/codebase-flow/codebase-field-helpers";
import {
	getCodebaseStageFieldControlId,
	getCodebaseStageFieldInputId,
} from "@/lib/codebase-flow/codebase-step-save-feedback";

type CodebaseStageScaleFieldProps = {
	fieldKey: CanonicalProjectFactKey;
	facts: CanonicalProjectFactsDraft;
	stepId: string;
	value: string;
	errorMessage?: string;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
};

function CodebaseStageScaleFieldComponent({
	fieldKey,
	facts,
	stepId,
	value,
	errorMessage,
	onChange,
}: CodebaseStageScaleFieldProps) {
	const scaleDefinition = getCodebaseFieldScaleDefinition(fieldKey);
	if (!scaleDefinition) {
		throw new Error(`Missing scale definition for ${fieldKey}`);
	}

	const titleId = useId();
	const inputId = getCodebaseStageFieldInputId(stepId, fieldKey);
	const controlId = getCodebaseStageFieldControlId(stepId, fieldKey);
	const errorId = errorMessage ? `${inputId}-error` : undefined;
	const helperText = codebaseFieldHelperText(fieldKey, facts);

	return (
		<Field className="gap-2" data-invalid={errorMessage ? true : undefined}>
			<FieldContent>
				<FieldTitle id={titleId}>
					{codebaseFieldLabel(fieldKey, facts)}
				</FieldTitle>
				{scaleDefinition.leftLabel || scaleDefinition.rightLabel ? (
					<div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 text-xs text-muted-foreground">
						<span>{scaleDefinition.leftLabel}</span>
						<span className="text-center">{scaleDefinition.centerLabel}</span>
						<span className="text-right">{scaleDefinition.rightLabel}</span>
					</div>
				) : null}
				<ToggleGroup
					id={controlId}
					type="single"
					variant="outline"
					size="sm"
					spacing={1}
					value={value}
					onValueChange={(nextValue) => {
						onChange(fieldKey, nextValue);
					}}
					aria-labelledby={titleId}
					aria-describedby={errorId}
					aria-invalid={errorMessage ? true : undefined}
					className="w-full justify-between"
				>
					{scaleDefinition.options.map((option) => (
						<ToggleGroupItem
							key={option.value}
							value={option.value}
							aria-label={option.ariaLabel}
							className="min-w-0 flex-1 px-0 font-medium font-number"
						>
							{option.label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				<input
					id={inputId}
					type="hidden"
					value={value}
					readOnly
					aria-hidden="true"
				/>
				{helperText ? <FieldDescription>{helperText}</FieldDescription> : null}
				<CodebaseFieldErrorRegion
					errorId={errorId}
					errorMessage={errorMessage}
				/>
			</FieldContent>
		</Field>
	);
}

export const CodebaseStageScaleField = memo(
	CodebaseStageScaleFieldComponent,
	(previousProps, nextProps) =>
		previousProps.fieldKey === nextProps.fieldKey &&
		previousProps.stepId === nextProps.stepId &&
		previousProps.value === nextProps.value &&
		previousProps.errorMessage === nextProps.errorMessage &&
		codebaseFieldLabel(previousProps.fieldKey, previousProps.facts) ===
			codebaseFieldLabel(nextProps.fieldKey, nextProps.facts) &&
		codebaseFieldHelperText(previousProps.fieldKey, previousProps.facts) ===
			codebaseFieldHelperText(nextProps.fieldKey, nextProps.facts),
);
