import { PRODUCT_APP_ID } from "../../src/config/product";
import { requireGeneratedCodebaseProductAccess } from "../entitlements/model";
import type {
	CodebaseMutationCtx,
	CodebaseQueryCtx,
	CodebaseReadCtx,
	CodebaseWorkflowStateDoc,
} from "./types";
import { codebaseWorkflowStatePublicValidator } from "./validators";

export const unlockExecuteShipArgs = {};
export const unlockExecuteShipReturns = codebaseWorkflowStatePublicValidator;

export async function getCodebaseWorkflowStateByClerkUserId(
	ctx: CodebaseReadCtx,
	clerkUserId: string,
) {
	return ctx.db
		.query("codebaseWorkflowStates")
		.withIndex("by_clerk_user_id_and_product_key", (query) =>
			query.eq("clerkUserId", clerkUserId).eq("productKey", PRODUCT_APP_ID),
		)
		.unique();
}

export function serializeCodebaseWorkflowState(
	workflowState: CodebaseWorkflowStateDoc,
) {
	return {
		clerkUserId: workflowState.clerkUserId,
		productKey: workflowState.productKey,
		executeShipUnlockedAt: workflowState.executeShipUnlockedAt,
		createdAt: workflowState.createdAt,
		updatedAt: workflowState.updatedAt,
	};
}

export async function getCodebaseWorkflowStateHandler(ctx: CodebaseQueryCtx) {
	const clerkUserId = await requireGeneratedCodebaseProductAccess(ctx);
	const workflowState = await getCodebaseWorkflowStateByClerkUserId(
		ctx,
		clerkUserId,
	);

	return workflowState ? serializeCodebaseWorkflowState(workflowState) : null;
}

export async function unlockExecuteShipHandler(ctx: CodebaseMutationCtx) {
	const clerkUserId = await requireGeneratedCodebaseProductAccess(ctx);
	const existingWorkflowState = await getCodebaseWorkflowStateByClerkUserId(
		ctx,
		clerkUserId,
	);

	if (existingWorkflowState?.executeShipUnlockedAt) {
		return serializeCodebaseWorkflowState(existingWorkflowState);
	}

	const now = Date.now();
	if (existingWorkflowState) {
		await ctx.db.patch(existingWorkflowState._id, {
			executeShipUnlockedAt: now,
			updatedAt: now,
		});
		return {
			...serializeCodebaseWorkflowState(existingWorkflowState),
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
	await ctx.db.insert("codebaseWorkflowStates", workflowState);
	return workflowState;
}
