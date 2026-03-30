import {
	packetStageDefinitions,
	type PacketStageDefinition,
	type PacketStageId,
	type PacketStageStatus,
} from "@packet-compiler";
import { derivePacketStageProgressItems } from "./packet-stage-progress";
import {
	getPacketStageStepHref,
	type RoutedPacketStageId,
} from "./packet-stage-routes";

export type PacketStageRailState =
	| "active"
	| "complete"
	| "available"
	| "locked";

export type PacketStageRailStepState =
	| "active"
	| "complete"
	| "open"
	| "locked";

export type PacketStageRailStepItem = {
	id: string;
	label: string;
	href: string;
	stepNumber: number;
	state: PacketStageRailStepState;
};

export type PacketStageRailItem = {
	id: PacketStageId;
	label: string;
	route: string;
	state: PacketStageRailState;
	stepItems: PacketStageRailStepItem[];
};

function buildPacketStageRailStepItems(
	stageId: RoutedPacketStageId,
	stage: PacketStageDefinition,
	stageStatus: PacketStageStatus,
	activeStepId: string | undefined,
) {
	if (!stage.steps.length) {
		return [];
	}

	if (!stageStatus.isUnlocked) {
		return stage.steps.map((step, index) => ({
			id: step.id,
			label: step.label,
			href: getPacketStageStepHref(stageId, step.id),
			stepNumber: index + 1,
			state: "locked" as const,
		}));
	}

	const progressItems = derivePacketStageProgressItems(
		stage,
		stageStatus,
		activeStepId ?? "",
	);

	return progressItems.map((item) => ({
		id: item.id,
		label: item.label,
		href: getPacketStageStepHref(stageId, item.id),
		stepNumber: item.stepNumber,
		state: item.state,
	}));
}

export function buildPacketStageRailItems({
	activeStepId,
	currentStageId,
	stageStatuses,
}: {
	activeStepId?: string;
	currentStageId: PacketStageId;
	stageStatuses: PacketStageStatus[];
}): PacketStageRailItem[] {
	return packetStageDefinitions.map((stage) => {
		const stageStatus = stageStatuses.find((item) => item.stageId === stage.id);
		if (!stageStatus) {
			throw new Error(`Missing packet stage status for ${stage.id}`);
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
			stepItems: buildPacketStageRailStepItems(
				stage.id as RoutedPacketStageId,
				stage,
				stageStatus,
				isCurrent ? activeStepId : undefined,
			),
		} satisfies PacketStageRailItem;
	});
}
