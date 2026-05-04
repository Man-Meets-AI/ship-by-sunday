import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/codebase-compiler";
import {
	designPresetDerivedFactKeys,
	deriveCodebaseFacts,
	getCodebaseStageDefinition,
	parseCanonicalProjectFactsDraft,
} from "@shipbysunday/codebase-compiler";
import { codebasePageSections } from "@/lib/codebase-flow/codebase-page-sections";
import {
	buildSavePayload,
	buildStageDraftValues,
} from "@/lib/codebase-flow/codebase-field-helpers";

export type SaveProjectDefinitionFactsArgs = {
	clearedFieldKeys: string[];
	factsPatch: Record<string, string | number | string[]>;
};

export type CodebasePageDraftValues = Partial<
	Record<CanonicalProjectFactKey, string>
>;

const codebaseStage = getCodebaseStageDefinition("codebase");

export function areDraftValuesEqual(
	left: CodebasePageDraftValues,
	right: CodebasePageDraftValues,
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

export function buildFlattenedDraftValues(
	projectFacts: CanonicalProjectFactsDraft,
	contactEmail?: string,
) {
	const stageDraftValues = buildStageDraftValues(projectFacts, codebaseStage);
	const flattenedDraftValues = Object.values(stageDraftValues).reduce(
		(accumulator, draftValues) => ({ ...accumulator, ...draftValues }),
		{} as CodebasePageDraftValues,
	);

	if (!flattenedDraftValues.contact_email && contactEmail) {
		flattenedDraftValues.contact_email = contactEmail;
	}

	return flattenedDraftValues;
}

export function buildSavePayloadForCodebase(
	draftValues: CodebasePageDraftValues,
): SaveProjectDefinitionFactsArgs {
	const payloadByStep = codebasePageSections.map((step) =>
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

export function buildNextProjectFacts(
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

export function stripUntouchedGeneratedScopeFields({
	projectFacts,
	savedBaselineValues,
	savePayload,
}: {
	projectFacts: CanonicalProjectFactsDraft;
	savedBaselineValues: CodebasePageDraftValues;
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

export function clearStaleDerivedDesignFields({
	projectFacts,
	savePayload,
	savedBaselineValues,
	submittedDraftValues,
}: {
	projectFacts: CanonicalProjectFactsDraft;
	savePayload: SaveProjectDefinitionFactsArgs;
	savedBaselineValues: CodebasePageDraftValues;
	submittedDraftValues: CodebasePageDraftValues;
}) {
	const designInputKeys: readonly CanonicalProjectFactKey[] = [
		"design_preset_id",
		"theme_preset",
		"design_references",
	];
	const designInputsChanged = designInputKeys.some(
		(fieldKey) =>
			(submittedDraftValues[fieldKey] ?? "") !==
			(savedBaselineValues[fieldKey] ?? ""),
	);
	if (!designInputsChanged) {
		return savePayload;
	}

	const savedFactsWithoutDerivedDesignFields = { ...projectFacts };
	for (const fieldKey of designPresetDerivedFactKeys) {
		delete savedFactsWithoutDerivedDesignFields[fieldKey];
	}
	const previouslyDerivedDesignFacts = deriveCodebaseFacts(
		savedFactsWithoutDerivedDesignFields,
	);
	const staleDerivedFieldKeys = designPresetDerivedFactKeys.filter(
		(fieldKey) => {
			const currentSavedValue = projectFacts[fieldKey];
			const previousDerivedValue = previouslyDerivedDesignFacts[fieldKey];
			if (typeof currentSavedValue !== "string") {
				return false;
			}

			return currentSavedValue === previousDerivedValue;
		},
	);
	const clearedFieldKeys = Array.from(
		new Set([...savePayload.clearedFieldKeys, ...staleDerivedFieldKeys]),
	);

	return {
		...savePayload,
		clearedFieldKeys,
	} satisfies SaveProjectDefinitionFactsArgs;
}
