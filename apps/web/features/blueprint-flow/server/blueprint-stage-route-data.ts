import "server-only";

import { redirect, notFound } from "next/navigation";
import type { BlueprintStageStatus } from "@blueprint-compiler";
import { getBlueprintStageDefinition } from "@blueprint-compiler";
import { api } from "@/convex/_generated/api";
import type { BlueprintWorkspaceState } from "@/features/blueprint-flow/lib/blueprint-workspace-types";
import {
	getBlueprintStageEntryHref,
	isBlueprintStageStepId,
	type RoutedBlueprintStageId,
} from "@/features/blueprint-flow/lib/blueprint-stage-routes";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

async function getRequiredBlueprintWorkspaceState(): Promise<BlueprintWorkspaceState> {
	const workspaceState = await fetchAuthenticatedQuery(
		api.blueprint.getBlueprintWorkspaceState,
		{},
	);
	if (!workspaceState) {
		throw new Error("Blueprint workspace state missing");
	}

	return workspaceState;
}

function getRequiredStageStatus(
	workspaceState: BlueprintWorkspaceState,
	stageId: RoutedBlueprintStageId,
): BlueprintStageStatus {
	const stageStatus = workspaceState.stageStatuses.find(
		(item) => item.stageId === stageId,
	);
	if (!stageStatus) {
		throw new Error(`Missing blueprint stage status for ${stageId}`);
	}

	return stageStatus;
}

export async function redirectToBlueprintStageEntry(
	stageId: RoutedBlueprintStageId,
) {
	const workspaceState = await getRequiredBlueprintWorkspaceState();
	const stageStatus = getRequiredStageStatus(workspaceState, stageId);
	if (!stageStatus.isUnlocked) {
		redirect(
			getBlueprintStageDefinition(workspaceState.firstIncompleteStageId).route,
		);
	}

	redirect(getBlueprintStageEntryHref(stageId, stageStatus));
}

export async function loadBlueprintStageRouteData(
	stageId: RoutedBlueprintStageId,
	stepId: string,
) {
	if (!isBlueprintStageStepId(stageId, stepId)) {
		notFound();
	}

	const workspaceState = await getRequiredBlueprintWorkspaceState();
	const stageStatus = getRequiredStageStatus(workspaceState, stageId);
	if (!stageStatus.isUnlocked) {
		redirect(
			getBlueprintStageDefinition(workspaceState.firstIncompleteStageId).route,
		);
	}

	return {
		initialWorkspaceState: workspaceState,
		stepId,
	};
}
