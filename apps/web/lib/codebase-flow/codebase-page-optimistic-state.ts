import type { OptimisticLocalStore } from "convex/browser";
import type { CanonicalProjectFactsDraft } from "@shipbysunday/codebase-compiler";
import {
	createCanonicalProjectDefinitionDraft,
	deriveStageStatus,
	placeholderFriendlyFactKeys,
} from "@shipbysunday/codebase-compiler";
import { PRODUCT_APP_ID } from "@/config/product";
import { api } from "@/convex/_generated/api";
import {
	buildNextProjectFacts,
	type SaveProjectDefinitionFactsArgs,
} from "@/lib/codebase-flow/codebase-page-draft-model";
import type { CodebaseWorkspaceState } from "@/lib/codebase-flow/codebase-workspace-types";

const OPTIMISTIC_CODEBASE_CLERK_USER_ID = "optimistic-local-user";

function buildPlaceholdersInUse(facts: CanonicalProjectFactsDraft) {
	return placeholderFriendlyFactKeys.filter(
		(fieldKey) => facts[fieldKey] === undefined,
	);
}

function buildOptimisticCodebaseWorkspaceState(
	currentWorkspaceState: CodebaseWorkspaceState,
	args: SaveProjectDefinitionFactsArgs,
): CodebaseWorkspaceState {
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
					OPTIMISTIC_CODEBASE_CLERK_USER_ID,
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
		codebaseReadiness: nextStageStatus.codebaseReadiness,
		stageStatuses: nextStageStatus.stageStatuses,
	};
}

export function applyOptimisticCodebaseWorkspaceUpdate(
	localStore: OptimisticLocalStore,
	args: SaveProjectDefinitionFactsArgs,
) {
	const currentWorkspaceState = localStore.getQuery(
		api.codebase.getCodebaseWorkspaceState,
		{},
	);
	if (!currentWorkspaceState) {
		return;
	}

	localStore.setQuery(
		api.codebase.getCodebaseWorkspaceState,
		{},
		buildOptimisticCodebaseWorkspaceState(currentWorkspaceState, args),
	);
}
