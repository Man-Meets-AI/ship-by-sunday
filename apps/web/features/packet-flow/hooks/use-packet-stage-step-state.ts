"use client";

import type { OptimisticLocalStore } from "convex/browser";
import type { ReactMutation } from "convex/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
	createCanonicalProjectDefinitionDraft,
	deriveStageStatus,
	parseCanonicalProjectFactsDraft,
	placeholderFriendlyFactKeys,
} from "@packet-compiler";
import { PRODUCT_APP_ID } from "@/config/product";
import { api } from "@/convex/_generated/api";
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
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import { useAutosave } from "@/features/shared/hooks/use-autosave";

type SaveProjectDefinitionFactsArgs = {
	stageId: Exclude<PacketStageId, "start" | "review">;
} & PacketStepSavePayload;

type SaveProjectDefinitionFactsMutation = ReactMutation<
	typeof api.packet.saveProjectDefinitionFacts
>;

type StepStateRecord<T> = Record<string, T | undefined>;
type DraftValuesByStepId = Record<string, PacketStepDraftValues>;

const EMPTY_PACKET_STEP_DRAFT_VALUES: PacketStepDraftValues = {};
const EMPTY_INVALID_FIELD_KEYS: CanonicalProjectFactKey[] = [];
const OPTIMISTIC_PACKET_CLERK_USER_ID = "optimistic-local-user";

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

function buildPlaceholdersInUse(facts: CanonicalProjectFactsDraft) {
	return placeholderFriendlyFactKeys.filter(
		(fieldKey) => facts[fieldKey] === undefined,
	);
}

function readPacketStepDraftValuesFromDom(
	step: PacketStepDefinition,
	fallbackDraftValues: PacketStepDraftValues,
) {
	return Object.fromEntries(
		step.fieldKeys.map((fieldKey) => {
			const input = document.getElementById(
				getPacketStageFieldInputId(step.id, fieldKey),
			) as HTMLInputElement | HTMLTextAreaElement | null;

			return [fieldKey, input?.value ?? fallbackDraftValues[fieldKey] ?? ""];
		}),
	) as PacketStepDraftValues;
}

function buildNextProjectFacts(
	currentFacts: CanonicalProjectFactsDraft,
	args: SaveProjectDefinitionFactsArgs,
) {
	const nextFactsSource = { ...currentFacts };
	for (const fieldKey of args.clearedFieldKeys) {
		delete nextFactsSource[fieldKey as keyof typeof nextFactsSource];
	}

	return parseCanonicalProjectFactsDraft({
		...nextFactsSource,
		...args.factsPatch,
	});
}

function buildOptimisticPacketWorkspaceState(
	currentWorkspaceState: PacketWorkspaceState,
	args: SaveProjectDefinitionFactsArgs,
): PacketWorkspaceState {
	const nextFacts = buildNextProjectFacts(
		currentWorkspaceState.projectDefinition?.facts ?? {},
		args,
	);
	const nextStageStatus = deriveStageStatus(nextFacts);
	const now = Date.now();
	const currentProjectDefinition = currentWorkspaceState.projectDefinition;
	const nextProjectDefinition = currentProjectDefinition
		? {
				...currentProjectDefinition,
				facts: nextFacts,
				placeholdersInUse: buildPlaceholdersInUse(nextFacts),
				updatedAt: now,
			}
		: createCanonicalProjectDefinitionDraft({
				clerkUserId:
					currentWorkspaceState.workflowState?.clerkUserId ??
					OPTIMISTIC_PACKET_CLERK_USER_ID,
				productKey: PRODUCT_APP_ID,
				facts: nextFacts,
				placeholdersInUse: buildPlaceholdersInUse(nextFacts),
				createdAt: now,
				updatedAt: now,
			});

	return {
		...currentWorkspaceState,
		projectDefinition: nextProjectDefinition,
		firstIncompleteStageId: nextStageStatus.firstIncompleteStageId,
		packetReadiness: nextStageStatus.packetReadiness,
		stageStatuses: nextStageStatus.stageStatuses,
	};
}

