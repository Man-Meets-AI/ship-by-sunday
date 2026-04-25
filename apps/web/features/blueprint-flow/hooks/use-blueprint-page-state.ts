"use client";

import { useUser } from "@clerk/nextjs";
import type { ReactMutation } from "convex/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/blueprint-compiler";
import { api } from "@/convex/_generated/api";
import {
	areDraftValuesEqual,
	buildFlattenedDraftValues,
	buildNextProjectFacts,
	buildSavePayloadForBlueprint,
	clearStaleDerivedDesignFields,
	stripUntouchedGeneratedScopeFields,
	type BlueprintPageDraftValues,
} from "@/features/blueprint-flow/lib/blueprint-page-draft-model";
import { focusFirstMissingBlueprintField } from "@/features/blueprint-flow/lib/blueprint-page-focus";
import { applyOptimisticBlueprintWorkspaceUpdate } from "@/features/blueprint-flow/lib/blueprint-page-optimistic-state";
import {
	buildFieldErrors,
	buildPageFeedback,
	buildSectionStatuses,
} from "@/features/blueprint-flow/lib/blueprint-page-validation-model";
import type { BlueprintStepInlineFeedback } from "@/features/blueprint-flow/lib/blueprint-step-save-feedback";
import { getReviewAutoDownloadHref } from "@/features/blueprint-flow/lib/review-download-handoff";

export type { BlueprintPageSectionStatus } from "@/features/blueprint-flow/lib/blueprint-page-validation-model";

type SaveProjectDefinitionFactsMutation = ReactMutation<
	typeof api.blueprint.saveProjectDefinitionFacts
>;
type UnlockExecuteShipMutation = ReactMutation<
	typeof api.blueprint.unlockExecuteShip
>;

