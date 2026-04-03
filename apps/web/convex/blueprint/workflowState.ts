import { PRODUCT_APP_ID } from "../../config/product";
import { requireGrantedProductAccess } from "../access/model";
import type {
	BlueprintMutationCtx,
	BlueprintQueryCtx,
	BlueprintReadCtx,
	BlueprintWorkflowStateDoc,
} from "./types";
import { blueprintWorkflowStatePublicValidator } from "./validators";

export const unlockExecuteShipArgs = {};
export const unlockExecuteShipReturns = blueprintWorkflowStatePublicValidator;

export async function getBlueprintWorkflowStateByClerkUserId(
	ctx: BlueprintReadCtx,
	clerkUserId: string,
) {
	return ctx.db
		.query("blueprintWorkflowStates")
		.withIndex("by_clerk_user_id_and_product_key", (query) =>
			query.eq("clerkUserId", clerkUserId).eq("productKey", PRODUCT_APP_ID),
		)
		.unique();
}

export function serializeBlueprintWorkflowState(
	workflowState: BlueprintWorkflowStateDoc,
) {
	return {
		clerkUserId: workflowState.clerkUserId,
		productKey: workflowState.productKey,
		executeShipUnlockedAt: workflowState.executeShipUnlockedAt,
		createdAt: workflowState.createdAt,
		updatedAt: workflowState.updatedAt,
	};
}

export async function getBlueprintWorkflowStateHandler(ctx: BlueprintQueryCtx) {
	const clerkUserId = await requireGrantedProductAccess(ctx);
	const workflowState = await getBlueprintWorkflowStateByClerkUserId(
		ctx,
		clerkUserId,
	);

	return workflowState ? serializeBlueprintWorkflowState(workflowState) : null;
}

export async function unlockExecuteShipHandler(ctx: BlueprintMutationCtx) {
	const clerkUserId = await requireGrantedProductAccess(ctx);
	const existingWorkflowState = await getBlueprintWorkflowStateByClerkUserId(
		ctx,
		clerkUserId,
	);

	if (existingWorkflowState?.executeShipUnlockedAt) {
		return serializeBlueprintWorkflowState(existingWorkflowState);
	}

	const now = Date.now();
	if (existingWorkflowState) {
		await ctx.db.patch(existingWorkflowState._id, {
			executeShipUnlockedAt: now,
			updatedAt: now,
		});
		return {
			...serializeBlueprintWorkflowState(existingWorkflowState),
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
	await ctx.db.insert("blueprintWorkflowStates", workflowState);
	return workflowState;
}
