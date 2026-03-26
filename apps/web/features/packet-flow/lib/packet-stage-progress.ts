import type {
	CanonicalProjectFactKey,
	PacketStageDefinition,
	PacketStageStatus,
} from "@packet-compiler";

export type PacketStageStepProgressState = "active" | "complete" | "open";

export type PacketStageProgressItem = {
	id: string;
	label: string;
	stepNumber: number;
	state: PacketStageStepProgressState;
	isCurrentObjective: boolean;
	missingRequiredFactKeys: CanonicalProjectFactKey[];
};

export function derivePacketStageProgressItems(
	stage: PacketStageDefinition,
	stageStatus: PacketStageStatus,
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
		} satisfies PacketStageProgressItem;
	});
}
