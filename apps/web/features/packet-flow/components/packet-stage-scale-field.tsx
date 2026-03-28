"use client";

import { useId } from "react";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@packet-compiler";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldTitle,
} from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
	getPacketFieldScaleDefinition,
	packetFieldHelperText,
	packetFieldLabel,
} from "@/features/packet-flow/lib/packet-field-helpers";
import {
	getPacketStageFieldControlId,
	getPacketStageFieldInputId,
} from "@/features/packet-flow/lib/packet-step-save-feedback";

type PacketStageScaleFieldProps = {
	fieldKey: CanonicalProjectFactKey;
	facts: CanonicalProjectFactsDraft;
	stepId: string;
	value: string;
	errorMessage?: string;
	isSaving: boolean;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
};

export function PacketStageScaleField({
	fieldKey,
	facts,
	stepId,
	value,
	errorMessage,
	isSaving,
	onChange,
}: PacketStageScaleFieldProps) {
	const scaleDefinition = getPacketFieldScaleDefinition(fieldKey);
	if (!scaleDefinition) {
		throw new Error(`Missing scale definition for ${fieldKey}`);
	}

	const titleId = useId();
	const inputId = getPacketStageFieldInputId(stepId, fieldKey);
	const controlId = getPacketStageFieldControlId(stepId, fieldKey);
	const errorId = errorMessage ? `${inputId}-error` : undefined;
	const helperText = packetFieldHelperText(fieldKey, facts);

	return (
		<Field data-invalid={errorMessage ? true : undefined}>
			<FieldContent>
				<FieldTitle id={titleId}>
					{packetFieldLabel(fieldKey, facts)}
				</FieldTitle>
				{helperText ? <FieldDescription>{helperText}</FieldDescription> : null}
				<div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 text-xs text-muted-foreground">
					<span>{scaleDefinition.leftLabel}</span>
					<span className="text-center">{scaleDefinition.centerLabel}</span>
					<span className="text-right">{scaleDefinition.rightLabel}</span>
				</div>
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
					disabled={isSaving}
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
							className="min-w-0 flex-1 px-0 font-medium tabular-nums"
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
				<FieldError id={errorId}>{errorMessage}</FieldError>
			</FieldContent>
		</Field>
	);
}
