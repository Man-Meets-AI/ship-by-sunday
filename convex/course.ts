import {
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "./_generated/server";
import {
	listArtifactsArgs,
	listArtifactsHandler,
	listArtifactsReturns,
} from "./course/artifacts";
import {
	getEntitlementDebugArgs,
	getEntitlementDebugHandler,
	getEntitlementDebugReturns,
	grantEntitlementArgs,
	grantEntitlementFromStripeArgs,
	grantEntitlementFromStripeHandler,
	grantEntitlementFromStripeReturns,
	grantEntitlementHandler,
	grantEntitlementReturns,
	viewerAccessArgs,
	viewerAccessHandler,
	viewerAccessReturns,
} from "./course/entitlements";
import {
	completeLessonArgs,
	completeLessonHandler,
	completeLessonReturns,
	getLessonStateArgs,
	getLessonStateHandler,
	getLessonStateReturns,
	markLessonViewedArgs,
	markLessonViewedHandler,
	markLessonViewedReturns,
	saveLessonDraftArgs,
	saveLessonDraftHandler,
	saveLessonDraftReturns,
} from "./course/lessonState";
import {
	getMissionStateArgs,
	getMissionStateHandler,
	getMissionStateReturns,
	getResumeDestinationArgs,
	getResumeDestinationHandler,
	getResumeDestinationReturns,
} from "./course/mission";

export const viewerAccess = query({
	args: viewerAccessArgs,
	returns: viewerAccessReturns,
	handler: viewerAccessHandler,
});

export const getResumeDestination = query({
	args: getResumeDestinationArgs,
	returns: getResumeDestinationReturns,
	handler: getResumeDestinationHandler,
});

export const grantEntitlement = internalMutation({
	args: grantEntitlementArgs,
	returns: grantEntitlementReturns,
	handler: grantEntitlementHandler,
});

export const grantEntitlementFromStripe = mutation({
	args: grantEntitlementFromStripeArgs,
	returns: grantEntitlementFromStripeReturns,
	handler: grantEntitlementFromStripeHandler,
});

export const getEntitlementDebug = internalQuery({
	args: getEntitlementDebugArgs,
	returns: getEntitlementDebugReturns,
	handler: getEntitlementDebugHandler,
});

export const getMissionState = query({
	args: getMissionStateArgs,
	returns: getMissionStateReturns,
	handler: getMissionStateHandler,
});

export const getLessonState = query({
	args: getLessonStateArgs,
	returns: getLessonStateReturns,
	handler: getLessonStateHandler,
});

export const saveLessonDraft = mutation({
	args: saveLessonDraftArgs,
	returns: saveLessonDraftReturns,
	handler: saveLessonDraftHandler,
});

export const markLessonViewed = mutation({
	args: markLessonViewedArgs,
	returns: markLessonViewedReturns,
	handler: markLessonViewedHandler,
});

export const completeLesson = mutation({
	args: completeLessonArgs,
	returns: completeLessonReturns,
	handler: completeLessonHandler,
});

export const listArtifacts = query({
	args: listArtifactsArgs,
	returns: listArtifactsReturns,
	handler: listArtifactsHandler,
});
