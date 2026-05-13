import {
	deriveStageStatus,
	getCodebaseStageDefinition,
	parseCanonicalProjectFactsDraft,
} from "../../../../packages/codebase-compiler/src";
import { resolveWorkspaceResumeDestination } from "../../src/lib/workspace-navigation/post-review-destination";

import { getProjectDefinitionByClerkUserId } from "./projectDefinition";
import type { CodebaseQueryCtx } from "./types";
import {
	codebaseResumeDestinationValidator,
	codebaseWorkspaceStateValidator,
} from "./validators";
import {
	getCodebaseWorkflowStateByClerkUserId,
	serializeCodebaseWorkflowState,
} from "./workflowState";
import { requireGeneratedCodebaseProductAccess } from "../access/model";
import { loadViewerCourseState } from "../course/shared";

export const getCodebaseWorkspaceStateArgs = {};
export const getCodebaseWorkspaceStateReturns = codebaseWorkspaceStateValidator;

export const getCodebaseResumeDestinationArgs = {};
export const getCodebaseResumeDestinationReturns =
	codebaseResumeDestinationValidator;

export async function getCodebaseWorkspaceStateHandler(ctx: CodebaseQueryCtx) {
	const clerkUserId = await requireGeneratedCodebaseProductAccess(ctx);
	const [projectDefinition, workflowState] = await Promise.all([
		getProjectDefinitionByClerkUserId(ctx, clerkUserId),
		getCodebaseWorkflowStateByClerkUserId(ctx, clerkUserId),
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
			? serializeCodebaseWorkflowState(workflowState)
			: null,
		firstIncompleteStageId: projectDefinition
			? stageStatus.firstIncompleteStageId
			: "codebase",
		codebaseReadiness: stageStatus.codebaseReadiness,
		stageStatuses: stageStatus.stageStatuses,
	};
}

export async function getCodebaseResumeDestinationHandler(
	ctx: CodebaseQueryCtx,
) {
	const workspaceState = await getCodebaseWorkspaceStateHandler(ctx);
	const codebaseStageDestination = getCodebaseStageDefinition(
		workspaceState.firstIncompleteStageId,
	).route;

	if (!workspaceState.workflowState?.executeShipUnlockedAt) {
		return resolveWorkspaceResumeDestination({
			executeShipUnlockedAt: null,
			firstIncompleteStageId: workspaceState.firstIncompleteStageId,
			codebaseStageDestination,
			postReviewLessonStates: [],
		});
	}

	const viewerState = await loadViewerCourseState(ctx);

	return resolveWorkspaceResumeDestination({
		executeShipUnlockedAt: workspaceState.workflowState.executeShipUnlockedAt,
		firstIncompleteStageId: workspaceState.firstIncompleteStageId,
		codebaseStageDestination,
		postReviewLessonStates: viewerState.lessonStates,
	});
}
