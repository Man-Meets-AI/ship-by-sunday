import "server-only";

import { api } from "@/convex/_generated/api";
import type { CodebaseWorkspaceState } from "@/lib/codebase-flow/codebase-workspace-types";
import { isExecuteShipUnlocked } from "@/lib/execute-ship/bonus-route-access";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export type BonusRouteAccess = {
	workspaceState: CodebaseWorkspaceState;
	isUnlocked: boolean;
	hasStartedBonusLesson: boolean;
};

function requireCodebaseWorkspaceState(
	workspaceState: CodebaseWorkspaceState | null,
): CodebaseWorkspaceState {
	if (!workspaceState) {
		throw new Error("Codebase workspace state missing");
	}

	return workspaceState;
}

export async function loadBonusRouteAccess(): Promise<BonusRouteAccess> {
	const workspaceState = requireCodebaseWorkspaceState(
		await fetchAuthenticatedQuery(api.codebase.getCodebaseWorkspaceState, {}),
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
