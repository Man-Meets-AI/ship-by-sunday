import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "../canonical-project-definition/project-definition";
import {
	getPacketStageDefinition,
	packetStageDefinitions,
	type PacketStageId,
} from "../stages/stage-definitions";
import {
	evaluatePacketReadiness,
	type PacketReadinessResult,
} from "./evaluate-packet-readiness";

export type PacketStageStatus = {
	stageId: PacketStageId;
	isUnlocked: boolean;
	isComplete: boolean;
	currentStepIndex: number;
	missingFactKeys: CanonicalProjectFactKey[];
};

export type DerivedStageStatus = {
	firstIncompleteStageId: PacketStageId;
	packetReadiness: PacketReadinessResult;
	stageStatuses: PacketStageStatus[];
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
	stageId: PacketStageId,
) {
	const stage = getPacketStageDefinition(stageId);

	return stage.steps.flatMap((step) =>
		(step.requiredFieldKeys ?? step.fieldKeys).filter((fieldKey) =>
			isMissingValue(facts, fieldKey),
		),
	);
}

function getCurrentStepIndex(
	facts: CanonicalProjectFactsDraft,
	stageId: PacketStageId,
) {
	const stage = getPacketStageDefinition(stageId);

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
	const packetReadiness = evaluatePacketReadiness(facts);
	let previousStageComplete = true;
	let firstIncompleteStageId: PacketStageId | null = null;

	const stageStatuses = packetStageDefinitions.map((stage) => {
		if (stage.id === "start") {
			return {
				stageId: stage.id,
				isUnlocked: true,
				isComplete: true,
				currentStepIndex: 0,
				missingFactKeys: [],
			} satisfies PacketStageStatus;
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
		} satisfies PacketStageStatus;
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
		packetReadiness,
		stageStatuses,
	};
}
