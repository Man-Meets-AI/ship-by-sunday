import {
	packetStageDefinitions,
	type PacketStageId,
	type PacketStageStatus,
} from "@packet-compiler";

export type PacketStageNavState =
	| "active"
	| "complete"
	| "available"
	| "locked";

export type PacketStageNavItem = {
	id: PacketStageId;
	label: string;
	route: string;
	state: PacketStageNavState;
};

export function buildPacketStageNavItems({
	currentStageId,
	stageStatuses,
}: {
	currentStageId?: PacketStageId;
	stageStatuses: PacketStageStatus[];
}): PacketStageNavItem[] {
	return packetStageDefinitions.map((stage) => {
		const stageStatus = stageStatuses.find((item) => item.stageId === stage.id);
		if (!stageStatus) {
			throw new Error(`Missing packet stage status for ${stage.id}`);
		}

		const state =
			stage.id === currentStageId
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
		} satisfies PacketStageNavItem;
	});
}
