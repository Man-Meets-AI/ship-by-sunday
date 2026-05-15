import {
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "./_generated/server";
import { v } from "convex/values";
import {
	appendSupportModeWriteSuccessAuditHandler,
	assertSupportModeWriteAllowedHandler,
} from "./impersonation/model";
import {
	createSupportModeBlockedMutationResult,
	supportModeBlockedMutationResultValidator,
} from "./impersonation/blockedResult";
import {
	getProductAccessDebugArgs,
	getProductAccessDebugHandler,
	getProductAccessDebugReturns,
	grantProductAccessArgs,
	grantProductAccessFromStripeArgs,
	grantProductAccessFromStripeHandler,
	grantProductAccessFromStripeReturns,
	grantLegacyProductSplitAccessArgs,
	grantLegacyProductSplitAccessHandler,
	grantLegacyProductSplitAccessReturns,
	grantProductAccessHandler,
	grantProductAccessReturns,
	resolveViewerFulfillmentTrackArgs,
	resolveViewerFulfillmentTrackHandler,
	resolveViewerFulfillmentTrackReturns,
	resetProductAccessArgs,
	resetProductAccessHandler,
	resetProductAccessReturns,
	viewerProductAccessArgs,
	viewerProductAccessHandler,
	viewerProductAccessReturns,
} from "./entitlements/model";

export const viewerProductAccess = query({
	args: viewerProductAccessArgs,
	returns: viewerProductAccessReturns,
	handler: viewerProductAccessHandler,
});

export const grantProductAccess = internalMutation({
	args: grantProductAccessArgs,
	returns: grantProductAccessReturns,
	handler: grantProductAccessHandler,
});

export const grantProductAccessFromStripe = internalMutation({
	args: grantProductAccessFromStripeArgs,
	returns: grantProductAccessFromStripeReturns,
	handler: grantProductAccessFromStripeHandler,
});

export const grantLegacyProductSplitAccess = internalMutation({
	args: grantLegacyProductSplitAccessArgs,
	returns: grantLegacyProductSplitAccessReturns,
	handler: grantLegacyProductSplitAccessHandler,
});

export const resolveViewerFulfillmentTrack = mutation({
	args: resolveViewerFulfillmentTrackArgs,
	returns: v.union(
		resolveViewerFulfillmentTrackReturns,
		supportModeBlockedMutationResultValidator,
	),
	handler: async (ctx, args) => {
		const actionId = "entitlements.fulfillmentTrack.resolve";
		const supportModePolicy = await assertSupportModeWriteAllowedHandler(ctx, {
			actionId,
		});
		if (supportModePolicy.kind === "blocked") {
			return createSupportModeBlockedMutationResult(
				supportModePolicy.blockReason,
			);
		}
		const result = await resolveViewerFulfillmentTrackHandler(ctx, args);
		await appendSupportModeWriteSuccessAuditHandler(ctx, { actionId });
		return result;
	},
});

export const resetProductAccess = internalMutation({
	args: resetProductAccessArgs,
	returns: resetProductAccessReturns,
	handler: resetProductAccessHandler,
});

export const getProductAccessDebug = internalQuery({
	args: getProductAccessDebugArgs,
	returns: getProductAccessDebugReturns,
	handler: getProductAccessDebugHandler,
});
