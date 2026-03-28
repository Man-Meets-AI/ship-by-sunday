"use client";

import type { ChangeEvent } from "react";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
	PacketStepDefinition,
} from "@packet-compiler";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	getPacketFieldScaleDefinition,
	packetFieldHelperText,
	packetFieldInputKind,
	packetFieldLabel,
} from "@/features/packet-flow/lib/packet-field-helpers";
import { getPacketStageFieldInputId } from "@/features/packet-flow/lib/packet-step-save-feedback";
import { PacketStageScaleField } from "./packet-stage-scale-field";

type PacketStageStepFieldProps = {
	fieldKey: CanonicalProjectFactKey;
	facts: CanonicalProjectFactsDraft;
	step: PacketStepDefinition;
	value: string;
	errorMessage?: string;
	isSaving: boolean;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
};

export function PacketStageStepField({
	fieldKey,
	facts,
	step,
	value,
	errorMessage,
	isSaving,
	onChange,
}: PacketStageStepFieldProps) {
	if (getPacketFieldScaleDefinition(fieldKey)) {
		return (
			<PacketStageScaleField
				fieldKey={fieldKey}
				facts={facts}
				stepId={step.id}
				value={value}
				errorMessage={errorMessage}
				isSaving={isSaving}
				onChange={onChange}
			/>
		);
	}

	const inputId = getPacketStageFieldInputId(step.id, fieldKey);
	const errorId = errorMessage ? `${inputId}-error` : undefined;
	const helperText = packetFieldHelperText(fieldKey, facts);
	const handleChange = (
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => onChange(fieldKey, event.target.value);

	return (
		<Field data-invalid={errorMessage ? true : undefined}>
			<FieldLabel htmlFor={inputId}>
				{packetFieldLabel(fieldKey, facts)}
			</FieldLabel>
			<FieldContent>
				{helperText ? <FieldDescription>{helperText}</FieldDescription> : null}
				{packetFieldInputKind(fieldKey) === "textarea" ? (
					<Textarea
						id={inputId}
						value={value}
						onChange={handleChange}
						disabled={isSaving}
						rows={fieldKey === "section_narrative" ? 6 : 4}
						aria-describedby={errorId}
						aria-invalid={errorMessage ? true : undefined}
					/>
				) : (
					<Input
						id={inputId}
						type={
							packetFieldInputKind(fieldKey) === "number" ? "number" : "text"
						}
						value={value}
						onChange={handleChange}
						disabled={isSaving}
						aria-describedby={errorId}
						aria-invalid={errorMessage ? true : undefined}
					/>
				)}
				<FieldError id={errorId}>{errorMessage}</FieldError>
			</FieldContent>
		</Field>
	);
}
