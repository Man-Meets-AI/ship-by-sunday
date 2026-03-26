import "server-only";

import { redirect, notFound } from "next/navigation";
import type { PacketStageStatus } from "@packet-compiler";
import { getPacketStageDefinition } from "@packet-compiler";
import { api } from "@/convex/_generated/api";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import {
	getPacketStageEntryHref,
	isPacketStageStepId,
	type RoutedPacketStageId,
} from "@/features/packet-flow/lib/packet-stage-routes";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

async function getRequiredPacketWorkspaceState(): Promise<PacketWorkspaceState> {
	const workspaceState = await fetchAuthenticatedQuery(
		api.packet.getPacketWorkspaceState,
		{},
	);
	if (!workspaceState) {
		throw new Error("Packet workspace state missing");
	}

	return workspaceState;
}

function getRequiredStageStatus(
	workspaceState: PacketWorkspaceState,
	stageId: RoutedPacketStageId,
): PacketStageStatus {
	const stageStatus = workspaceState.stageStatuses.find(
		(item) => item.stageId === stageId,
	);
	if (!stageStatus) {
		throw new Error(`Missing packet stage status for ${stageId}`);
	}

	return stageStatus;
}

export async function redirectToPacketStageEntry(stageId: RoutedPacketStageId) {
	const workspaceState = await getRequiredPacketWorkspaceState();
	const stageStatus = getRequiredStageStatus(workspaceState, stageId);
	if (!stageStatus.isUnlocked) {
		redirect(
			getPacketStageDefinition(workspaceState.firstIncompleteStageId).route,
		);
	}

	redirect(getPacketStageEntryHref(stageId, stageStatus));
}

export async function loadPacketStageRouteData(
	stageId: RoutedPacketStageId,
	stepId: string,
) {
	if (!isPacketStageStepId(stageId, stepId)) {
		notFound();
	}

	const workspaceState = await getRequiredPacketWorkspaceState();
	const stageStatus = getRequiredStageStatus(workspaceState, stageId);
	if (!stageStatus.isUnlocked) {
		redirect(
			getPacketStageDefinition(workspaceState.firstIncompleteStageId).route,
		);
	}

	return {
		initialWorkspaceState: workspaceState,
		stepId,
	};
}
