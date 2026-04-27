import type { BlueprintWorkspaceState } from "@/features/blueprint-flow/lib/blueprint-workspace-types";

export function isExecuteShipUnlocked(workspaceState: BlueprintWorkspaceState) {
	return Boolean(workspaceState.workflowState?.executeShipUnlockedAt);
}
