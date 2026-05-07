import {
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "./_generated/server";
import {
	appendSupportModeWriteSuccessAuditHandler,
	assertSupportModeWriteAllowedHandler,
} from "./impersonation/model";
import {
	getProductAccessDebugArgs,
	getProductAccessDebugHandler,
	getProductAccessDebugReturns,
	grantProductAccessArgs,
	grantProductAccessFromStripeArgs,
	grantProductAccessFromStripeHandler,
	grantProductAccessFromStripeReturns,
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
} from "./access/model";

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

export const resolveViewerFulfillmentTrack = mutation({
	args: resolveViewerFulfillmentTrackArgs,
	returns: resolveViewerFulfillmentTrackReturns,
	handler: async (ctx, args) => {
		const actionId = "access.fulfillmentTrack.resolve";
		await assertSupportModeWriteAllowedHandler(ctx, { actionId });
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
