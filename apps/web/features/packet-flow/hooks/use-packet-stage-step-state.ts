"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
	PacketStageDefinition,
	PacketStageId,
	PacketStageStatus,
	PacketStepDefinition,
} from "@packet-compiler";
import {
	buildStageDraftValues,
	buildSavePayload,
} from "@/features/packet-flow/lib/packet-field-helpers";
import {
	buildPacketStepSaveErrorInlineFeedback,
	buildPacketStepSaveInlineFeedback,
	classifyPacketStepSave,
	getPacketStageFieldInputId,
	type PacketStepDraftValues,
	type PacketStepInlineFeedback,
	type PacketStepSavePayload,
	type PacketStepSaveState,
} from "@/features/packet-flow/lib/packet-step-save-feedback";
import { doesCompletingStepCompleteStage } from "@/features/packet-flow/lib/packet-stage-routes";

type SaveProjectDefinitionFactsArgs = {
	stageId: Exclude<PacketStageId, "start" | "review">;
} & PacketStepSavePayload;

type SaveProjectDefinitionFactsMutation = (
	args: SaveProjectDefinitionFactsArgs,
) => Promise<unknown>;

type StepStateRecord<T> = Record<string, T | undefined>;
type DraftValuesByStepId = Record<string, PacketStepDraftValues>;
type PacketStepSaveIntent = "continue" | "stay";

function removeStepEntry<T>(record: StepStateRecord<T>, stepId: string) {
	const nextRecord = { ...record };
	delete nextRecord[stepId];
	return nextRecord;
}

function upsertStepEntry<T>(
	record: StepStateRecord<T>,
	stepId: string,
	value: T,
) {
	return {
		...record,
		[stepId]: value,
	};
}

function arePacketStepDraftValuesEqual(
	left: PacketStepDraftValues,
	right: PacketStepDraftValues,
) {
	const leftKeys = Object.keys(left);
	const rightKeys = Object.keys(right);
	if (leftKeys.length !== rightKeys.length) {
		return false;
	}

	return leftKeys.every(
		(fieldKey) =>
			left[fieldKey as CanonicalProjectFactKey] ===
			right[fieldKey as CanonicalProjectFactKey],
	);
}

function areDraftValuesByStepIdEqual(
	left: DraftValuesByStepId,
	right: DraftValuesByStepId,
) {
	const leftKeys = Object.keys(left);
	const rightKeys = Object.keys(right);
	if (leftKeys.length !== rightKeys.length) {
		return false;
	}

	return leftKeys.every((stepKey) =>
		arePacketStepDraftValuesEqual(left[stepKey] ?? {}, right[stepKey] ?? {}),
	);
}

function focusFirstMissingField(
	step: PacketStepDefinition,
	fieldKey: CanonicalProjectFactKey | null,
) {
	if (!fieldKey) {
		return;
	}

	const input = document.getElementById(
		getPacketStageFieldInputId(step.id, fieldKey),
	) as HTMLInputElement | HTMLTextAreaElement | null;
	input?.scrollIntoView?.({ behavior: "smooth", block: "center" });
	input?.focus();
}

function buildFieldErrorByFieldKey(
	fieldKeys: CanonicalProjectFactKey[],
): Record<string, string> {
	return Object.fromEntries(
		fieldKeys.map((fieldKey) => [
			fieldKey,
			"Add an answer here before this page can complete.",
		]),
	);
}

