"use client";

import { memo, useId } from "react";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/blueprint-compiler";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldTitle,
} from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BlueprintFieldErrorRegion } from "@/app/(workspace)/_components/blueprint-flow/blueprint-field-error-region";
import {
	getBlueprintFieldScaleDefinition,
	blueprintFieldHelperText,
	blueprintFieldLabel,
} from "@/lib/blueprint-flow/blueprint-field-helpers";
import {
	getBlueprintStageFieldControlId,
	getBlueprintStageFieldInputId,
} from "@/lib/blueprint-flow/blueprint-step-save-feedback";

type BlueprintStageScaleFieldProps = {
	fieldKey: CanonicalProjectFactKey;
	facts: CanonicalProjectFactsDraft;
	stepId: string;
	value: string;
	errorMessage?: string;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
};

function BlueprintStageScaleFieldComponent({
	fieldKey,
	facts,
	stepId,
	value,
	errorMessage,
	onChange,
}: BlueprintStageScaleFieldProps) {
	const scaleDefinition = getBlueprintFieldScaleDefinition(fieldKey);
	if (!scaleDefinition) {
		throw new Error(`Missing scale definition for ${fieldKey}`);
	}

	const titleId = useId();
	const inputId = getBlueprintStageFieldInputId(stepId, fieldKey);
	const controlId = getBlueprintStageFieldControlId(stepId, fieldKey);
	const errorId = errorMessage ? `${inputId}-error` : undefined;
	const helperText = blueprintFieldHelperText(fieldKey, facts);

	return (
		<Field className="gap-2" data-invalid={errorMessage ? true : undefined}>
			<FieldContent>
				<FieldTitle id={titleId}>
					{blueprintFieldLabel(fieldKey, facts)}
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
				<BlueprintFieldErrorRegion
					errorId={errorId}
					errorMessage={errorMessage}
				/>
			</FieldContent>
		</Field>
	);
}

export const BlueprintStageScaleField = memo(
	BlueprintStageScaleFieldComponent,
	(previousProps, nextProps) =>
		previousProps.fieldKey === nextProps.fieldKey &&
		previousProps.stepId === nextProps.stepId &&
		previousProps.value === nextProps.value &&
		previousProps.errorMessage === nextProps.errorMessage &&
		blueprintFieldLabel(previousProps.fieldKey, previousProps.facts) ===
			blueprintFieldLabel(nextProps.fieldKey, nextProps.facts) &&
		blueprintFieldHelperText(previousProps.fieldKey, previousProps.facts) ===
			blueprintFieldHelperText(nextProps.fieldKey, nextProps.facts),
);
