"use client";

import { memo } from "react";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
	BlueprintStepDefinition,
} from "@shipbysunday/blueprint-compiler";
import { isBlueprintArrayField } from "@shipbysunday/blueprint-compiler";
import { BlueprintStageArrayField } from "@/app/(workspace)/_components/blueprint-flow/blueprint-stage-array-field";
import { BlueprintStageDesignField } from "@/app/(workspace)/_components/blueprint-flow/blueprint-stage-design-field";
import { BlueprintStageScaleField } from "@/app/(workspace)/_components/blueprint-flow/blueprint-stage-scale-field";
import { BlueprintStageTextField } from "@/app/(workspace)/_components/blueprint-flow/blueprint-stage-text-field";
import { BlueprintStageThemeField } from "@/app/(workspace)/_components/blueprint-flow/blueprint-stage-theme-field";
import {
	getBlueprintFieldScaleDefinition,
	blueprintFieldHelperText,
	blueprintFieldLabel,
} from "@/lib/blueprint-flow/blueprint-field-helpers";

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
		return (
			<BlueprintStageDesignField
				draftValues={draftValues}
				errorMessage={errorMessage}
				facts={facts}
				fieldKey={fieldKey}
				onChange={onChange}
				stepId={step.id}
				value={value}
			/>
		);
	}

	if (fieldKey === "theme_preset") {
		return (
			<BlueprintStageThemeField
				errorMessage={errorMessage}
				facts={facts}
				fieldKey={fieldKey}
				onChange={onChange}
				value={value}
			/>
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

	if (isBlueprintArrayField(fieldKey)) {
		return (
			<BlueprintStageArrayField
				errorMessage={errorMessage}
				facts={facts}
				fieldKey={fieldKey}
				isLinkList={fieldKey === "design_references"}
				onChange={onChange}
				stepId={step.id}
				value={value}
			/>
		);
	}

	return (
		<BlueprintStageTextField
			errorMessage={errorMessage}
			facts={facts}
			fieldKey={fieldKey}
			onChange={onChange}
			stepId={step.id}
			value={value}
		/>
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
