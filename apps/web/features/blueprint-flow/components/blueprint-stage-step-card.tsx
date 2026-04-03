"use client";

import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
	BlueprintStepDefinition,
} from "@blueprint-compiler";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import type { BlueprintStepInlineFeedback } from "@/features/blueprint-flow/lib/blueprint-step-save-feedback";
import { BlueprintStageSaveFeedback } from "./blueprint-stage-save-feedback";
import { BlueprintStageStepField } from "./blueprint-stage-step-field";

type BlueprintStageStepCardProps = {
	currentStep: BlueprintStepDefinition;
	stepHeading: string;
	currentStepIndex: number;
	totalSteps: number;
	canGoBack: boolean;
	draftValues: Record<string, string>;
	facts: CanonicalProjectFactsDraft;
	fieldErrors: Record<string, string>;
	feedback: BlueprintStepInlineFeedback | null;
	isSaving: boolean;
	onBack: () => void;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
	onSaveAndContinue: () => void;
};

export function BlueprintStageStepCard({
	currentStep,
	stepHeading,
	currentStepIndex,
	totalSteps,
	canGoBack,
	draftValues,
	facts,
	fieldErrors,
	feedback,
	isSaving,
	onBack,
	onChange,
	onSaveAndContinue,
}: BlueprintStageStepCardProps) {
	useKeyboardShortcut("Enter", onSaveAndContinue, {
		ctrlOrMeta: true,
		disabled: isSaving,
	});

	return (
		<section className="space-y-6">
			<div className="max-w-3xl space-y-2">
				<p className="text-sm font-medium text-muted-foreground">
					Page {currentStepIndex + 1} of {totalSteps}
				</p>
				<h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-[2rem]">
					{stepHeading}
				</h2>
			</div>
			<div aria-live="polite" className={feedback ? undefined : "min-h-12"}>
				{feedback ? <BlueprintStageSaveFeedback feedback={feedback} /> : null}
			</div>
			<FieldGroup className="gap-6">
				{currentStep.fieldKeys.map((fieldKey) => (
					<BlueprintStageStepField
						key={fieldKey}
						fieldKey={fieldKey}
						facts={facts}
						step={currentStep}
						value={draftValues[fieldKey] ?? ""}
						errorMessage={fieldErrors[fieldKey]}
						onChange={onChange}
					/>
				))}
			</FieldGroup>
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
						className="h-10 min-w-40"
						onClick={onSaveAndContinue}
						disabled={isSaving}
					>
						{isSaving ? "Saving..." : "Continue"}
						{!isSaving && (
							<KbdGroup className="ml-2">
								<Kbd className="bg-primary-foreground/10 text-primary-foreground">
									⌘
								</Kbd>
								<Kbd className="bg-primary-foreground/10 text-primary-foreground">
									↵
								</Kbd>
							</KbdGroup>
						)}
					</Button>
				</div>
			</div>
		</section>
	);
}