function applyOptimisticPacketWorkspaceUpdate(
	localStore: OptimisticLocalStore,
	args: SaveProjectDefinitionFactsArgs,
) {
	const currentWorkspaceState = localStore.getQuery(
		api.packet.getPacketWorkspaceState,
		{},
	);
	if (!currentWorkspaceState) {
		return;
	}

	localStore.setQuery(
		api.packet.getPacketWorkspaceState,
		{},
		buildOptimisticPacketWorkspaceState(currentWorkspaceState, args),
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

function requirePacketStep(
	stage: PacketStageDefinition,
	stageId: Exclude<PacketStageId, "start" | "review">,
	stepId: string,
) {
	const step = stage.steps.find((candidate) => candidate.id === stepId);
	if (!step) {
		throw new Error(`Missing step ${stepId} for stage ${stageId}`);
	}

	return step;
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
	const saveProjectDefinitionFactsWithOptimism = useMemo(
		() =>
			saveProjectDefinitionFacts.withOptimisticUpdate((localStore, args) => {
				applyOptimisticPacketWorkspaceUpdate(localStore, args);
			}),
		[saveProjectDefinitionFacts],
	);
	const lastCommittedDraftValuesByStepIdRef = useRef<DraftValuesByStepId>(
		savedDraftValuesByStepId,
	);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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
		if (!hasUnsavedChanges) {
			lastCommittedDraftValuesByStepIdRef.current = savedDraftValuesByStepId;
		}
	}, [hasUnsavedChanges, savedDraftValuesByStepId]);

	useEffect(() => {
		setHasUnsavedChanges(false);
		setSuccessStepId(null);
	}, [stepId]);

	const currentStep = requirePacketStep(stage, stageId, stepId);

	const committedDraftValuesByStepId = hasUnsavedChanges
		? lastCommittedDraftValuesByStepIdRef.current
		: savedDraftValuesByStepId;
	const currentDraftValues =
		committedDraftValuesByStepId[currentStep.id] ??
		EMPTY_PACKET_STEP_DRAFT_VALUES;
	const currentSavedValues =
		savedDraftValuesByStepId[currentStep.id] ?? EMPTY_PACKET_STEP_DRAFT_VALUES;
	const currentInvalidFieldKeys =
		invalidFieldKeysByStepId[currentStep.id] ?? EMPTY_INVALID_FIELD_KEYS;
	const currentValidationState = validationStateByStepId[currentStep.id];
	const readCurrentDraftValues = useCallback(
		() => readPacketStepDraftValuesFromDom(currentStep, currentDraftValues),
		[currentDraftValues, currentStep],
	);

	const saveCurrentStep = useCallback(async (): Promise<boolean> => {
		const submittedDraftValues = readCurrentDraftValues();
		const savePayload = buildSavePayload(currentStep, submittedDraftValues);

		setSuccessStepId(null);
		setSaveErrorByStepId((current) => removeStepEntry(current, currentStep.id));

		const saveClassification = classifyPacketStepSave(
			currentStep,
			submittedDraftValues,
			currentSavedValues,
			savePayload,
		);

		setIsSaving(true);
		try {
			await saveProjectDefinitionFactsWithOptimism({
				stageId,
				...savePayload,
			});
		} catch {
			setSaveErrorByStepId((current) =>
				upsertStepEntry(current, currentStep.id, true),
			);
			return false;
		} finally {
			setIsSaving(false);
		}

		const latestDraftValues = readCurrentDraftValues();
		setHasUnsavedChanges(
			!arePacketStepDraftValuesEqual(latestDraftValues, submittedDraftValues),
		);

		if (saveClassification.state === "complete") {
			setValidationStateByStepId((current) =>
				removeStepEntry(current, currentStep.id),
			);
			setInvalidFieldKeysByStepId((current) =>
				removeStepEntry(current, currentStep.id),
			);
			setSuccessStepId(currentStep.id);
		} else {
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
		}

		return true;
	}, [
		currentSavedValues,
		currentStep,
		readCurrentDraftValues,
		saveProjectDefinitionFactsWithOptimism,
		stageId,
	]);

	useAutosave({
		shouldAutosave:
			hasUnsavedChanges && !isSaving && !saveErrorByStepId[currentStep.id],
		delayMs: 1000,
		onAutosave: async () => {
			await saveCurrentStep();
		},
	});

	const currentFeedback: PacketStepInlineFeedback | null = (() => {
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
		if (saveErrorByStepId[currentStep.id]) {
			setSaveErrorByStepId((current) =>
				removeStepEntry(current, currentStep.id),
			);
		}

		const nextDraftValues: PacketStepDraftValues = {
			...readCurrentDraftValues(),
			[fieldKey]: nextValue,
		};

		setHasUnsavedChanges(
			!arePacketStepDraftValuesEqual(nextDraftValues, currentSavedValues),
		);
		setSuccessStepId(null);

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

	async function handleSaveAndContinue() {
		const currentStepDraftValues = readCurrentDraftValues();
		const saveClassification = classifyPacketStepSave(
			currentStep,
			currentStepDraftValues,
			currentSavedValues,
			buildSavePayload(currentStep, currentStepDraftValues),
		);

		if (hasUnsavedChanges) {
			const success = await saveCurrentStep();
			if (!success) {
				return;
			}
		}

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

		if (saveClassification.state !== "complete") {
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

		if (
			nextHref &&
			(currentStep.id !== stage.steps.at(-1)?.id ||
				doesCompletingStepCompleteStage(stageStatus, currentStep))
		) {
			router.push(nextHref);
		}
	}

	return {
		currentFeedback,
		currentFieldErrors,
		currentStep,
		currentDraftValues,
		handleSaveAndContinue,
		handleFieldChange,
		isSaving,
		goToPreviousStep: () => {
			if (previousHref) {
				router.push(previousHref);
			}
		},
	};
}
