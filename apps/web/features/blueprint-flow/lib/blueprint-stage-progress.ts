import type {
	CanonicalProjectFactKey,
	BlueprintStageDefinition,
	BlueprintStageStatus,
} from "@blueprint-compiler";

export type BlueprintStageStepProgressState = "active" | "complete" | "open";

export type BlueprintStageProgressItem = {
	id: string;
	label: string;
	stepNumber: number;
	state: BlueprintStageStepProgressState;
	isCurrentObjective: boolean;
	missingRequiredFactKeys: CanonicalProjectFactKey[];
};

export function deriveBlueprintStageProgressItems(
	stage: BlueprintStageDefinition,
	stageStatus: BlueprintStageStatus,
	activeStepId: string,
) {
	const missingFactKeys = new Set(stageStatus.missingFactKeys);

	return stage.steps.map((step, index) => {
		const requiredFieldKeys = step.requiredFieldKeys ?? step.fieldKeys;
		const missingRequiredFactKeys = requiredFieldKeys.filter((fieldKey) =>
			missingFactKeys.has(fieldKey),
		);
		const isActive = step.id === activeStepId;
		const isComplete = missingRequiredFactKeys.length === 0;

		return {
			id: step.id,
			label: step.label,
			stepNumber: index + 1,
			state: isActive ? "active" : isComplete ? "complete" : "open",
			isCurrentObjective:
				!stageStatus.isComplete && index === stageStatus.currentStepIndex,
			missingRequiredFactKeys,
		} satisfies BlueprintStageProgressItem;
	});
}
