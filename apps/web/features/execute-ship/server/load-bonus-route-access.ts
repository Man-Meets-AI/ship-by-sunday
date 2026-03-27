import { api } from "@/convex/_generated/api";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";
import { isExecuteShipUnlocked } from "@/features/execute-ship/lib/bonus-route-access";

export type BonusRouteAccess = {
	workspaceState: PacketWorkspaceState;
	isUnlocked: boolean;
	hasStartedBonusLesson: boolean;
};

function requirePacketWorkspaceState(
	workspaceState: PacketWorkspaceState | null,
): PacketWorkspaceState {
	if (!workspaceState) {
		throw new Error("Packet workspace state missing");
	}

	return workspaceState;
}

export async function loadBonusRouteAccess(): Promise<BonusRouteAccess> {
	const workspaceState = requirePacketWorkspaceState(
		await fetchAuthenticatedQuery(api.packet.getPacketWorkspaceState, {}),
	);
	const isUnlocked = isExecuteShipUnlocked(workspaceState);

	if (!isUnlocked) {
		return {
			workspaceState,
			isUnlocked,
			hasStartedBonusLesson: false,
		};
	}

	const bonusRouteState = await fetchAuthenticatedQuery(
		api.course.getBonusRouteState,
		{},
	);

	return {
		workspaceState,
		isUnlocked,
		hasStartedBonusLesson: bonusRouteState?.hasStartedBonusLesson ?? false,
	};
}
