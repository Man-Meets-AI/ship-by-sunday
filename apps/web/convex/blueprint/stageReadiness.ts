import {
	deriveStageStatus,
	getBlueprintStageDefinition,
	parseCanonicalProjectFactsDraft,
} from "../../../../packages/blueprint-compiler/src";
import { resolveWorkspaceResumeDestination } from "../../features/workspace-navigation/lib/post-review-destination";

import { getProjectDefinitionByClerkUserId } from "./projectDefinition";
import type { BlueprintQueryCtx } from "./types";
import {
	blueprintResumeDestinationValidator,
	blueprintWorkspaceStateValidator,
} from "./validators";
import {
	getBlueprintWorkflowStateByClerkUserId,
	serializeBlueprintWorkflowState,
} from "./workflowState";
import { requireGrantedProductAccess } from "../access/model";
import { loadViewerCourseState } from "../course/shared";

export const getBlueprintWorkspaceStateArgs = {};
export const getBlueprintWorkspaceStateReturns =
	blueprintWorkspaceStateValidator;

export const getBlueprintResumeDestinationArgs = {};
export const getBlueprintResumeDestinationReturns =
	blueprintResumeDestinationValidator;

export async function getBlueprintWorkspaceStateHandler(
	ctx: BlueprintQueryCtx,
) {
	const clerkUserId = await requireGrantedProductAccess(ctx);
	const [projectDefinition, workflowState] = await Promise.all([
		getProjectDefinitionByClerkUserId(ctx, clerkUserId),
		getBlueprintWorkflowStateByClerkUserId(ctx, clerkUserId),
	]);
	const facts = parseCanonicalProjectFactsDraft(projectDefinition?.facts ?? {});
	const stageStatus = deriveStageStatus(facts);

	return {
		projectDefinition: projectDefinition
			? {
					clerkUserId: projectDefinition.clerkUserId,
					productKey: projectDefinition.productKey,
					schemaVersion: projectDefinition.schemaVersion,
					facts,
					placeholdersInUse: projectDefinition.placeholdersInUse,
					createdAt: projectDefinition.createdAt,
					updatedAt: projectDefinition.updatedAt,
				}
			: null,
		workflowState: workflowState
			? serializeBlueprintWorkflowState(workflowState)
			: null,
		firstIncompleteStageId: projectDefinition
			? stageStatus.firstIncompleteStageId
			: "start",
		blueprintReadiness: stageStatus.blueprintReadiness,
		stageStatuses: stageStatus.stageStatuses,
	};
}

export async function getBlueprintResumeDestinationHandler(
	ctx: BlueprintQueryCtx,
) {
	const workspaceState = await getBlueprintWorkspaceStateHandler(ctx);
	const blueprintStageDestination = getBlueprintStageDefinition(
		workspaceState.firstIncompleteStageId,
	).route;

	if (!workspaceState.workflowState?.executeShipUnlockedAt) {
		return resolveWorkspaceResumeDestination({
			executeShipUnlockedAt: null,
			firstIncompleteStageId: workspaceState.firstIncompleteStageId,
			blueprintStageDestination,
			postReviewLessonStates: [],
		});
	}

	const viewerState = await loadViewerCourseState(ctx);

	return resolveWorkspaceResumeDestination({
		executeShipUnlockedAt: workspaceState.workflowState.executeShipUnlockedAt,
		firstIncompleteStageId: workspaceState.firstIncompleteStageId,
		blueprintStageDestination,
		postReviewLessonStates: viewerState.lessonStates,
	});
}
