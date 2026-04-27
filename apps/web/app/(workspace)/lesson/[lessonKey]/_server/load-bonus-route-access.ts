import "server-only";

import { api } from "@/convex/_generated/api";
import type { BlueprintWorkspaceState } from "@/lib/blueprint-flow/blueprint-workspace-types";
import { isExecuteShipUnlocked } from "@/lib/execute-ship/bonus-route-access";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export type BonusRouteAccess = {
	workspaceState: BlueprintWorkspaceState;
	isUnlocked: boolean;
	hasStartedBonusLesson: boolean;
};

function requireBlueprintWorkspaceState(
	workspaceState: BlueprintWorkspaceState | null,
): BlueprintWorkspaceState {
	if (!workspaceState) {
		throw new Error("Blueprint workspace state missing");
	}

	return workspaceState;
}

export async function loadBonusRouteAccess(): Promise<BonusRouteAccess> {
	const workspaceState = requireBlueprintWorkspaceState(
		await fetchAuthenticatedQuery(api.blueprint.getBlueprintWorkspaceState, {}),
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
