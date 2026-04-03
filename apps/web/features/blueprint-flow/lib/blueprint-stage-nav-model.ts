import {
	blueprintStageDefinitions,
	type BlueprintStageId,
	type BlueprintStageStatus,
} from "@blueprint-compiler";

export type BlueprintStageNavState =
	| "active"
	| "complete"
	| "available"
	| "locked";

export type BlueprintStageNavItem = {
	id: BlueprintStageId;
	label: string;
	route: string;
	state: BlueprintStageNavState;
};

export function buildBlueprintStageNavItems({
	currentStageId,
	stageStatuses,
}: {
	currentStageId?: BlueprintStageId;
	stageStatuses: BlueprintStageStatus[];
}): BlueprintStageNavItem[] {
	return blueprintStageDefinitions.map((stage) => {
		const stageStatus = stageStatuses.find((item) => item.stageId === stage.id);
		if (!stageStatus) {
			throw new Error(`Missing blueprint stage status for ${stage.id}`);
		}

		const state =
			stage.id === currentStageId
				? "active"
				: !stageStatus.isUnlocked
					? "locked"
					: stageStatus.isComplete
						? "complete"
						: "available";

		return {
			id: stage.id,
			label: stage.label,
			route: stage.route,
			state,
		} satisfies BlueprintStageNavItem;
	});
}
