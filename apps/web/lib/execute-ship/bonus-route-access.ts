import type { CodebaseWorkspaceState } from "@/lib/codebase-flow/codebase-workspace-types";

export function isExecuteShipUnlocked(workspaceState: CodebaseWorkspaceState) {
	return Boolean(workspaceState.workflowState?.executeShipUnlockedAt);
}