export function usePacketStageStepState({
	stage,
	stageId,
	stageStatus,
	stepId,
	previousHref,
	nextHref,
	projectFacts,
	saveProjectDefinitionFacts,
}: {
	stage: PacketStageDefinition;
	stageId: Exclude<PacketStageId, "start" | "review">;
	stageStatus: PacketStageStatus;
	stepId: string;
	previousHref?: string;
	nextHref?: string;
	projectFacts: CanonicalProjectFactsDraft;
	saveProjectDefinitionFacts: SaveProjectDefinitionFactsMutation;
}) {
	const router = useRouter();
	const savedDraftValuesByStepId = useMemo<DraftValuesByStepId>(
		() => buildStageDraftValues(projectFacts, stage),
		[projectFacts, stage],
	);
	const [draftValuesByStepId, setDraftValuesByStepId] =
		useState<DraftValuesByStepId>(savedDraftValuesByStepId);
	const [validationStateByStepId, setValidationStateByStepId] = useState<
		StepStateRecord<PacketStepSaveState>
	>({});
	const [invalidFieldKeysByStepId, setInvalidFieldKeysByStepId] = useState<
		StepStateRecord<CanonicalProjectFactKey[]>
	>({});
	const [saveErrorByStepId, setSaveErrorByStepId] = useState<
		StepStateRecord<boolean>
	>({});
	const [successStepId, setSuccessStepId] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		setDraftValuesByStepId((current) =>
			areDraftValuesByStepIdEqual(current, savedDraftValuesByStepId)
				? current
				: savedDraftValuesByStepId,
		);
	}, [savedDraftValuesByStepId]);

	useEffect(() => {
		setSuccessStepId(null);
	}, [stepId]);

	const currentStep = stage.steps.find((step) => step.id === stepId);
	if (!currentStep) {
		throw new Error(`Missing step ${stepId} for stage ${stageId}`);
	}
	const currentDraftValues = currentStep
		? (draftValuesByStepId[currentStep.id] ?? {})
		: {};
	const currentSavedValues = currentStep
		? (savedDraftValuesByStepId[currentStep.id] ?? {})
		: {};
	const currentInvalidFieldKeys = currentStep
		? (invalidFieldKeysByStepId[currentStep.id] ?? [])
		: [];
	const currentValidationState = currentStep
		? validationStateByStepId[currentStep.id]
		: undefined;
	const currentFeedback: PacketStepInlineFeedback | null = (() => {
		if (!currentStep) {
			return null;
		}
		if (saveErrorByStepId[currentStep.id]) {
			return buildPacketStepSaveErrorInlineFeedback();
		}
		if (successStepId === currentStep.id) {
			return buildPacketStepSaveInlineFeedback(currentStep.label, {
				state: "complete",
				missingRequiredFieldKeys: [],
			});
		}
		if (!currentValidationState) {
			return null;
		}

		return buildPacketStepSaveInlineFeedback(currentStep.label, {
			state: currentValidationState,
			missingRequiredFieldKeys: currentInvalidFieldKeys,
		});
	})();
	const currentFieldErrors = buildFieldErrorByFieldKey(currentInvalidFieldKeys);

	function handleFieldChange(
		fieldKey: CanonicalProjectFactKey,
		nextValue: string,
	) {
		if (!currentStep) {
			return;
		}

		setSuccessStepId(null);
		const nextDraftValues: PacketStepDraftValues = {
			...currentDraftValues,
			[fieldKey]: nextValue,
		};
		setDraftValuesByStepId((current) => ({
			...current,
			[currentStep.id]: nextDraftValues,
		}));

		if (saveErrorByStepId[currentStep.id]) {
			return;
		}

		const hadValidationFeedback =
			Boolean(currentValidationState) || currentInvalidFieldKeys.length > 0;
		if (!hadValidationFeedback) {
			return;
		}

		const nextClassification = classifyPacketStepSave(
			currentStep,
			nextDraftValues,
			currentSavedValues,
			buildSavePayload(currentStep, nextDraftValues),
		);
		if (nextClassification.state === "complete") {
			setValidationStateByStepId((current) =>
				removeStepEntry(current, currentStep.id),
			);
			setInvalidFieldKeysByStepId((current) =>
				removeStepEntry(current, currentStep.id),
			);
			return;
		}

		setValidationStateByStepId((current) =>
			upsertStepEntry(current, currentStep.id, nextClassification.state),
		);
		setInvalidFieldKeysByStepId((current) =>
			upsertStepEntry(
				current,
				currentStep.id,
				nextClassification.missingRequiredFieldKeys,
			),
		);
	}

	function handleSaveAndContinue() {
		void saveCurrentStep("continue");
	}

	function handleSaveAndStay() {
		void saveCurrentStep("stay");
	}

	async function saveCurrentStep(saveIntent: PacketStepSaveIntent) {
		if (!currentStep) {
			return;
		}

		setSuccessStepId(null);
		setSaveErrorByStepId((current) => removeStepEntry(current, currentStep.id));

		const saveClassification = classifyPacketStepSave(
			currentStep,
			currentDraftValues,
			currentSavedValues,
			buildSavePayload(currentStep, currentDraftValues),
		);
		if (saveClassification.state === "blank") {
			setValidationStateByStepId((current) =>
				upsertStepEntry(current, currentStep.id, saveClassification.state),
			);
			setInvalidFieldKeysByStepId((current) =>
				upsertStepEntry(
					current,
					currentStep.id,
					saveClassification.missingRequiredFieldKeys,
				),
			);
			focusFirstMissingField(
				currentStep,
				saveClassification.firstMissingRequiredFieldKey,
			);
			return;
		}

		setIsSaving(true);
		try {
			await saveProjectDefinitionFacts({
				stageId,
				...buildSavePayload(currentStep, currentDraftValues),
			});
		} catch {
			setSaveErrorByStepId((current) =>
				upsertStepEntry(current, currentStep.id, true),
			);
			return;
		} finally {
			setIsSaving(false);
		}

		if (saveClassification.state === "complete") {
			setValidationStateByStepId((current) =>
				removeStepEntry(current, currentStep.id),
			);
			setInvalidFieldKeysByStepId((current) =>
				removeStepEntry(current, currentStep.id),
			);
			setSuccessStepId(currentStep.id);
			if (
				saveIntent === "continue" &&
				nextHref &&
				(currentStep.id !== stage.steps.at(-1)?.id ||
					doesCompletingStepCompleteStage(stageStatus, currentStep))
			) {
				router.push(nextHref);
			}
			return;
		}

		setValidationStateByStepId((current) =>
			upsertStepEntry(current, currentStep.id, saveClassification.state),
		);
		setInvalidFieldKeysByStepId((current) =>
			upsertStepEntry(
				current,
				currentStep.id,
				saveClassification.missingRequiredFieldKeys,
			),
		);
		focusFirstMissingField(
			currentStep,
			saveClassification.firstMissingRequiredFieldKey,
		);
	}

	return {
		currentFeedback,
		currentFieldErrors,
		currentStep,
		currentDraftValues,
		handleSaveAndContinue,
		handleSaveAndStay,
		handleFieldChange,
		isSaving,
		goToPreviousStep: () => {
			if (previousHref) {
				router.push(previousHref);
			}
		},
	};
}
