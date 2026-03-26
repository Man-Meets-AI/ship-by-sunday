import { PRODUCT_APP_ID } from "../../config/product";
import { requireGrantedProductAccess } from "../access/model";
import type {
	PacketMutationCtx,
	PacketQueryCtx,
	PacketReadCtx,
	PacketWorkflowStateDoc,
} from "./types";
import { packetWorkflowStatePublicValidator } from "./validators";

export const unlockExecuteShipArgs = {};
export const unlockExecuteShipReturns = packetWorkflowStatePublicValidator;

export async function getPacketWorkflowStateByClerkUserId(
	ctx: PacketReadCtx,
	clerkUserId: string,
) {
	return ctx.db
		.query("packetWorkflowStates")
		.withIndex("by_clerk_user_id_and_product_key", (query) =>
			query.eq("clerkUserId", clerkUserId).eq("productKey", PRODUCT_APP_ID),
		)
		.unique();
}

export function serializePacketWorkflowState(
	workflowState: PacketWorkflowStateDoc,
) {
	return {
		clerkUserId: workflowState.clerkUserId,
		productKey: workflowState.productKey,
		executeShipUnlockedAt: workflowState.executeShipUnlockedAt,
		createdAt: workflowState.createdAt,
		updatedAt: workflowState.updatedAt,
	};
}

export async function getPacketWorkflowStateHandler(ctx: PacketQueryCtx) {
	const clerkUserId = await requireGrantedProductAccess(ctx);
	const workflowState = await getPacketWorkflowStateByClerkUserId(
		ctx,
		clerkUserId,
	);

	return workflowState ? serializePacketWorkflowState(workflowState) : null;
}

export async function unlockExecuteShipHandler(ctx: PacketMutationCtx) {
	const clerkUserId = await requireGrantedProductAccess(ctx);
	const existingWorkflowState = await getPacketWorkflowStateByClerkUserId(
		ctx,
		clerkUserId,
	);

	if (existingWorkflowState?.executeShipUnlockedAt) {
		return serializePacketWorkflowState(existingWorkflowState);
	}

	const now = Date.now();
	if (existingWorkflowState) {
		await ctx.db.patch(existingWorkflowState._id, {
			executeShipUnlockedAt: now,
			updatedAt: now,
		});
		return {
			...serializePacketWorkflowState(existingWorkflowState),
			executeShipUnlockedAt: now,
			updatedAt: now,
		};
	}

	const workflowState = {
		clerkUserId,
		productKey: PRODUCT_APP_ID,
		executeShipUnlockedAt: now,
		createdAt: now,
		updatedAt: now,
	};
	await ctx.db.insert("packetWorkflowStates", workflowState);
	return workflowState;
}
