"use client";

import type { OptimisticLocalStore } from "convex/browser";
import type { ReactMutation } from "convex/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
	BlueprintStageDefinition,
	BlueprintStageId,
	BlueprintStageStatus,
	BlueprintStepDefinition,
} from "@blueprint-compiler";
import {
	createCanonicalProjectDefinitionDraft,
	deriveStageStatus,
	parseCanonicalProjectFactsDraft,
	placeholderFriendlyFactKeys,
} from "@blueprint-compiler";
import { PRODUCT_APP_ID } from "@/config/product";
import { api } from "@/convex/_generated/api";
import {
	buildStepDraftValues,
	buildSavePayload,
} from "@/features/blueprint-flow/lib/blueprint-field-helpers";
import {
	buildBlueprintStepSaveErrorInlineFeedback,
	buildBlueprintStepSaveInlineFeedback,
	classifyBlueprintStepSave,
	getBlueprintStageFieldControlId,
	getBlueprintStageFieldInputId,
	type BlueprintStepDraftValues,
	type BlueprintStepInlineFeedback,
	type BlueprintStepSaveFeedback,
	type BlueprintStepSavePayload,
} from "@/features/blueprint-flow/lib/blueprint-step-save-feedback";
import { doesCompletingStepCompleteStage } from "@/features/blueprint-flow/lib/blueprint-stage-routes";
import type { BlueprintWorkspaceState } from "@/features/blueprint-flow/lib/blueprint-workspace-types";

type SaveProjectDefinitionFactsArgs = {
	stageId: Exclude<BlueprintStageId, "start" | "review">;
} & BlueprintStepSavePayload;

type SaveProjectDefinitionFactsMutation = ReactMutation<
	typeof api.blueprint.saveProjectDefinitionFacts
>;

const OPTIMISTIC_BLUEPRINT_CLERK_USER_ID = "optimistic-local-user";

function areBlueprintStepDraftValuesEqual(
	left: BlueprintStepDraftValues,
	right: BlueprintStepDraftValues,
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

function buildOptimisticBlueprintWorkspaceState(
	currentWorkspaceState: BlueprintWorkspaceState,
	args: SaveProjectDefinitionFactsArgs,
): BlueprintWorkspaceState {
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
					OPTIMISTIC_BLUEPRINT_CLERK_USER_ID,
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
		blueprintReadiness: nextStageStatus.blueprintReadiness,
		stageStatuses: nextStageStatus.stageStatuses,
	};
}

function applyOptimisticBlueprintWorkspaceUpdate(
	localStore: OptimisticLocalStore,
	args: SaveProjectDefinitionFactsArgs,
) {
	const currentWorkspaceState = localStore.getQuery(
		api.blueprint.getBlueprintWorkspaceState,
		{},
	);
	if (!currentWorkspaceState) {
		return;
	}

	localStore.setQuery(
		api.blueprint.getBlueprintWorkspaceState,
		{},
		buildOptimisticBlueprintWorkspaceState(currentWorkspaceState, args),
	);
}

function focusFirstMissingField(
	step: BlueprintStepDefinition,
	fieldKey: CanonicalProjectFactKey | null,
) {
	if (!fieldKey) {
		return;
	}

	window.setTimeout(() => {
		const control = document.getElementById(
			getBlueprintStageFieldControlId(step.id, fieldKey),
		) as HTMLElement | null;
		const input = document.getElementById(
			getBlueprintStageFieldInputId(step.id, fieldKey),
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

function requireBlueprintStep(
	stage: BlueprintStageDefinition,
	stageId: Exclude<BlueprintStageId, "start" | "review">,
	stepId: string,
) {
	const step = stage.steps.find((candidate) => candidate.id === stepId);
	if (!step) {
		throw new Error(`Missing step ${stepId} for stage ${stageId}`);
	}

	return step;
}

export function useBlueprintStageStepState({
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
	stage: BlueprintStageDefinition;
	stageId: Exclude<BlueprintStageId, "start" | "review">;
	stageStatus: BlueprintStageStatus;
	stepId: string;
	previousHref?: string;
	nextHref?: string;
	projectFacts: CanonicalProjectFactsDraft;
	saveProjectDefinitionFacts: SaveProjectDefinitionFactsMutation;
}) {
	const currentStep = requireBlueprintStep(stage, stageId, stepId);
	const liveSavedValues = useMemo(
		() => buildStepDraftValues(projectFacts, currentStep),
		[currentStep, projectFacts],
	);
	const saveProjectDefinitionFactsWithOptimism = useMemo(
		() =>
			saveProjectDefinitionFacts.withOptimisticUpdate((localStore, args) => {
				applyOptimisticBlueprintWorkspaceUpdate(localStore, args);
			}),
		[saveProjectDefinitionFacts],
	);
	const [savedBaselineValues, setSavedBaselineValues] =
		useState<BlueprintStepDraftValues>(liveSavedValues);
	const [currentDraftValues, setCurrentDraftValues] =
		useState<BlueprintStepDraftValues>(liveSavedValues);
	const [currentSaveFeedback, setCurrentSaveFeedback] =
		useState<BlueprintStepSaveFeedback | null>(null);
	const [validationRequested, setValidationRequested] = useState(false);
	const [hasSaveError, setHasSaveError] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const previousStepIdRef = useRef(stepId);
	const previousLiveSavedValuesRef = useRef(liveSavedValues);
	const currentDraftValuesRef = useRef(currentDraftValues);
	const hasUnsavedChanges = useMemo(
		() =>
			!areBlueprintStepDraftValuesEqual(
				currentDraftValues,
				savedBaselineValues,
			),
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
		currentDraftValuesRef.current = liveSavedValues;
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
			areBlueprintStepDraftValuesEqual(
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
			currentDraftValuesRef.current = liveSavedValues;
		}
	}, [liveSavedValues, stepId]);

	const saveCurrentStep = useCallback(
		async ({
			saveClassification,
			revealValidation,
			showSuccess,
		}: {
			saveClassification?: BlueprintStepSaveFeedback;
			revealValidation?: boolean;
			showSuccess?: boolean;
		} = {}): Promise<boolean> => {
			const submittedDraftValues = currentDraftValuesRef.current;
			const savePayload = buildSavePayload(currentStep, submittedDraftValues);
			const nextSaveClassification =
				saveClassification ??
				classifyBlueprintStepSave(
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

	const currentFeedback: BlueprintStepInlineFeedback | null = (() => {
		if (hasSaveError) {
			return buildBlueprintStepSaveErrorInlineFeedback();
		}
		if (!currentSaveFeedback) {
			return null;
		}

		return buildBlueprintStepSaveInlineFeedback(
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
		const nextDraftValues: BlueprintStepDraftValues = {
			...currentDraftValuesRef.current,
			[fieldKey]: nextValue,
		};
		const nextHasUnsavedChanges = !areBlueprintStepDraftValuesEqual(
			nextDraftValues,
			savedBaselineValues,
		);
		currentDraftValuesRef.current = nextDraftValues;
		setCurrentDraftValues(nextDraftValues);
		onDirtyChange?.(nextHasUnsavedChanges);
		if (!validationRequested) {
			setCurrentSaveFeedback(null);
			return;
		}

		const nextClassification = classifyBlueprintStepSave(
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
		const saveClassification = classifyBlueprintStepSave(
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
