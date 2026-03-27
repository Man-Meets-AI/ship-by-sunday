"use client";

import type {
	CanonicalProjectFactKey,
	PacketStepDefinition,
} from "@packet-compiler";
import { Button } from "@/components/ui/button";
import type { PacketStepInlineFeedback } from "@/features/packet-flow/lib/packet-step-save-feedback";
import { PacketStageField } from "./packet-stage-field";
import { PacketStageSaveFeedback } from "./packet-stage-save-feedback";

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
	onSaveAndStay,
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
	onSaveAndContinue: () => void;
	onSaveAndStay: () => void;
}) {
	return (
		<section className="space-y-6 rounded-[30px] border border-border/60 bg-background p-6 sm:p-8">
			<div className="max-w-3xl space-y-2">
				<p className="text-sm font-medium text-muted-foreground">
					Page {currentStepIndex + 1} of {totalSteps}
				</p>
				<h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-[2rem]">
					{currentStep.label}
				</h2>
			</div>
			{feedback ? <PacketStageSaveFeedback feedback={feedback} /> : null}
			<div className="space-y-5">
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
			</div>
			<div className="flex flex-col gap-4 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
				<Button
					type="button"
					variant="ghost"
					onClick={onBack}
					disabled={!canGoBack || isSaving}
					className="justify-start px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
				>
					Back
				</Button>
				<div className="flex flex-col gap-3 sm:flex-row">
					<Button
						type="button"
						variant="outline"
						onClick={onSaveAndStay}
						disabled={isSaving}
					>
						Save and stay
					</Button>
					<Button type="button" onClick={onSaveAndContinue} disabled={isSaving}>
						{isSaving ? "Saving..." : "Save and continue"}
					</Button>
				</div>
			</div>
		</section>
	);
}
