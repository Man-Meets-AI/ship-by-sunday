"use client";

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
import { BlueprintFieldErrorRegion } from "@/app/(workspace)/_components/blueprint-flow/blueprint-field-error-region";
import { BlueprintStageLinkListField } from "@/app/(workspace)/_components/blueprint-flow/blueprint-stage-link-list-field";
import { BlueprintStageListField } from "@/app/(workspace)/_components/blueprint-flow/blueprint-stage-list-field";
import {
	blueprintFieldHelperText,
	blueprintFieldLabel,
} from "@/lib/blueprint-flow/blueprint-field-helpers";
import { getBlueprintStageFieldInputId } from "@/lib/blueprint-flow/blueprint-step-save-feedback";

export function BlueprintStageArrayField({
	errorMessage,
	facts,
	fieldKey,
	isLinkList,
	onChange,
	stepId,
	value,
}: {
	errorMessage?: string;
	facts: CanonicalProjectFactsDraft;
	fieldKey: CanonicalProjectFactKey;
	isLinkList: boolean;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
	stepId: string;
	value: string;
}) {
	const inputId = getBlueprintStageFieldInputId(stepId, fieldKey);
	const errorId = errorMessage ? `${inputId}-error` : undefined;
	const helperText = blueprintFieldHelperText(fieldKey, facts);

	return (
		<Field className="gap-2.5" data-invalid={errorMessage ? true : undefined}>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<FieldLabel htmlFor={inputId}>
					{blueprintFieldLabel(fieldKey, facts)}
				</FieldLabel>
			</div>
			<FieldContent>
				{isLinkList ? (
					<BlueprintStageLinkListField
						fieldKey={fieldKey}
						inputId={inputId}
						value={value}
						onChange={onChange}
						errorId={errorId}
						errorMessage={errorMessage}
					/>
				) : (
					<BlueprintStageListField
						fieldKey={fieldKey}
						inputIdPrefix={inputId}
						value={value}
						onChange={onChange}
						errorId={errorId}
						errorMessage={errorMessage}
					/>
				)}
				{helperText ? <FieldDescription>{helperText}</FieldDescription> : null}
				<BlueprintFieldErrorRegion
					errorId={errorId}
					errorMessage={errorMessage}
				/>
			</FieldContent>
		</Field>
	);
}
