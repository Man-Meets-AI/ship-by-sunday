import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";

export function isExecuteShipUnlocked(workspaceState: PacketWorkspaceState) {
	return Boolean(workspaceState.workflowState?.executeShipUnlockedAt);
}
