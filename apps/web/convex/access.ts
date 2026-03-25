import { internalMutation, internalQuery, query } from "./_generated/server";
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

export const getProductAccessDebug = internalQuery({
	args: getProductAccessDebugArgs,
	returns: getProductAccessDebugReturns,
	handler: getProductAccessDebugHandler,
});
