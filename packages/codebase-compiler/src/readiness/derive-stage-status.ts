import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "../canonical-project-definition/project-definition";
import { deriveCodebaseFacts } from "../canonical-project-definition/derived-codebase-facts";
import {
	getCodebaseStageDefinition,
	codebaseStageDefinitions,
	type CodebaseStageId,
} from "../stages/stage-definitions";
import {
	evaluateCodebaseReadiness,
	type CodebaseReadinessResult,
} from "./evaluate-codebase-readiness";

export type CodebaseStageStatus = {
	stageId: CodebaseStageId;
	isUnlocked: boolean;
	isComplete: boolean;
	currentStepIndex: number;
	missingFactKeys: CanonicalProjectFactKey[];
};

export type DerivedStageStatus = {
	firstIncompleteStageId: CodebaseStageId;
	codebaseReadiness: CodebaseReadinessResult;
	stageStatuses: CodebaseStageStatus[];
};

function isMissingValue(
	facts: CanonicalProjectFactsDraft,
	fieldKey: CanonicalProjectFactKey,
) {
	const normalizedFacts = deriveCodebaseFacts(facts);
	const value = normalizedFacts[fieldKey];

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
	stageId: CodebaseStageId,
) {
	const stage = getCodebaseStageDefinition(stageId);

	return stage.steps.flatMap((step) =>
		(step.requiredFieldKeys ?? step.fieldKeys).filter((fieldKey) =>
			isMissingValue(facts, fieldKey),
		),
	);
}

function getCurrentStepIndex(
	facts: CanonicalProjectFactsDraft,
	stageId: CodebaseStageId,
) {
	const stage = getCodebaseStageDefinition(stageId);

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
	const codebaseReadiness = evaluateCodebaseReadiness(facts);
	let previousStageComplete = true;
	let firstIncompleteStageId: CodebaseStageId | null = null;

	const stageStatuses = codebaseStageDefinitions.map((stage) => {
		const missingFactKeys =
			stage.id === "review"
				? codebaseReadiness.review.missingFactKeys
				: Array.from(new Set(stageCompletionMissingFactKeys(facts, stage.id)));
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
		} satisfies CodebaseStageStatus;
		previousStageComplete = previousStageComplete && isComplete;
		return status;
	});

	return {
		firstIncompleteStageId: firstIncompleteStageId ?? "review",
		codebaseReadiness,
		stageStatuses,
	};
}
