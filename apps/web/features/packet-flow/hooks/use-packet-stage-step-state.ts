"use client";

import type { OptimisticLocalStore } from "convex/browser";
import type { ReactMutation } from "convex/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
	buildStepDraftValues,
	buildSavePayload,
} from "@/features/packet-flow/lib/packet-field-helpers";
import {
	buildPacketStepSaveErrorInlineFeedback,
	buildPacketStepSaveInlineFeedback,
	classifyPacketStepSave,
	getPacketStageFieldControlId,
	getPacketStageFieldInputId,
	type PacketStepDraftValues,
	type PacketStepInlineFeedback,
	type PacketStepSaveFeedback,
	type PacketStepSavePayload,
} from "@/features/packet-flow/lib/packet-step-save-feedback";
import { doesCompletingStepCompleteStage } from "@/features/packet-flow/lib/packet-stage-routes";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";

type SaveProjectDefinitionFactsArgs = {
	stageId: Exclude<PacketStageId, "start" | "review">;
} & PacketStepSavePayload;

type SaveProjectDefinitionFactsMutation = ReactMutation<
	typeof api.packet.saveProjectDefinitionFacts
>;

const OPTIMISTIC_PACKET_CLERK_USER_ID = "optimistic-local-user";

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

	window.setTimeout(() => {
		const control = document.getElementById(
			getPacketStageFieldControlId(step.id, fieldKey),
		) as HTMLElement | null;
		const input = document.getElementById(
			getPacketStageFieldInputId(step.id, fieldKey),
		) as HTMLInputElement | HTMLTextAreaElement | null;
		const focusTarget = control ?? input;

		focusTarget?.scrollIntoView?.({ behavior: "smooth", block: "center" });
		focusTarget?.focus?.();
	}, 0);
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
	navigateToHref,
	onDirtyChange,
	requestNavigation,
	stage,
	stageId,
	stageStatus,
	stepId,
	previousHref,
	nextHref,
	projectFacts,
	saveProjectDefinitionFacts,
}: {
	navigateToHref: (href: string) => void;
	onDirtyChange?: (hasUnsavedChanges: boolean) => void;
	requestNavigation: (href: string) => void;
	stage: PacketStageDefinition;
	stageId: Exclude<PacketStageId, "start" | "review">;
	stageStatus: PacketStageStatus;
	stepId: string;
	previousHref?: string;
	nextHref?: string;
	projectFacts: CanonicalProjectFactsDraft;
	saveProjectDefinitionFacts: SaveProjectDefinitionFactsMutation;
}) {
	const currentStep = requirePacketStep(stage, stageId, stepId);
	const liveSavedValues = useMemo(
		() => buildStepDraftValues(projectFacts, currentStep),
		[currentStep, projectFacts],
	);
	const saveProjectDefinitionFactsWithOptimism = useMemo(
		() =>
			saveProjectDefinitionFacts.withOptimisticUpdate((localStore, args) => {
				applyOptimisticPacketWorkspaceUpdate(localStore, args);
			}),
		[saveProjectDefinitionFacts],
	);
	const [savedBaselineValues, setSavedBaselineValues] =
		useState<PacketStepDraftValues>(liveSavedValues);
	const [currentDraftValues, setCurrentDraftValues] =
		useState<PacketStepDraftValues>(liveSavedValues);
	const [currentSaveFeedback, setCurrentSaveFeedback] =
		useState<PacketStepSaveFeedback | null>(null);
	const [validationRequested, setValidationRequested] = useState(false);
	const [hasSaveError, setHasSaveError] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const previousStepIdRef = useRef(stepId);
	const previousLiveSavedValuesRef = useRef(liveSavedValues);
	const currentDraftValuesRef = useRef(currentDraftValues);
	const hasUnsavedChanges = useMemo(
		() =>
			!arePacketStepDraftValuesEqual(currentDraftValues, savedBaselineValues),
		[currentDraftValues, savedBaselineValues],
	);
	const hasUnsavedChangesRef = useRef(hasUnsavedChanges);

	useEffect(() => {
		currentDraftValuesRef.current = currentDraftValues;
	}, [currentDraftValues]);

	useEffect(() => {
		hasUnsavedChangesRef.current = hasUnsavedChanges;
		onDirtyChange?.(hasUnsavedChanges);
	}, [hasUnsavedChanges, onDirtyChange]);

	useEffect(() => {
		if (previousStepIdRef.current === stepId) {
			return;
		}

		previousStepIdRef.current = stepId;
		previousLiveSavedValuesRef.current = liveSavedValues;
		setSavedBaselineValues(liveSavedValues);
		setCurrentDraftValues(liveSavedValues);
		onDirtyChange?.(false);
		setCurrentSaveFeedback(null);
		setValidationRequested(false);
		setHasSaveError(false);
	}, [liveSavedValues, onDirtyChange, stepId]);

	useEffect(() => {
		if (previousStepIdRef.current !== stepId) {
			return;
		}
		if (
			arePacketStepDraftValuesEqual(
				previousLiveSavedValuesRef.current,
				liveSavedValues,
			)
		) {
			return;
		}

		const wasDirtyBeforeLiveUpdate = hasUnsavedChangesRef.current;
		previousLiveSavedValuesRef.current = liveSavedValues;
		setSavedBaselineValues(liveSavedValues);
		if (!wasDirtyBeforeLiveUpdate) {
			setCurrentDraftValues(liveSavedValues);
		}
	}, [liveSavedValues, stepId]);

	const saveCurrentStep = useCallback(
		async ({
			saveClassification,
			revealValidation,
			showSuccess,
		}: {
			saveClassification?: PacketStepSaveFeedback;
			revealValidation?: boolean;
			showSuccess?: boolean;
		} = {}): Promise<boolean> => {
			const submittedDraftValues = currentDraftValuesRef.current;
			const savePayload = buildSavePayload(currentStep, submittedDraftValues);
			const nextSaveClassification =
				saveClassification ??
				classifyPacketStepSave(
					currentStep,
					submittedDraftValues,
					savedBaselineValues,
					savePayload,
				);

			setHasSaveError(false);
			setIsSaving(true);
			try {
				await saveProjectDefinitionFactsWithOptimism({
					stageId,
					...savePayload,
				});
			} catch {
				setHasSaveError(true);
				return false;
			} finally {
				setIsSaving(false);
			}

			setSavedBaselineValues(submittedDraftValues);
			onDirtyChange?.(false);
			if (nextSaveClassification.state === "complete") {
				setValidationRequested(false);
				if (showSuccess) {
					setCurrentSaveFeedback(nextSaveClassification);
				} else {
					setCurrentSaveFeedback(null);
				}
				return true;
			}

			if (revealValidation || validationRequested) {
				setValidationRequested(true);
				setCurrentSaveFeedback(nextSaveClassification);
				return true;
			}

			setCurrentSaveFeedback(null);
			return true;
		},
		[
			currentStep,
			onDirtyChange,
			savedBaselineValues,
			saveProjectDefinitionFactsWithOptimism,
			stageId,
			validationRequested,
		],
	);

	const currentFeedback: PacketStepInlineFeedback | null = (() => {
		if (hasSaveError) {
			return buildPacketStepSaveErrorInlineFeedback();
		}
		if (!currentSaveFeedback) {
			return null;
		}

		return buildPacketStepSaveInlineFeedback(
			currentStep.label,
			currentSaveFeedback,
		);
	})();
	const currentFieldErrors =
		validationRequested && currentSaveFeedback
			? buildFieldErrorByFieldKey(currentSaveFeedback.missingRequiredFieldKeys)
			: {};

	function handleFieldChange(
		fieldKey: CanonicalProjectFactKey,
		nextValue: string,
	) {
		setHasSaveError(false);
		const nextDraftValues: PacketStepDraftValues = {
			...currentDraftValuesRef.current,
			[fieldKey]: nextValue,
		};
		const nextHasUnsavedChanges = !arePacketStepDraftValuesEqual(
			nextDraftValues,
			savedBaselineValues,
		);
		setCurrentDraftValues(nextDraftValues);
		onDirtyChange?.(nextHasUnsavedChanges);
		if (!validationRequested) {
			setCurrentSaveFeedback(null);
			return;
		}

		const nextClassification = classifyPacketStepSave(
			currentStep,
			nextDraftValues,
			savedBaselineValues,
			buildSavePayload(currentStep, nextDraftValues),
		);
		if (nextClassification.state === "complete") {
			setValidationRequested(false);
			setCurrentSaveFeedback(null);
			return;
		}

		setCurrentSaveFeedback(nextClassification);
	}

	async function handleSaveAndContinue() {
		const submittedDraftValues = currentDraftValuesRef.current;
		const saveClassification = classifyPacketStepSave(
			currentStep,
			submittedDraftValues,
			savedBaselineValues,
			buildSavePayload(currentStep, submittedDraftValues),
		);

		if (hasUnsavedChanges) {
			const success = await saveCurrentStep({
				saveClassification,
				revealValidation: saveClassification.state !== "complete",
				showSuccess: saveClassification.state === "complete",
			});
			if (!success) {
				return;
			}
		}

		if (saveClassification.state === "blank") {
			setValidationRequested(true);
			setCurrentSaveFeedback(saveClassification);
			focusFirstMissingField(
				currentStep,
				saveClassification.firstMissingRequiredFieldKey,
			);
			return;
		}

		if (saveClassification.state !== "complete") {
			setValidationRequested(true);
			setCurrentSaveFeedback(saveClassification);
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
			navigateToHref(nextHref);
			return;
		}

		setCurrentSaveFeedback(saveClassification);
	}

	return {
		currentFeedback,
		currentFieldErrors,
		currentStep,
		currentDraftValues,
		handleSaveAndContinue,
		handleFieldChange,
		hasUnsavedChanges,
		isSaving,
		goToPreviousStep: () => {
			if (previousHref) {
				requestNavigation?.(previousHref);
			}
		},
	};
}
