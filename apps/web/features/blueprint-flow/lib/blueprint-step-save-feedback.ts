import type {
	CanonicalProjectFactKey,
	BlueprintStepDefinition,
} from "@blueprint-compiler";
import { blueprintFieldLabel } from "./blueprint-field-helpers";

type BlueprintStepValue = string | number | string[] | undefined;

export type BlueprintStepDraftValues = Partial<
	Record<CanonicalProjectFactKey, string>
>;

export type BlueprintStepSavePayload = {
	clearedFieldKeys: string[];
	factsPatch: Record<string, string | number | string[]>;
};

export type BlueprintStepSaveState =
	| "blank"
	| "partial"
	| "complete"
	| "cleared_to_incomplete";

export type BlueprintStepSaveFeedback = {
	state: BlueprintStepSaveState;
	requiredFieldKeys: readonly CanonicalProjectFactKey[];
	missingRequiredFieldKeys: CanonicalProjectFactKey[];
	firstMissingRequiredFieldKey: CanonicalProjectFactKey | null;
	clearedSavedFieldKeys: CanonicalProjectFactKey[];
};

export type BlueprintStepInlineFeedbackTone =
	| "default"
	| "warning"
	| "success"
	| "destructive";

export type BlueprintStepInlineFeedback = {
	tone: BlueprintStepInlineFeedbackTone;
	title: string;
	description: string;
};

function formatBlueprintFieldLabelList(fieldKeys: CanonicalProjectFactKey[]) {
	const labels = fieldKeys.map((fieldKey) => blueprintFieldLabel(fieldKey));
	if (labels.length <= 1) {
		return labels[0] ?? "";
	}
	if (labels.length === 2) {
		return `${labels[0]} and ${labels[1]}`;
	}

	return `${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}`;
}

export function getBlueprintStageFieldInputId(
	stepId: string,
	fieldKey: CanonicalProjectFactKey,
) {
	return `blueprint-stage-field-${stepId}-${fieldKey}`;
}

export function getBlueprintStageFieldControlId(
	stepId: string,
	fieldKey: CanonicalProjectFactKey,
) {
	return `${getBlueprintStageFieldInputId(stepId, fieldKey)}-control`;
}

function isMissingBlueprintStepValue(
	fieldKey: CanonicalProjectFactKey,
	value: BlueprintStepValue,
) {
	if (fieldKey === "surface_type") {
		return value === undefined;
	}
	if (typeof value === "string") {
		return value.trim().length === 0;
	}
	if (typeof value === "number") {
		return !Number.isFinite(value);
	}
	if (Array.isArray(value)) {
		return value.length === 0;
	}
	return value === undefined;
}

function getBlueprintStepRequiredFieldKeys(step: BlueprintStepDefinition) {
	return step.requiredFieldKeys ?? step.fieldKeys;
}

function getNextBlueprintStepValue(
	fieldKey: CanonicalProjectFactKey,
	existingSavedValues: BlueprintStepDraftValues,
	payload: BlueprintStepSavePayload,
): BlueprintStepValue {
	if (payload.clearedFieldKeys.includes(fieldKey)) {
		return undefined;
	}
	if (Object.prototype.hasOwnProperty.call(payload.factsPatch, fieldKey)) {
		return payload.factsPatch[fieldKey];
	}
	return existingSavedValues[fieldKey];
}

export function classifyBlueprintStepSave(
	step: BlueprintStepDefinition,
	_draftValues: BlueprintStepDraftValues,
	existingSavedValues: BlueprintStepDraftValues,
	payload: BlueprintStepSavePayload,
): BlueprintStepSaveFeedback {
	const requiredFieldKeys = getBlueprintStepRequiredFieldKeys(step);
	const clearedSavedFieldKeys = payload.clearedFieldKeys.filter((fieldKey) => {
		const canonicalFieldKey = fieldKey as CanonicalProjectFactKey;
		return !isMissingBlueprintStepValue(
			canonicalFieldKey,
			existingSavedValues[canonicalFieldKey],
		);
	}) as CanonicalProjectFactKey[];
	const missingRequiredFieldKeys = requiredFieldKeys.filter((fieldKey) =>
		isMissingBlueprintStepValue(
			fieldKey,
			getNextBlueprintStepValue(fieldKey, existingSavedValues, payload),
		),
	);
	const firstMissingRequiredFieldKey = missingRequiredFieldKeys[0] ?? null;
	const isComplete = missingRequiredFieldKeys.length === 0;

	if (isComplete) {
		return {
			state: "complete",
			requiredFieldKeys,
			missingRequiredFieldKeys,
			firstMissingRequiredFieldKey,
			clearedSavedFieldKeys,
		};
	}

	const wasCompleteBeforeSave = requiredFieldKeys.every(
		(fieldKey) =>
			!isMissingBlueprintStepValue(fieldKey, existingSavedValues[fieldKey]),
	);
	if (wasCompleteBeforeSave && clearedSavedFieldKeys.length > 0) {
		return {
			state: "cleared_to_incomplete",
			requiredFieldKeys,
			missingRequiredFieldKeys,
			firstMissingRequiredFieldKey,
			clearedSavedFieldKeys,
		};
	}

	const hasMeaningfulContentAfterSave = step.fieldKeys.some(
		(fieldKey) =>
			!isMissingBlueprintStepValue(
				fieldKey,
				getNextBlueprintStepValue(fieldKey, existingSavedValues, payload),
			),
	);
	if (!hasMeaningfulContentAfterSave && clearedSavedFieldKeys.length === 0) {
		return {
			state: "blank",
			requiredFieldKeys,
			missingRequiredFieldKeys,
			firstMissingRequiredFieldKey,
			clearedSavedFieldKeys,
		};
	}

	return {
		state: "partial",
		requiredFieldKeys,
		missingRequiredFieldKeys,
		firstMissingRequiredFieldKey,
		clearedSavedFieldKeys,
	};
}

export function buildBlueprintStepSaveInlineFeedback(
	stepLabel: string,
	saveFeedback: Pick<
		BlueprintStepSaveFeedback,
		"state" | "missingRequiredFieldKeys"
	>,
): BlueprintStepInlineFeedback | null {
	switch (saveFeedback.state) {
		case "blank":
			return {
				tone: "default",
				title: `${stepLabel} is still blank.`,
				description: "Add at least one response before continuing.",
			};
		case "partial": {
			const missingFieldList = formatBlueprintFieldLabelList(
				saveFeedback.missingRequiredFieldKeys,
			);

			return {
				tone: "default",
				title: "Draft saved.",
				description: missingFieldList
					? `Complete ${missingFieldList} before this page can be marked complete.`
					: "Complete the remaining required responses before this page can be marked complete.",
			};
		}
		case "cleared_to_incomplete": {
			const missingFieldList = formatBlueprintFieldLabelList(
				saveFeedback.missingRequiredFieldKeys,
			);

			return {
				tone: "warning",
				title: "This page is incomplete.",
				description: missingFieldList
					? `Complete ${missingFieldList} to restore completion for this page.`
					: "Complete the missing required responses to restore completion for this page.",
			};
		}
		case "complete":
			return {
				tone: "success",
				title: "Saved and complete.",
				description: `${stepLabel} is ready to continue.`,
			};
		default:
			return null;
	}
}

export function buildBlueprintStepSaveErrorInlineFeedback(): BlueprintStepInlineFeedback {
	return {
		tone: "destructive",
		title: "We could not save this page right now.",
		description: "Your draft is still here. Please try again.",
	};
}
