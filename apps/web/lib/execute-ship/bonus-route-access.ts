import type { BlueprintWorkspaceState } from "@/lib/blueprint-flow/blueprint-workspace-types";

export function isExecuteShipUnlocked(workspaceState: BlueprintWorkspaceState) {
	return Boolean(workspaceState.workflowState?.executeShipUnlockedAt);
}
