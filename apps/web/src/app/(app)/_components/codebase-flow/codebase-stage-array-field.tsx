"use client";

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
import { CodebaseFieldErrorRegion } from "@/app/(app)/_components/codebase-flow/codebase-field-error-region";
import { CodebaseStageLinkListField } from "@/app/(app)/_components/codebase-flow/codebase-stage-link-list-field";
import { CodebaseStageListField } from "@/app/(app)/_components/codebase-flow/codebase-stage-list-field";
import {
	codebaseFieldHelperText,
	codebaseFieldLabel,
} from "@/lib/codebase-flow/codebase-field-helpers";
import { getCodebaseStageFieldInputId } from "@/lib/codebase-flow/codebase-step-save-feedback";

export function CodebaseStageArrayField({
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
	const inputId = getCodebaseStageFieldInputId(stepId, fieldKey);
	const errorId = errorMessage ? `${inputId}-error` : undefined;
	const helperText = codebaseFieldHelperText(fieldKey, facts);

	return (
		<Field className="gap-2.5" data-invalid={errorMessage ? true : undefined}>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<FieldLabel htmlFor={inputId}>
					{codebaseFieldLabel(fieldKey, facts)}
				</FieldLabel>
			</div>
			<FieldContent>
				{isLinkList ? (
					<CodebaseStageLinkListField
						fieldKey={fieldKey}
						inputId={inputId}
						value={value}
						onChange={onChange}
						errorId={errorId}
						errorMessage={errorMessage}
					/>
				) : (
					<CodebaseStageListField
						fieldKey={fieldKey}
						inputIdPrefix={inputId}
						value={value}
						onChange={onChange}
						errorId={errorId}
						errorMessage={errorMessage}
					/>
				)}
				{helperText ? <FieldDescription>{helperText}</FieldDescription> : null}
				<CodebaseFieldErrorRegion
					errorId={errorId}
					errorMessage={errorMessage}
				/>
			</FieldContent>
		</Field>
	);
}
