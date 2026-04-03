import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "../canonical-project-definition/project-definition";
import { deriveBlueprintFacts } from "../canonical-project-definition/derived-blueprint-facts";
import {
	getBlueprintStageDefinition,
	type BlueprintStageId,
} from "../stages/stage-definitions";

export type BlueprintReadiness = {
	isReady: boolean;
	missingFactKeys: CanonicalProjectFactKey[];
};

export type BlueprintReadinessResult = {
	product: BlueprintReadiness;
	design: BlueprintReadiness;
	marketing: BlueprintReadiness;
	build: BlueprintReadiness;
	review: BlueprintReadiness;
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
	return deriveBlueprintFacts(facts)[fieldKey];
}

function getMissingFactKeys(
	facts: CanonicalProjectFactsDraft,
	fieldKeys: readonly CanonicalProjectFactKey[],
) {
	return fieldKeys.filter(
		(fieldKey) => !hasFactValue(getEffectiveFactValue(facts, fieldKey)),
	);
}

function getStageRequiredFieldKeys(stageId: BlueprintStageId) {
	const stage = getBlueprintStageDefinition(stageId);
	return stage.steps.flatMap(
		(step) => step.requiredFieldKeys ?? step.fieldKeys,
	);
}

function uniqueFactKeys(fieldKeys: CanonicalProjectFactKey[]) {
	return Array.from(new Set(fieldKeys));
}

export function evaluateBlueprintReadiness(
	facts: CanonicalProjectFactsDraft,
): BlueprintReadinessResult {
	const productRequiredFieldKeys = getStageRequiredFieldKeys("product");
	const designRequiredFieldKeys = uniqueFactKeys([
		...productRequiredFieldKeys,
		...getStageRequiredFieldKeys("design"),
	]);
	const marketingRequiredFieldKeys = uniqueFactKeys([
		...designRequiredFieldKeys,
		...getStageRequiredFieldKeys("marketing"),
	]);
	const buildRequiredFieldKeys = uniqueFactKeys([
		...designRequiredFieldKeys,
		...getStageRequiredFieldKeys("build-plan"),
	]);
	const reviewRequiredFieldKeys = uniqueFactKeys([
		...marketingRequiredFieldKeys,
		...buildRequiredFieldKeys,
	]);

	const productMissingFactKeys = getMissingFactKeys(
		facts,
		productRequiredFieldKeys,
	);
	const designMissingFactKeys = getMissingFactKeys(
		facts,
		designRequiredFieldKeys,
	);
	const marketingMissingFactKeys = getMissingFactKeys(
		facts,
		marketingRequiredFieldKeys,
	);
	const buildMissingFactKeys = getMissingFactKeys(
		facts,
		buildRequiredFieldKeys,
	);
	const reviewMissingFactKeys = getMissingFactKeys(
		facts,
		reviewRequiredFieldKeys,
	);

	return {
		product: {
			isReady: productMissingFactKeys.length === 0,
			missingFactKeys: productMissingFactKeys,
		},
		design: {
			isReady: designMissingFactKeys.length === 0,
			missingFactKeys: designMissingFactKeys,
		},
		marketing: {
			isReady: marketingMissingFactKeys.length === 0,
			missingFactKeys: marketingMissingFactKeys,
		},
		build: {
			isReady: buildMissingFactKeys.length === 0,
			missingFactKeys: buildMissingFactKeys,
		},
		review: {
			isReady: reviewMissingFactKeys.length === 0,
			missingFactKeys: reviewMissingFactKeys,
		},
	};
}
