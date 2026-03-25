import {
	deriveStageStatus,
	getPacketStageDefinition,
	parseCanonicalProjectFactsDraft,
} from "../../../../packages/packet-compiler/src";

import { getProjectDefinitionByClerkUserId } from "./projectDefinition";
import type { PacketQueryCtx } from "./types";
import {
	packetResumeDestinationValidator,
	packetWorkspaceStateValidator,
} from "./validators";
import { requireGrantedProductAccess } from "../access/model";

export const getPacketWorkspaceStateArgs = {};
export const getPacketWorkspaceStateReturns = packetWorkspaceStateValidator;

export const getPacketResumeDestinationArgs = {};
export const getPacketResumeDestinationReturns =
	packetResumeDestinationValidator;

export async function getPacketWorkspaceStateHandler(ctx: PacketQueryCtx) {
	const clerkUserId = await requireGrantedProductAccess(ctx);
	const projectDefinition = await getProjectDefinitionByClerkUserId(
		ctx,
		clerkUserId,
	);
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
		firstIncompleteStageId: projectDefinition
			? stageStatus.firstIncompleteStageId
			: "start",
		packetReadiness: stageStatus.packetReadiness,
		stageStatuses: stageStatus.stageStatuses,
	};
}

export async function getPacketResumeDestinationHandler(ctx: PacketQueryCtx) {
	const workspaceState = await getPacketWorkspaceStateHandler(ctx);
	const stageId = workspaceState.firstIncompleteStageId;

	return {
		destination: getPacketStageDefinition(stageId).route,
		stageId,
	};
}
