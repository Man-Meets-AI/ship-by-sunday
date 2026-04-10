"use client";

import { memo, type ChangeEvent } from "react";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
	BlueprintStepDefinition,
} from "@shipbysunday/blueprint-compiler";
import { isBlueprintArrayField } from "@shipbysunday/blueprint-compiler";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BlueprintProblemStatementOptimizer } from "@/features/blueprint-flow/components/blueprint-problem-statement-optimizer";
import {
	getBlueprintFieldScaleDefinition,
	blueprintFieldHelperText,
	blueprintFieldInputKind,
	blueprintFieldLabel,
	blueprintFieldPlaceholder,
} from "@/features/blueprint-flow/lib/blueprint-field-helpers";
import { getBlueprintStageFieldInputId } from "@/features/blueprint-flow/lib/blueprint-step-save-feedback";
import { BlueprintStageListField } from "./blueprint-stage-list-field";
import { BlueprintStageLinkListField } from "./blueprint-stage-link-list-field";
import { BlueprintStageScaleField } from "./blueprint-stage-scale-field";
import { BlueprintDesignPresetField } from "./blueprint-design-preset-field";
import { BlueprintThemeConfigurator } from "./blueprint-theme-configurator";

type BlueprintStageStepFieldProps = {
	fieldKey: CanonicalProjectFactKey;
	facts: CanonicalProjectFactsDraft;
	draftValues: Record<string, string>;
	step: BlueprintStepDefinition;
	value: string;
	errorMessage?: string;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
};

function BlueprintStageStepFieldComponent({
	fieldKey,
	facts,
	draftValues,
	step,
	value,
	errorMessage,
	onChange,
}: BlueprintStageStepFieldProps) {
	if (fieldKey === "design_preset_id") {
		const inputId = getBlueprintStageFieldInputId(step.id, fieldKey);
		const errorId = errorMessage ? `${inputId}-error` : undefined;
		const label = blueprintFieldLabel(fieldKey, facts);
		const helperText = blueprintFieldHelperText(fieldKey, facts);

		return (
			<Field className="gap-2.5" data-invalid={errorMessage ? true : undefined}>
				<FieldLabel htmlFor={inputId}>{label}</FieldLabel>
				<FieldContent>
					<BlueprintDesignPresetField
						currentThemePreset={draftValues.theme_preset ?? ""}
						description={helperText}
						errorId={errorId}
						inputId={inputId}
						label={label}
						onChange={onChange}
						value={value}
					/>
					<FieldError id={errorId}>{errorMessage}</FieldError>
				</FieldContent>
			</Field>
		);
	}

	if (fieldKey === "theme_preset") {
		const helperText = blueprintFieldHelperText(fieldKey, facts);

		return (
			<Field className="gap-2.5" data-invalid={errorMessage ? true : undefined}>
				<FieldLabel>{blueprintFieldLabel(fieldKey, facts)}</FieldLabel>
				<FieldContent>
					<BlueprintThemeConfigurator
						value={value}
						onChange={(nextValue) => onChange(fieldKey, nextValue)}
					/>
					{helperText ? (
						<FieldDescription>{helperText}</FieldDescription>
					) : null}
					<FieldError>{errorMessage}</FieldError>
				</FieldContent>
			</Field>
		);
	}

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
	const placeholder = blueprintFieldPlaceholder(fieldKey, facts) ?? undefined;
	const inputKind = blueprintFieldInputKind(fieldKey);
	const isArrayField = isBlueprintArrayField(fieldKey);
	const isShortField = fieldKey === "pricing";
	const handleChange = (
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => onChange(fieldKey, event.target.value);

	const isLinkListField = fieldKey === "design_references";

	const renderControl = () => {
		if (isLinkListField) {
			return (
				<BlueprintStageLinkListField
					fieldKey={fieldKey}
					inputId={inputId}
					value={value}
					onChange={onChange}
					errorId={errorId}
					errorMessage={errorMessage}
				/>
			);
		}
		if (isArrayField) {
			return (
				<BlueprintStageListField
					fieldKey={fieldKey}
					inputIdPrefix={inputId}
					value={value}
					onChange={onChange}
					errorId={errorId}
					errorMessage={errorMessage}
				/>
			);
		}
		if (inputKind === "textarea") {
			return (
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
			);
		}
		return (
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
		);
	};

	return (
		<Field className="gap-2.5" data-invalid={errorMessage ? true : undefined}>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<FieldLabel htmlFor={inputId}>
					{blueprintFieldLabel(fieldKey, facts)}
				</FieldLabel>
				{fieldKey === "problem_statement" ? (
					<BlueprintProblemStatementOptimizer
						stepId={step.id}
						facts={facts}
						draftValues={draftValues}
						onApplyOptimizedValue={(nextValue) => {
							onChange(fieldKey, nextValue);
						}}
					/>
				) : null}
			</div>
			<FieldContent>
				{renderControl()}
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
		previousProps.draftValues === nextProps.draftValues &&
		blueprintFieldLabel(previousProps.fieldKey, previousProps.facts) ===
			blueprintFieldLabel(nextProps.fieldKey, nextProps.facts) &&
		blueprintFieldHelperText(previousProps.fieldKey, previousProps.facts) ===
			blueprintFieldHelperText(nextProps.fieldKey, nextProps.facts),
);
