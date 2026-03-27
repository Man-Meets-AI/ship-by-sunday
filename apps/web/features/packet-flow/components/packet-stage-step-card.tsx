"use client";

import type { ChangeEvent } from "react";
import type {
	CanonicalProjectFactKey,
	PacketStepDefinition,
} from "@packet-compiler";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	packetFieldInputKind,
	packetFieldLabel,
} from "@/features/packet-flow/lib/packet-field-helpers";
import type { PacketStepInlineFeedback } from "@/features/packet-flow/lib/packet-step-save-feedback";
import { getPacketStageFieldInputId } from "@/features/packet-flow/lib/packet-step-save-feedback";
import { PacketStageSaveFeedback } from "./packet-stage-save-feedback";

type PacketStageStepCardProps = {
	currentStep: PacketStepDefinition;
	currentStepIndex: number;
	totalSteps: number;
	canGoBack: boolean;
	draftValues: Record<string, string>;
	fieldErrors: Record<string, string>;
	feedback: PacketStepInlineFeedback | null;
	isSaving: boolean;
	onBack: () => void;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
	onSaveAndContinue: () => void;
};

function PacketStageStepField({
	fieldKey,
	stepId,
	initialValue,
	errorMessage,
	onChange,
}: {
	fieldKey: CanonicalProjectFactKey;
	stepId: string;
	initialValue: string;
	errorMessage?: string;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
}) {
	const kind = packetFieldInputKind(fieldKey);
	const inputId = getPacketStageFieldInputId(stepId, fieldKey);
	const errorId = errorMessage ? `${inputId}-error` : undefined;
	const handleChange = (
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => onChange(fieldKey, event.target.value);

	return (
		<Field data-invalid={errorMessage ? true : undefined}>
			<FieldLabel htmlFor={inputId}>{packetFieldLabel(fieldKey)}</FieldLabel>
			<FieldContent>
				{kind === "textarea" ? (
					<Textarea
						key={`${stepId}:${fieldKey}:${initialValue}`}
						id={inputId}
						defaultValue={initialValue}
						onChange={handleChange}
						rows={fieldKey === "section_narrative" ? 6 : 4}
						aria-describedby={errorId}
						aria-invalid={errorMessage ? true : undefined}
					/>
				) : (
					<Input
						key={`${stepId}:${fieldKey}:${initialValue}`}
						id={inputId}
						type={kind === "number" ? "number" : "text"}
						defaultValue={initialValue}
						onChange={handleChange}
						aria-describedby={errorId}
						aria-invalid={errorMessage ? true : undefined}
					/>
				)}
				<FieldError id={errorId}>{errorMessage}</FieldError>
			</FieldContent>
		</Field>
	);
}
export function PacketStageStepCard({
	currentStep,
	currentStepIndex,
	totalSteps,
	canGoBack,
	draftValues,
	fieldErrors,
	feedback,
	isSaving,
	onBack,
	onChange,
	onSaveAndContinue,
}: PacketStageStepCardProps) {
	return (
		<section className="space-y-6">
			<div className="max-w-3xl space-y-2">
				<p className="text-sm font-medium text-muted-foreground">
					Page {currentStepIndex + 1} of {totalSteps}
				</p>
				<h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-[2rem]">
					{currentStep.label}
				</h2>
			</div>
			{feedback ? <PacketStageSaveFeedback feedback={feedback} /> : null}
			<div className="space-y-6">
				{currentStep.fieldKeys.map((fieldKey) => (
					<PacketStageStepField
						key={fieldKey}
						fieldKey={fieldKey}
						stepId={currentStep.id}
						initialValue={draftValues[fieldKey] ?? ""}
						errorMessage={fieldErrors[fieldKey]}
						onChange={onChange}
					/>
				))}
			</div>
			<div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
				<Button
					type="button"
					variant="ghost"
					onClick={onBack}
					disabled={!canGoBack || isSaving}
					className="-ml-3 h-10 text-muted-foreground hover:text-foreground"
				>
					<ChevronLeft className="mr-2 h-4 w-4" />
					Back
				</Button>
				<div className="flex flex-col gap-3 sm:flex-row">
					<Button
						type="button"
						className="h-10 min-w-32"
						onClick={onSaveAndContinue}
						disabled={isSaving}
					>
						{isSaving ? "Saving..." : "Continue"}
					</Button>
				</div>
			</div>
		</section>
	);
}
