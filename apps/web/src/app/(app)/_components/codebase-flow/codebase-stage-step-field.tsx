"use client";

import { memo } from "react";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
	CodebaseStepDefinition,
} from "@shipbysunday/codebase-compiler";
import { isCodebaseArrayField } from "@shipbysunday/codebase-compiler";
import { CodebaseStageArrayField } from "@/app/(app)/_components/codebase-flow/codebase-stage-array-field";
import { CodebaseStageDesignField } from "@/app/(app)/_components/codebase-flow/codebase-stage-design-field";
import { CodebaseStageScaleField } from "@/app/(app)/_components/codebase-flow/codebase-stage-scale-field";
import { CodebaseStageTextField } from "@/app/(app)/_components/codebase-flow/codebase-stage-text-field";
import { CodebaseStageThemeField } from "@/app/(app)/_components/codebase-flow/codebase-stage-theme-field";
import {
	getCodebaseFieldScaleDefinition,
	codebaseFieldHelperText,
	codebaseFieldLabel,
} from "@/lib/codebase-flow/codebase-field-helpers";

type CodebaseStageStepFieldProps = {
	fieldKey: CanonicalProjectFactKey;
	facts: CanonicalProjectFactsDraft;
	draftValues: Record<string, string>;
	step: CodebaseStepDefinition;
	value: string;
	errorMessage?: string;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
};

function CodebaseStageStepFieldComponent({
	fieldKey,
	facts,
	draftValues,
	step,
	value,
	errorMessage,
	onChange,
}: CodebaseStageStepFieldProps) {
	if (fieldKey === "design_preset_id") {
		return (
			<CodebaseStageDesignField
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
			<CodebaseStageThemeField
				errorMessage={errorMessage}
				facts={facts}
				fieldKey={fieldKey}
				onChange={onChange}
				value={value}
			/>
		);
	}

	if (getCodebaseFieldScaleDefinition(fieldKey)) {
		return (
			<CodebaseStageScaleField
				fieldKey={fieldKey}
				facts={facts}
				stepId={step.id}
				value={value}
				errorMessage={errorMessage}
				onChange={onChange}
			/>
		);
	}

	if (isCodebaseArrayField(fieldKey)) {
		return (
			<CodebaseStageArrayField
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
		<CodebaseStageTextField
			errorMessage={errorMessage}
			facts={facts}
			fieldKey={fieldKey}
			onChange={onChange}
			stepId={step.id}
			value={value}
		/>
	);
}

export const CodebaseStageStepField = memo(
	CodebaseStageStepFieldComponent,
	(previousProps, nextProps) =>
		previousProps.fieldKey === nextProps.fieldKey &&
		previousProps.step.id === nextProps.step.id &&
		previousProps.value === nextProps.value &&
		previousProps.errorMessage === nextProps.errorMessage &&
		previousProps.draftValues === nextProps.draftValues &&
		codebaseFieldLabel(previousProps.fieldKey, previousProps.facts) ===
			codebaseFieldLabel(nextProps.fieldKey, nextProps.facts) &&
		codebaseFieldHelperText(previousProps.fieldKey, previousProps.facts) ===
			codebaseFieldHelperText(nextProps.fieldKey, nextProps.facts),
);
