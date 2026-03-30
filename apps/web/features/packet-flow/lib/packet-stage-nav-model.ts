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

export type PacketStageNavItem = {
	id: PacketStageId;
	label: string;
	route: string;
	isCurrent: boolean;
	isOpen: boolean;
	isComplete: boolean;
	stepItems: PacketStageNavStepItem[];
};

export type PacketStageNavStepItem = {
	id: string;
	label: string;
	href: string;
	stepNumber: number;
	state: "active" | "complete" | "open";
};

function buildPacketStageNavStepItems(
	stageId: RoutedPacketStageId,
	stage: PacketStageDefinition,
	stageStatus: PacketStageStatus,
	activeStepId: string | undefined,
) {
	if (stage.steps.length === 0) {
		return [];
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

export function buildPacketStageNavItems({
	activeStepId,
	currentStageId,
	stageStatuses,
}: {
	activeStepId?: string;
	currentStageId: PacketStageId;
	stageStatuses: PacketStageStatus[];
}): PacketStageNavItem[] {
	return packetStageDefinitions.map((stage) => {
		const stageStatus = stageStatuses.find((item) => item.stageId === stage.id);
		if (!stageStatus) {
			throw new Error(`Missing packet stage status for ${stage.id}`);
		}

		const isCurrent = stage.id === currentStageId;
		const isOpen =
			stage.id === "start" ||
			stage.id === "review" ||
			isCurrent ||
			stageStatus.isUnlocked;
		const stepItems =
			stage.steps.length === 0
				? []
				: buildPacketStageNavStepItems(
						stage.id as RoutedPacketStageId,
						stage,
						stageStatus,
						isCurrent ? activeStepId : undefined,
					);

		return {
			id: stage.id,
			label: stage.label,
			route: stage.route,
			isCurrent,
			isOpen,
			isComplete: stageStatus.isComplete,
			stepItems,
		} satisfies PacketStageNavItem;
	});
}
