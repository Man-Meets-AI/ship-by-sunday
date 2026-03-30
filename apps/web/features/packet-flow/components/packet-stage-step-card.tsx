"use client";

import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
	PacketStepDefinition,
} from "@packet-compiler";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import type { PacketStepInlineFeedback } from "@/features/packet-flow/lib/packet-step-save-feedback";
import { PacketStageSaveFeedback } from "./packet-stage-save-feedback";
import { PacketStageStepField } from "./packet-stage-step-field";

type PacketStageStepCardProps = {
	currentStep: PacketStepDefinition;
	stepHeading: string;
	currentStepIndex: number;
	totalSteps: number;
	canGoBack: boolean;
	draftValues: Record<string, string>;
	facts: CanonicalProjectFactsDraft;
	fieldErrors: Record<string, string>;
	feedback: PacketStepInlineFeedback | null;
	isSaving: boolean;
	onBack: () => void;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
	onSaveAndContinue: () => void;
};

export function PacketStageStepCard({
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
}: PacketStageStepCardProps) {
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
			{feedback ? <PacketStageSaveFeedback feedback={feedback} /> : null}
			<div className="space-y-6">
				{currentStep.fieldKeys.map((fieldKey) => (
					<PacketStageStepField
						key={fieldKey}
						fieldKey={fieldKey}
						facts={facts}
						step={currentStep}
						value={draftValues[fieldKey] ?? ""}
						errorMessage={fieldErrors[fieldKey]}
						isSaving={isSaving}
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