export function useBlueprintPageState({
	navigateToHref,
	onDirtyChange,
	projectFacts,
	saveProjectDefinitionFacts,
	unlockExecuteShip,
}: {
	navigateToHref: (href: string) => void;
	onDirtyChange?: (hasUnsavedChanges: boolean) => void;
	projectFacts: CanonicalProjectFactsDraft;
	saveProjectDefinitionFacts: SaveProjectDefinitionFactsMutation;
	unlockExecuteShip: UnlockExecuteShipMutation;
}) {
	const { isLoaded: isUserLoaded, user } = useUser();
	const contactEmail = isUserLoaded
		? (user?.primaryEmailAddress?.emailAddress ?? "")
		: "";
	const liveSavedValues = useMemo(
		() => buildFlattenedDraftValues(projectFacts, contactEmail),
		[contactEmail, projectFacts],
	);
	const saveProjectDefinitionFactsWithOptimism = useMemo(
		() =>
			saveProjectDefinitionFacts.withOptimisticUpdate((localStore, args) => {
				applyOptimisticBlueprintWorkspaceUpdate(localStore, args);
			}),
		[saveProjectDefinitionFacts],
	);
	const [savedBaselineValues, setSavedBaselineValues] =
		useState<BlueprintPageDraftValues>(liveSavedValues);
	const [currentDraftValues, setCurrentDraftValues] =
		useState<BlueprintPageDraftValues>(liveSavedValues);
	const [validationRequested, setValidationRequested] = useState(false);
	const [feedback, setFeedback] = useState<BlueprintStepInlineFeedback | null>(
		null,
	);
	const [hasSubmitError, setHasSubmitError] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const previousLiveSavedValuesRef = useRef(liveSavedValues);
	const currentDraftValuesRef = useRef(currentDraftValues);
	const hasUnsavedChanges = useMemo(
		() => !areDraftValuesEqual(currentDraftValues, savedBaselineValues),
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
		if (
			areDraftValuesEqual(previousLiveSavedValuesRef.current, liveSavedValues)
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
	}, [liveSavedValues]);

	const currentFacts = useMemo(
		() =>
			buildNextProjectFacts(
				projectFacts,
				buildSavePayloadForBlueprint(currentDraftValues),
			),
		[currentDraftValues, projectFacts],
	);
	const currentSectionStatuses = useMemo(
		() => buildSectionStatuses(currentFacts),
		[currentFacts],
	);
	const baselineFacts = useMemo(
		() =>
			buildNextProjectFacts(
				projectFacts,
				buildSavePayloadForBlueprint(savedBaselineValues),
			),
		[projectFacts, savedBaselineValues],
	);
	const baselineSectionStatuses = useMemo(
		() => buildSectionStatuses(baselineFacts),
		[baselineFacts],
	);

	const currentFieldErrors = validationRequested
		? buildFieldErrors(currentSectionStatuses)
		: {};
	const visibleFeedback = hasSubmitError
		? {
				tone: "destructive" as const,
				title: "We could not open review right now.",
				description:
					"Your latest blueprint draft is still here. Please try again.",
			}
		: feedback;

	const handleFieldChange = useCallback(
		(fieldKey: CanonicalProjectFactKey, nextValue: string) => {
			setHasSubmitError(false);
			const nextDraftValues = {
				...currentDraftValuesRef.current,
				[fieldKey]: nextValue,
			};
			currentDraftValuesRef.current = nextDraftValues;
			setCurrentDraftValues(nextDraftValues);

			if (!validationRequested) {
				setFeedback(null);
				return;
			}

			const nextFacts = buildNextProjectFacts(
				projectFacts,
				buildSavePayloadForBlueprint(nextDraftValues),
			);
			const nextSectionStatuses = buildSectionStatuses(nextFacts);
			const nextMissingFactKeys = nextSectionStatuses.flatMap(
				(sectionStatus) => sectionStatus.missingFactKeys,
			);
			setFeedback(
				buildPageFeedback({
					hasAnyAnswer:
						Object.keys(
							buildSavePayloadForBlueprint(nextDraftValues).factsPatch,
						).length > 0,
					isComplete: nextMissingFactKeys.length === 0,
					previouslyComplete: baselineSectionStatuses.every(
						(sectionStatus) => sectionStatus.isComplete,
					),
					missingFactKeys: nextMissingFactKeys,
				}),
			);
		},
		[baselineSectionStatuses, projectFacts, validationRequested],
	);

	const handleSaveAndContinue = useCallback(async () => {
		const submittedDraftValues = currentDraftValuesRef.current;
		const savePayload = clearStaleDerivedDesignFields({
			projectFacts,
			savedBaselineValues,
			submittedDraftValues,
			savePayload: stripUntouchedGeneratedScopeFields({
				projectFacts,
				savedBaselineValues,
				savePayload: buildSavePayloadForBlueprint(submittedDraftValues),
			}),
		});
		const nextFacts = buildNextProjectFacts(projectFacts, savePayload);
		const nextSectionStatuses = buildSectionStatuses(nextFacts);
		const nextMissingFactKeys = nextSectionStatuses.flatMap(
			(sectionStatus) => sectionStatus.missingFactKeys,
		);
		const nextFeedback = buildPageFeedback({
			hasAnyAnswer: Object.keys(savePayload.factsPatch).length > 0,
			isComplete: nextMissingFactKeys.length === 0,
			previouslyComplete: baselineSectionStatuses.every(
				(sectionStatus) => sectionStatus.isComplete,
			),
			missingFactKeys: nextMissingFactKeys,
		});

		setHasSubmitError(false);
		setIsSaving(true);

		if (hasUnsavedChanges) {
			try {
				await saveProjectDefinitionFactsWithOptimism(savePayload);
			} catch {
				setHasSubmitError(true);
				setIsSaving(false);
				return;
			}
			setSavedBaselineValues(submittedDraftValues);
			onDirtyChange?.(false);
		}

		if (nextMissingFactKeys.length > 0) {
			setIsSaving(false);
			setValidationRequested(true);
			setFeedback(nextFeedback);
			focusFirstMissingBlueprintField(nextSectionStatuses);
			return;
		}

		try {
			await unlockExecuteShip({});
		} catch {
			setHasSubmitError(true);
			setIsSaving(false);
			return;
		}

		setIsSaving(false);
		setValidationRequested(false);
		setFeedback(nextFeedback);
		navigateToHref(getReviewAutoDownloadHref());
	}, [
		baselineSectionStatuses,
		hasUnsavedChanges,
		navigateToHref,
		onDirtyChange,
		projectFacts,
		saveProjectDefinitionFactsWithOptimism,
		savedBaselineValues,
		unlockExecuteShip,
	]);

	return {
		currentDraftValues,
		currentFacts,
		currentFieldErrors,
		currentSectionStatuses,
		feedback: visibleFeedback,
		handleFieldChange,
		handleSaveAndContinue,
		hasUnsavedChanges,
		isReviewReady: currentSectionStatuses.every(
			(section) => section.isComplete,
		),
		isSaving,
	};
}
