"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
	CanonicalProjectFactKey,
	PacketStepDefinition,
} from "@packet-compiler";
import type { PacketStepInlineFeedback } from "@/features/packet-flow/lib/packet-step-save-feedback";
import { PacketStageSaveFeedback } from "./packet-stage-save-feedback";
import { PacketStageField } from "./packet-stage-field";

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
	onSave,
}: {
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
	onSave: () => void;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					Step {currentStepIndex + 1} of {totalSteps}: {currentStep.label}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-5">
				{feedback ? <PacketStageSaveFeedback feedback={feedback} /> : null}
				{currentStep.fieldKeys.map((fieldKey) => (
					<PacketStageField
						key={fieldKey}
						fieldKey={fieldKey}
						stepId={currentStep.id}
						value={draftValues[fieldKey] ?? ""}
						errorMessage={fieldErrors[fieldKey]}
						isInvalid={Boolean(fieldErrors[fieldKey])}
						onChange={onChange}
					/>
				))}
				<div className="flex flex-wrap gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={onBack}
						disabled={!canGoBack || isSaving}
					>
						Back
					</Button>
					<Button type="button" onClick={onSave} disabled={isSaving}>
						{isSaving ? "Saving..." : "Save step"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
