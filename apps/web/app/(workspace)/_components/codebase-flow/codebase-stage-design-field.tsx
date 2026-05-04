"use client";

import dynamic from "next/dynamic";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/codebase-compiler";
import {
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import type { CodebaseDesignPresetFieldProps } from "@/app/(workspace)/_components/codebase-flow/codebase-design-preset-field";
import {
	codebaseFieldHelperText,
	codebaseFieldLabel,
} from "@/lib/codebase-flow/codebase-field-helpers";
import { getCodebaseStageFieldInputId } from "@/lib/codebase-flow/codebase-step-save-feedback";

const CodebaseDesignPresetField = dynamic<CodebaseDesignPresetFieldProps>(
	() =>
		import("@/app/(workspace)/_components/codebase-flow/codebase-design-preset-field").then(
			(module) => module.CodebaseDesignPresetField,
		),
	{ loading: DesignPresetFieldSkeleton },
);

function DesignPresetFieldSkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-16 w-full rounded-xl" />
			<Skeleton className="h-40 w-full rounded-xl" />
		</div>
	);
}

export function CodebaseStageDesignField({
	draftValues,
	errorMessage,
	facts,
	fieldKey,
	onChange,
	stepId,
	value,
}: {
	draftValues: Record<string, string>;
	errorMessage?: string;
	facts: CanonicalProjectFactsDraft;
	fieldKey: CanonicalProjectFactKey;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
	stepId: string;
	value: string;
}) {
	const inputId = getCodebaseStageFieldInputId(stepId, fieldKey);
	const errorId = errorMessage ? `${inputId}-error` : undefined;
	const label = codebaseFieldLabel(fieldKey, facts);
	const helperText = codebaseFieldHelperText(fieldKey, facts);

	return (
		<Field className="gap-2.5" data-invalid={errorMessage ? true : undefined}>
			<FieldLabel htmlFor={inputId}>{label}</FieldLabel>
			<FieldContent>
				<CodebaseDesignPresetField
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
