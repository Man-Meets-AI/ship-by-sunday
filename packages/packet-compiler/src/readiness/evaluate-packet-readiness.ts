import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "../canonical-project-definition/project-definition";
import {
	getPacketStageDefinition,
	type PacketStageId,
} from "../stages/stage-definitions";

export type PacketReadiness = {
	isReady: boolean;
	missingFactKeys: CanonicalProjectFactKey[];
};

export type PacketReadinessResult = {
	product: PacketReadiness;
	design: PacketReadiness;
	marketing: PacketReadiness;
	build: PacketReadiness;
	review: PacketReadiness;
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
	if (fieldKey === "surface_type") {
		return facts.surface_type ?? "web_app";
	}

	return facts[fieldKey];
}

function getMissingFactKeys(
	facts: CanonicalProjectFactsDraft,
	fieldKeys: readonly CanonicalProjectFactKey[],
) {
	return fieldKeys.filter(
		(fieldKey) => !hasFactValue(getEffectiveFactValue(facts, fieldKey)),
	);
}

function getStageRequiredFieldKeys(stageId: PacketStageId) {
	const stage = getPacketStageDefinition(stageId);
	return stage.steps.flatMap(
		(step) => step.requiredFieldKeys ?? step.fieldKeys,
	);
}

function uniqueFactKeys(fieldKeys: CanonicalProjectFactKey[]) {
	return Array.from(new Set(fieldKeys));
}

export function evaluatePacketReadiness(
	facts: CanonicalProjectFactsDraft,
): PacketReadinessResult {
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
