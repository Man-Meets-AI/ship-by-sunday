import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "../canonical-project-definition/project-definition";
import {
	getBlueprintStageDefinition,
	blueprintStageDefinitions,
	type BlueprintStageId,
} from "../stages/stage-definitions";
import {
	evaluateBlueprintReadiness,
	type BlueprintReadinessResult,
} from "./evaluate-blueprint-readiness";

export type BlueprintStageStatus = {
	stageId: BlueprintStageId;
	isUnlocked: boolean;
	isComplete: boolean;
	currentStepIndex: number;
	missingFactKeys: CanonicalProjectFactKey[];
};

export type DerivedStageStatus = {
	firstIncompleteStageId: BlueprintStageId;
	blueprintReadiness: BlueprintReadinessResult;
	stageStatuses: BlueprintStageStatus[];
};

function isMissingValue(
	facts: CanonicalProjectFactsDraft,
	fieldKey: CanonicalProjectFactKey,
) {
	const value =
		fieldKey === "surface_type"
			? (facts.surface_type ?? "web_app")
			: facts[fieldKey];

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

function stageCompletionMissingFactKeys(
	facts: CanonicalProjectFactsDraft,
	stageId: BlueprintStageId,
) {
	const stage = getBlueprintStageDefinition(stageId);

	return stage.steps.flatMap((step) =>
		(step.requiredFieldKeys ?? step.fieldKeys).filter((fieldKey) =>
			isMissingValue(facts, fieldKey),
		),
	);
}

function getCurrentStepIndex(
	facts: CanonicalProjectFactsDraft,
	stageId: BlueprintStageId,
) {
	const stage = getBlueprintStageDefinition(stageId);

	const incompleteStepIndex = stage.steps.findIndex((step) =>
		(step.requiredFieldKeys ?? step.fieldKeys).some((fieldKey) =>
			isMissingValue(facts, fieldKey),
		),
	);

	return Math.max(0, incompleteStepIndex);
}

export function deriveStageStatus(
	facts: CanonicalProjectFactsDraft,
): DerivedStageStatus {
	const blueprintReadiness = evaluateBlueprintReadiness(facts);
	let previousStageComplete = true;
	let firstIncompleteStageId: BlueprintStageId | null = null;

	const stageStatuses = blueprintStageDefinitions.map((stage) => {
		if (stage.id === "start") {
			return {
				stageId: stage.id,
				isUnlocked: true,
				isComplete: true,
				currentStepIndex: 0,
				missingFactKeys: [],
			} satisfies BlueprintStageStatus;
		}

		const missingFactKeys = Array.from(
			new Set(stageCompletionMissingFactKeys(facts, stage.id)),
		);
		const isComplete = missingFactKeys.length === 0;

		if (firstIncompleteStageId === null && !isComplete) {
			firstIncompleteStageId = stage.id;
		}

		const status = {
			stageId: stage.id,
			isUnlocked: previousStageComplete,
			isComplete,
			currentStepIndex: getCurrentStepIndex(facts, stage.id),
			missingFactKeys,
		} satisfies BlueprintStageStatus;
		previousStageComplete = previousStageComplete && isComplete;
		return status;
	});

	return {
		firstIncompleteStageId:
			firstIncompleteStageId ??
			(stageStatuses.every(
				(stage) => stage.stageId === "start" || stage.isComplete,
			)
				? "review"
				: "product"),
		blueprintReadiness,
		stageStatuses,
	};
}
