"use client";

import { memo, type ChangeEvent } from "react";
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
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
};

function PacketStageStepFieldComponent({
	fieldKey,
	facts,
	step,
	value,
	errorMessage,
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
		<Field className="gap-2" data-invalid={errorMessage ? true : undefined}>
			<FieldLabel htmlFor={inputId}>
				{packetFieldLabel(fieldKey, facts)}
			</FieldLabel>
			<FieldContent>
				{packetFieldInputKind(fieldKey) === "textarea" ? (
					<Textarea
						id={inputId}
						value={value}
						onChange={handleChange}
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
						aria-describedby={errorId}
						aria-invalid={errorMessage ? true : undefined}
					/>
				)}
				{helperText ? <FieldDescription>{helperText}</FieldDescription> : null}
				<FieldError id={errorId}>{errorMessage}</FieldError>
			</FieldContent>
		</Field>
	);
}

export const PacketStageStepField = memo(
	PacketStageStepFieldComponent,
	(previousProps, nextProps) =>
		previousProps.fieldKey === nextProps.fieldKey &&
		previousProps.step.id === nextProps.step.id &&
		previousProps.value === nextProps.value &&
		previousProps.errorMessage === nextProps.errorMessage &&
		packetFieldLabel(previousProps.fieldKey, previousProps.facts) ===
			packetFieldLabel(nextProps.fieldKey, nextProps.facts) &&
		packetFieldHelperText(previousProps.fieldKey, previousProps.facts) ===
			packetFieldHelperText(nextProps.fieldKey, nextProps.facts),
);
