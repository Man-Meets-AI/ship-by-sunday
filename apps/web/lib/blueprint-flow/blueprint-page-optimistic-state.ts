import type { OptimisticLocalStore } from "convex/browser";
import type { CanonicalProjectFactsDraft } from "@shipbysunday/blueprint-compiler";
import {
	createCanonicalProjectDefinitionDraft,
	deriveStageStatus,
	placeholderFriendlyFactKeys,
} from "@shipbysunday/blueprint-compiler";
import { PRODUCT_APP_ID } from "@/config/product";
import { api } from "@/convex/_generated/api";
import {
	buildNextProjectFacts,
	type SaveProjectDefinitionFactsArgs,
} from "@/lib/blueprint-flow/blueprint-page-draft-model";
import type { BlueprintWorkspaceState } from "@/lib/blueprint-flow/blueprint-workspace-types";

const OPTIMISTIC_BLUEPRINT_CLERK_USER_ID = "optimistic-local-user";

function buildPlaceholdersInUse(facts: CanonicalProjectFactsDraft) {
	return placeholderFriendlyFactKeys.filter(
		(fieldKey) => facts[fieldKey] === undefined,
	);
}

function buildOptimisticBlueprintWorkspaceState(
	currentWorkspaceState: BlueprintWorkspaceState,
	args: SaveProjectDefinitionFactsArgs,
): BlueprintWorkspaceState {
	const nextFacts = buildNextProjectFacts(
		currentWorkspaceState.projectDefinition?.facts ?? {},
		args,
	);
	const nextStageStatus = deriveStageStatus(nextFacts);
	const now = Date.now();
	const currentProjectDefinition = currentWorkspaceState.projectDefinition;
	const nextProjectDefinition = currentProjectDefinition
		? {
				...currentProjectDefinition,
				facts: nextFacts,
				placeholdersInUse: buildPlaceholdersInUse(nextFacts),
				updatedAt: now,
			}
		: createCanonicalProjectDefinitionDraft({
				clerkUserId:
					currentWorkspaceState.workflowState?.clerkUserId ??
					OPTIMISTIC_BLUEPRINT_CLERK_USER_ID,
				productKey: PRODUCT_APP_ID,
				facts: nextFacts,
				placeholdersInUse: buildPlaceholdersInUse(nextFacts),
				createdAt: now,
				updatedAt: now,
			});

	return {
		...currentWorkspaceState,
		projectDefinition: nextProjectDefinition,
		firstIncompleteStageId: nextStageStatus.firstIncompleteStageId,
		blueprintReadiness: nextStageStatus.blueprintReadiness,
		stageStatuses: nextStageStatus.stageStatuses,
	};
}

export function applyOptimisticBlueprintWorkspaceUpdate(
	localStore: OptimisticLocalStore,
	args: SaveProjectDefinitionFactsArgs,
) {
	const currentWorkspaceState = localStore.getQuery(
		api.blueprint.getBlueprintWorkspaceState,
		{},
	);
	if (!currentWorkspaceState) {
		return;
	}

	localStore.setQuery(
		api.blueprint.getBlueprintWorkspaceState,
		{},
		buildOptimisticBlueprintWorkspaceState(currentWorkspaceState, args),
	);
}
