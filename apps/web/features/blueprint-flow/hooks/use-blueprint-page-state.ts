"use client";

import { useUser } from "@clerk/nextjs";
import type { OptimisticLocalStore } from "convex/browser";
import type { ReactMutation } from "convex/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/blueprint-compiler";
import {
	createCanonicalProjectDefinitionDraft,
	deriveBlueprintFacts,
	deriveStageStatus,
	getBlueprintStageDefinition,
	parseCanonicalProjectFactsDraft,
	placeholderFriendlyFactKeys,
} from "@shipbysunday/blueprint-compiler";
import { PRODUCT_APP_ID } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { getReviewAutoDownloadHref } from "@/features/blueprint-flow/lib/review-download-handoff";
import {
	blueprintPageSections,
	type BlueprintPageSectionId,
} from "@/features/blueprint-flow/lib/blueprint-page-sections";
import {
	buildSavePayload,
	buildStageDraftValues,
} from "@/features/blueprint-flow/lib/blueprint-field-helpers";
import type { BlueprintStepInlineFeedback } from "@/features/blueprint-flow/lib/blueprint-step-save-feedback";
import {
	getBlueprintStageFieldControlId,
	getBlueprintStageFieldInputId,
} from "@/features/blueprint-flow/lib/blueprint-step-save-feedback";
import type { BlueprintWorkspaceState } from "@/features/blueprint-flow/lib/blueprint-workspace-types";

type SaveProjectDefinitionFactsArgs = {
	clearedFieldKeys: string[];
	factsPatch: Record<string, string | number | string[]>;
};

type SaveProjectDefinitionFactsMutation = ReactMutation<
	typeof api.blueprint.saveProjectDefinitionFacts
>;
type UnlockExecuteShipMutation = ReactMutation<
	typeof api.blueprint.unlockExecuteShip
>;

type BlueprintPageDraftValues = Partial<
	Record<CanonicalProjectFactKey, string>
>;

export type BlueprintPageSectionStatus = {
	sectionId: BlueprintPageSectionId;
	isComplete: boolean;
	missingFactKeys: CanonicalProjectFactKey[];
};

const OPTIMISTIC_BLUEPRINT_CLERK_USER_ID = "optimistic-local-user";
const blueprintStage = getBlueprintStageDefinition("blueprint");

