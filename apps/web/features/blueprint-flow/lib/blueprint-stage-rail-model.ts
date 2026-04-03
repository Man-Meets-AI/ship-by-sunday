import {
	blueprintStageDefinitions,
	type BlueprintStageDefinition,
	type BlueprintStageId,
	type BlueprintStageStatus,
} from "@blueprint-compiler";
import { deriveBlueprintStageProgressItems } from "./blueprint-stage-progress";
import {
	getBlueprintStageStepHref,
	type RoutedBlueprintStageId,
} from "./blueprint-stage-routes";

export type BlueprintStageRailState =
	| "active"
	| "complete"
	| "available"
	| "locked";

export type BlueprintStageRailStepState =
	| "active"
	| "complete"
	| "open"
	| "locked";

export type BlueprintStageRailStepItem = {
	id: string;
	label: string;
	href: string;
	stepNumber: number;
	state: BlueprintStageRailStepState;
};

export type BlueprintStageRailItem = {
	id: BlueprintStageId;
	label: string;
	route: string;
	state: BlueprintStageRailState;
	stepItems: BlueprintStageRailStepItem[];
};

function buildBlueprintStageRailStepItems(
	stageId: RoutedBlueprintStageId,
	stage: BlueprintStageDefinition,
	stageStatus: BlueprintStageStatus,
	activeStepId: string | undefined,
) {
	if (!stage.steps.length) {
		return [];
	}

	if (!stageStatus.isUnlocked) {
		return stage.steps.map((step, index) => ({
			id: step.id,
			label: step.label,
			href: getBlueprintStageStepHref(stageId, step.id),
			stepNumber: index + 1,
			state: "locked" as const,
		}));
	}

	const progressItems = deriveBlueprintStageProgressItems(
		stage,
		stageStatus,
		activeStepId ?? "",
	);

	return progressItems.map((item) => ({
		id: item.id,
		label: item.label,
		href: getBlueprintStageStepHref(stageId, item.id),
		stepNumber: item.stepNumber,
		state: item.state,
	}));
}

export function buildBlueprintStageRailItems({
	activeStepId,
	currentStageId,
	stageStatuses,
}: {
	activeStepId?: string;
	currentStageId: BlueprintStageId;
	stageStatuses: BlueprintStageStatus[];
}): BlueprintStageRailItem[] {
	return blueprintStageDefinitions.map((stage) => {
		const stageStatus = stageStatuses.find((item) => item.stageId === stage.id);
		if (!stageStatus) {
			throw new Error(`Missing blueprint stage status for ${stage.id}`);
		}

		const isCurrent = stage.id === currentStageId;
		const state = isCurrent
			? "active"
			: !stageStatus.isUnlocked && stage.id !== "start"
				? "locked"
				: stageStatus.isComplete
					? "complete"
					: "available";

		return {
			id: stage.id,
			label: stage.label,
			route: stage.route,
			state,
			stepItems: buildBlueprintStageRailStepItems(
				stage.id as RoutedBlueprintStageId,
				stage,
				stageStatus,
				isCurrent ? activeStepId : undefined,
			),
		} satisfies BlueprintStageRailItem;
	});
}
