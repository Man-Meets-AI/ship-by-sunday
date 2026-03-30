import {
	deriveStageStatus,
	getPacketStageDefinition,
	parseCanonicalProjectFactsDraft,
} from "../../../../packages/packet-compiler/src";
import { resolveWorkspaceResumeDestination } from "../../features/workspace-navigation/lib/post-review-destination";

import { getProjectDefinitionByClerkUserId } from "./projectDefinition";
import type { PacketQueryCtx } from "./types";
import {
	packetResumeDestinationValidator,
	packetWorkspaceStateValidator,
} from "./validators";
import {
	getPacketWorkflowStateByClerkUserId,
	serializePacketWorkflowState,
} from "./workflowState";
import { requireGrantedProductAccess } from "../access/model";
import { loadViewerCourseState } from "../course/shared";

export const getPacketWorkspaceStateArgs = {};
export const getPacketWorkspaceStateReturns = packetWorkspaceStateValidator;

export const getPacketResumeDestinationArgs = {};
export const getPacketResumeDestinationReturns =
	packetResumeDestinationValidator;

export async function getPacketWorkspaceStateHandler(ctx: PacketQueryCtx) {
	const clerkUserId = await requireGrantedProductAccess(ctx);
	const [projectDefinition, workflowState] = await Promise.all([
		getProjectDefinitionByClerkUserId(ctx, clerkUserId),
		getPacketWorkflowStateByClerkUserId(ctx, clerkUserId),
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
			? serializePacketWorkflowState(workflowState)
			: null,
		firstIncompleteStageId: projectDefinition
			? stageStatus.firstIncompleteStageId
			: "start",
		packetReadiness: stageStatus.packetReadiness,
		stageStatuses: stageStatus.stageStatuses,
	};
}

export async function getPacketResumeDestinationHandler(ctx: PacketQueryCtx) {
	const workspaceState = await getPacketWorkspaceStateHandler(ctx);
	const packetStageDestination = getPacketStageDefinition(
		workspaceState.firstIncompleteStageId,
	).route;

	if (!workspaceState.workflowState?.executeShipUnlockedAt) {
		return resolveWorkspaceResumeDestination({
			executeShipUnlockedAt: null,
			firstIncompleteStageId: workspaceState.firstIncompleteStageId,
			packetStageDestination,
			postReviewLessonStates: [],
		});
	}

	const viewerState = await loadViewerCourseState(ctx);

	return resolveWorkspaceResumeDestination({
		executeShipUnlockedAt: workspaceState.workflowState.executeShipUnlockedAt,
		firstIncompleteStageId: workspaceState.firstIncompleteStageId,
		packetStageDestination,
		postReviewLessonStates: viewerState.lessonStates,
	});
}