function areDraftValuesEqual(
	left: BlueprintPageDraftValues,
	right: BlueprintPageDraftValues,
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

function buildFlattenedDraftValues(
	projectFacts: CanonicalProjectFactsDraft,
	contactEmail?: string,
) {
	const stageDraftValues = buildStageDraftValues(projectFacts, blueprintStage);
	const flattenedDraftValues = Object.values(stageDraftValues).reduce(
		(accumulator, draftValues) => ({ ...accumulator, ...draftValues }),
		{} as BlueprintPageDraftValues,
	);

	if (!flattenedDraftValues.contact_email && contactEmail) {
		flattenedDraftValues.contact_email = contactEmail;
	}

	return flattenedDraftValues;
}

function buildSavePayloadForBlueprint(
	draftValues: BlueprintPageDraftValues,
): SaveProjectDefinitionFactsArgs {
	const payloadByStep = blueprintPageSections.map((step) =>
		buildSavePayload(step, draftValues),
	);

	return {
		clearedFieldKeys: Array.from(
			new Set(payloadByStep.flatMap((payload) => payload.clearedFieldKeys)),
		),
		factsPatch: Object.assign(
			{},
			...payloadByStep.map((payload) => payload.factsPatch),
		),
	};
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

function stripUntouchedGeneratedScopeFields({
	projectFacts,
	savedBaselineValues,
	savePayload,
}: {
	projectFacts: CanonicalProjectFactsDraft;
	savedBaselineValues: BlueprintPageDraftValues;
	savePayload: SaveProjectDefinitionFactsArgs;
}) {
	const nextFactsPatch = { ...savePayload.factsPatch };
	const nextClearedFieldKeys = [...savePayload.clearedFieldKeys];

	for (const fieldKey of ["scope_in", "scope_out"] as const) {
		if (projectFacts[fieldKey] !== undefined) {
			continue;
		}
		const nextValue = nextFactsPatch[fieldKey];
		const formattedNextValue = Array.isArray(nextValue)
			? nextValue.join("\n")
			: "";
		if (formattedNextValue !== (savedBaselineValues[fieldKey] ?? "")) {
			continue;
		}

		delete nextFactsPatch[fieldKey];

		const clearedIndex = nextClearedFieldKeys.indexOf(fieldKey);
		if (clearedIndex >= 0) {
			nextClearedFieldKeys.splice(clearedIndex, 1);
		}
	}

	return {
		clearedFieldKeys: nextClearedFieldKeys,
		factsPatch: nextFactsPatch,
	} satisfies SaveProjectDefinitionFactsArgs;
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

function hasFactValue(
	value: CanonicalProjectFactsDraft[CanonicalProjectFactKey],
) {
	if (value === undefined || value === null) {
		return false;
	}
	if (typeof value === "string") {
		return value.trim().length > 0;
	}
	if (typeof value === "number") {
		return Number.isFinite(value);
	}
	if (Array.isArray(value)) {
		return value.length > 0;
	}
	return false;
}

function buildSectionStatuses(
	facts: CanonicalProjectFactsDraft,
): BlueprintPageSectionStatus[] {
	const derivedFacts = deriveBlueprintFacts(facts);

	return blueprintPageSections.map((section) => {
		const requiredFieldKeys = section.requiredFieldKeys ?? section.fieldKeys;
		const missingFactKeys = requiredFieldKeys.filter(
			(fieldKey) => !hasFactValue(derivedFacts[fieldKey]),
		);

		return {
			sectionId: section.id,
			isComplete: missingFactKeys.length === 0,
			missingFactKeys,
		};
	});
}

function buildFieldErrors(sectionStatuses: BlueprintPageSectionStatus[]) {
	return Object.fromEntries(
		sectionStatuses.flatMap((sectionStatus) =>
			sectionStatus.missingFactKeys.map((fieldKey) => [
				fieldKey,
				"Add an answer here before Review can unlock.",
			]),
		),
	);
}

function formatFieldList(fieldKeys: CanonicalProjectFactKey[]) {
	return fieldKeys.map((fieldKey) => fieldKey.replaceAll("_", " ")).join(", ");
}

function buildPageFeedback({
	hasAnyAnswer,
	isComplete,
	previouslyComplete,
	missingFactKeys,
}: {
	hasAnyAnswer: boolean;
	isComplete: boolean;
	previouslyComplete: boolean;
	missingFactKeys: CanonicalProjectFactKey[];
}): BlueprintStepInlineFeedback | null {
	if (isComplete) {
		return {
			tone: "success",
			title: "Saved and ready for review.",
			description: "The blueprint is complete. Continue to Review.",
		};
	}

	if (!hasAnyAnswer) {
		return {
			tone: "default",
			title: "Blueprint is still blank.",
			description: "Add at least one answer before continuing to Review.",
		};
	}

	return {
		tone: previouslyComplete ? "warning" : "default",
		title: previouslyComplete ? "Blueprint is incomplete." : "Draft saved.",
		description: `Complete ${formatFieldList(missingFactKeys)} before Review can unlock.`,
	};
}

function focusFirstMissingField(sectionStatuses: BlueprintPageSectionStatus[]) {
	const firstIncompleteSection = sectionStatuses.find(
		(sectionStatus) => sectionStatus.missingFactKeys.length > 0,
	);
	const firstMissingFieldKey = firstIncompleteSection?.missingFactKeys[0];
	if (!firstIncompleteSection || !firstMissingFieldKey) {
		return;
	}

	window.setTimeout(() => {
		const control = document.getElementById(
			getBlueprintStageFieldControlId(
				firstIncompleteSection.sectionId,
				firstMissingFieldKey,
			),
		) as HTMLElement | null;
		const input = document.getElementById(
			getBlueprintStageFieldInputId(
				firstIncompleteSection.sectionId,
				firstMissingFieldKey,
			),
		) as HTMLInputElement | HTMLTextAreaElement | null;
		const focusTarget = control ?? input;

		focusTarget?.scrollIntoView?.({ behavior: "smooth", block: "center" });
		focusTarget?.focus?.();
	}, 0);
}

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
		const savePayload = stripUntouchedGeneratedScopeFields({
			projectFacts,
			savedBaselineValues,
			savePayload: buildSavePayloadForBlueprint(submittedDraftValues),
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
			focusFirstMissingField(nextSectionStatuses);
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
