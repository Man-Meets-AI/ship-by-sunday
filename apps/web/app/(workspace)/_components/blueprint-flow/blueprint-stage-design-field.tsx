"use client";

import dynamic from "next/dynamic";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/blueprint-compiler";
import {
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlueprintDesignPresetFieldProps } from "@/app/(workspace)/_components/blueprint-flow/blueprint-design-preset-field";
import {
	blueprintFieldHelperText,
	blueprintFieldLabel,
} from "@/lib/blueprint-flow/blueprint-field-helpers";
import { getBlueprintStageFieldInputId } from "@/lib/blueprint-flow/blueprint-step-save-feedback";

const BlueprintDesignPresetField = dynamic<BlueprintDesignPresetFieldProps>(
	() =>
		import("@/app/(workspace)/_components/blueprint-flow/blueprint-design-preset-field").then(
			(module) => module.BlueprintDesignPresetField,
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

export function BlueprintStageDesignField({
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
	const inputId = getBlueprintStageFieldInputId(stepId, fieldKey);
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
