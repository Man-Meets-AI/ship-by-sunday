"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
	CanonicalProjectFactKey,
	PacketStepDefinition,
} from "@packet-compiler";
import { PacketStageField } from "./packet-stage-field";

export function PacketStageStepCard({
	currentStep,
	currentStepIndex,
	totalSteps,
	draftValues,
	isSaving,
	onBack,
	onChange,
	onSave,
}: {
	currentStep: PacketStepDefinition;
	currentStepIndex: number;
	totalSteps: number;
	draftValues: Record<string, string>;
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
				{currentStep.fieldKeys.map((fieldKey) => (
					<PacketStageField
						key={fieldKey}
						fieldKey={fieldKey}
						value={draftValues[fieldKey] ?? ""}
						onChange={onChange}
					/>
				))}
				<div className="flex flex-wrap gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={onBack}
						disabled={currentStepIndex === 0 || isSaving}
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
