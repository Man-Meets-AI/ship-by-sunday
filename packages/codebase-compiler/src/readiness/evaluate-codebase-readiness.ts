import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "../canonical-project-definition/project-definition";
import { deriveCodebaseFacts } from "../canonical-project-definition/derived-codebase-facts";
import {
	getCodebaseStageDefinition,
	type CodebaseStageId,
} from "../stages/stage-definitions";

export type CodebaseReadiness = {
	isReady: boolean;
	missingFactKeys: CanonicalProjectFactKey[];
};

export type CodebaseReadinessResult = {
	codebase: CodebaseReadiness;
	review: CodebaseReadiness;
};

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

function getEffectiveFactValue(
	facts: CanonicalProjectFactsDraft,
	fieldKey: CanonicalProjectFactKey,
) {
	return deriveCodebaseFacts(facts)[fieldKey];
}

function getMissingFactKeys(
	facts: CanonicalProjectFactsDraft,
	fieldKeys: readonly CanonicalProjectFactKey[],
) {
	return fieldKeys.filter(
		(fieldKey) => !hasFactValue(getEffectiveFactValue(facts, fieldKey)),
	);
}

function getStageRequiredFieldKeys(stageId: CodebaseStageId) {
	const stage = getCodebaseStageDefinition(stageId);
	return stage.steps.flatMap(
		(step) => step.requiredFieldKeys ?? step.fieldKeys,
	);
}

function uniqueFactKeys(fieldKeys: CanonicalProjectFactKey[]) {
	return Array.from(new Set(fieldKeys));
}

export function evaluateCodebaseReadiness(
	facts: CanonicalProjectFactsDraft,
): CodebaseReadinessResult {
	const codebaseRequiredFieldKeys = uniqueFactKeys(
		getStageRequiredFieldKeys("codebase"),
	);
	const reviewMissingFactKeys = getMissingFactKeys(
		facts,
		codebaseRequiredFieldKeys,
	);
	const codebaseMissingFactKeys = reviewMissingFactKeys;

	return {
		codebase: {
			isReady: codebaseMissingFactKeys.length === 0,
			missingFactKeys: codebaseMissingFactKeys,
		},
		review: {
			isReady: reviewMissingFactKeys.length === 0,
			missingFactKeys: reviewMissingFactKeys,
		},
	};
}
