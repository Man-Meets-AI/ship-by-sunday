import type {
	CanonicalProjectFactKey,
	CodebaseStepDefinition,
} from "@shipbysunday/codebase-compiler";
import { codebaseFieldLabel } from "./codebase-field-helpers";

type CodebaseStepValue = string | number | string[] | undefined;

export type CodebaseStepDraftValues = Partial<
	Record<CanonicalProjectFactKey, string>
>;

export type CodebaseStepSavePayload = {
	clearedFieldKeys: string[];
	factsPatch: Record<string, string | number | string[]>;
};

export type CodebaseStepSaveState =
	| "blank"
	| "partial"
	| "complete"
	| "cleared_to_incomplete";

export type CodebaseStepSaveFeedback = {
	state: CodebaseStepSaveState;
	requiredFieldKeys: readonly CanonicalProjectFactKey[];
	missingRequiredFieldKeys: CanonicalProjectFactKey[];
	firstMissingRequiredFieldKey: CanonicalProjectFactKey | null;
	clearedSavedFieldKeys: CanonicalProjectFactKey[];
};

export type CodebaseStepInlineFeedbackTone =
	| "default"
	| "warning"
	| "success"
	| "destructive";

export type CodebaseStepInlineFeedback = {
	tone: CodebaseStepInlineFeedbackTone;
	title: string;
	description: string;
};

function formatCodebaseFieldLabelList(fieldKeys: CanonicalProjectFactKey[]) {
	const labels = fieldKeys.map((fieldKey) => codebaseFieldLabel(fieldKey));
	if (labels.length <= 1) {
		return labels[0] ?? "";
	}
	if (labels.length === 2) {
		return `${labels[0]} and ${labels[1]}`;
	}

	return `${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}`;
}

export function getCodebaseStageFieldInputId(
	stepId: string,
	fieldKey: CanonicalProjectFactKey,
) {
	return `codebase-stage-field-${stepId}-${fieldKey}`;
}

export function getCodebaseStageFieldControlId(
	stepId: string,
	fieldKey: CanonicalProjectFactKey,
) {
	return `${getCodebaseStageFieldInputId(stepId, fieldKey)}-control`;
}

function isMissingCodebaseStepValue(
	fieldKey: CanonicalProjectFactKey,
	value: CodebaseStepValue,
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

function getCodebaseStepRequiredFieldKeys(step: CodebaseStepDefinition) {
	return step.requiredFieldKeys ?? step.fieldKeys;
}

function getNextCodebaseStepValue(
	fieldKey: CanonicalProjectFactKey,
	existingSavedValues: CodebaseStepDraftValues,
	payload: CodebaseStepSavePayload,
): CodebaseStepValue {
	if (payload.clearedFieldKeys.includes(fieldKey)) {
		return undefined;
	}
	if (Object.prototype.hasOwnProperty.call(payload.factsPatch, fieldKey)) {
		return payload.factsPatch[fieldKey];
	}
	return existingSavedValues[fieldKey];
}

export function classifyCodebaseStepSave(
	step: CodebaseStepDefinition,
	_draftValues: CodebaseStepDraftValues,
	existingSavedValues: CodebaseStepDraftValues,
	payload: CodebaseStepSavePayload,
): CodebaseStepSaveFeedback {
	const requiredFieldKeys = getCodebaseStepRequiredFieldKeys(step);
	const clearedSavedFieldKeys = payload.clearedFieldKeys.filter((fieldKey) => {
		const canonicalFieldKey = fieldKey as CanonicalProjectFactKey;
		return !isMissingCodebaseStepValue(
			canonicalFieldKey,
			existingSavedValues[canonicalFieldKey],
		);
	}) as CanonicalProjectFactKey[];
	const missingRequiredFieldKeys = requiredFieldKeys.filter((fieldKey) =>
		isMissingCodebaseStepValue(
			fieldKey,
			getNextCodebaseStepValue(fieldKey, existingSavedValues, payload),
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
			!isMissingCodebaseStepValue(fieldKey, existingSavedValues[fieldKey]),
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
			!isMissingCodebaseStepValue(
				fieldKey,
				getNextCodebaseStepValue(fieldKey, existingSavedValues, payload),
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

export function buildCodebaseStepSaveInlineFeedback(
	stepLabel: string,
	saveFeedback: Pick<
		CodebaseStepSaveFeedback,
		"state" | "missingRequiredFieldKeys"
	>,
): CodebaseStepInlineFeedback | null {
	switch (saveFeedback.state) {
		case "blank":
			return {
				tone: "default",
				title: `${stepLabel} is still blank.`,
				description: "Add at least one response before continuing.",
			};
		case "partial": {
			const missingFieldList = formatCodebaseFieldLabelList(
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
			const missingFieldList = formatCodebaseFieldLabelList(
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

export function buildCodebaseStepSaveErrorInlineFeedback(): CodebaseStepInlineFeedback {
	return {
		tone: "destructive",
		title: "We could not save this page right now.",
		description: "Your draft is still here. Please try again.",
	};
}
