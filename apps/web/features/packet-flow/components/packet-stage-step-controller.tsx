"use client";

import { useMutation } from "convex/react";
import type {
	CanonicalProjectFactsDraft,
	PacketStageDefinition,
	PacketStageStatus,
} from "@packet-compiler";
import { api } from "@/convex/_generated/api";
import { usePacketStageStepState } from "@/features/packet-flow/hooks/use-packet-stage-step-state";
import {
	getAdjacentPacketPageHrefs,
	getPacketStageStepIndex,
	type RoutedPacketStageId,
} from "@/features/packet-flow/lib/packet-stage-routes";
import { PacketStageStepCard } from "./packet-stage-step-card";

type PacketStageStepControllerProps = {
	stage: PacketStageDefinition;
	stageId: RoutedPacketStageId;
	stageStatus: PacketStageStatus;
	stepId: string;
	projectFacts: CanonicalProjectFactsDraft;
};

export function PacketStageStepController({
	stage,
	stageId,
	stageStatus,
	stepId,
	projectFacts,
}: PacketStageStepControllerProps) {
	const currentStepIndex = getPacketStageStepIndex(stageId, stepId);
	const { previousHref, nextHref } = getAdjacentPacketPageHrefs(
		stageId,
		stepId,
	);
	const saveProjectDefinitionFacts = useMutation(
		api.packet.saveProjectDefinitionFacts,
	);
	const {
		currentFeedback,
		currentFieldErrors,
		currentStep,
		currentDraftValues,
		goToPreviousStep,
		handleSaveAndContinue,
		handleSaveAndStay,
		handleFieldChange,
		isSaving,
	} = usePacketStageStepState({
		stage,
		stageId,
		stageStatus,
		stepId,
		previousHref,
		nextHref,
		projectFacts,
		saveProjectDefinitionFacts,
	});

	if (!currentStep) {
		return null;
	}

	return (
		<PacketStageStepCard
			currentStep={currentStep}
			currentStepIndex={currentStepIndex}
			totalSteps={stage.steps.length}
			canGoBack={Boolean(previousHref)}
			draftValues={currentDraftValues}
			fieldErrors={currentFieldErrors}
			feedback={currentFeedback}
			isSaving={isSaving}
			onBack={goToPreviousStep}
			onChange={handleFieldChange}
			onSaveAndContinue={handleSaveAndContinue}
			onSaveAndStay={handleSaveAndStay}
		/>
	);
}
