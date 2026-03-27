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
	getBonusRouteStateArgs,
	getBonusRouteStateHandler,
	getBonusRouteStateReturns,
} from "./course/bonusRoute";
import {
	getBonusMissionStateArgs,
	getBonusMissionStateHandler,
	getBonusMissionStateReturns,
	markBonusLessonViewedArgs,
	markBonusLessonViewedHandler,
	markBonusLessonViewedReturns,
} from "./course/bonusMission";
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
import {
	getStarterRepoAccessArgs,
	getStarterRepoAccessHandler,
	getStarterRepoAccessReturns,
	listStarterRepoAccessQueueArgs,
	listStarterRepoAccessQueueHandler,
	listStarterRepoAccessQueueReturns,
	recordStarterRepoProvisioningResultArgs,
	recordStarterRepoProvisioningResultHandler,
	recordStarterRepoProvisioningResultReturns,
	requestStarterRepoAccessArgs,
	requestStarterRepoAccessHandler,
	requestStarterRepoAccessReturns,
	resetStarterRepoAccessArgs,
	resetStarterRepoAccessHandler,
	resetStarterRepoAccessReturns,
} from "./course/starterRepoAccess";

export const getResumeDestination = query({
	args: getResumeDestinationArgs,
	returns: getResumeDestinationReturns,
	handler: getResumeDestinationHandler,
});

export const getStarterRepoAccess = query({
	args: getStarterRepoAccessArgs,
	returns: getStarterRepoAccessReturns,
	handler: getStarterRepoAccessHandler,
});

export const requestStarterRepoAccess = mutation({
	args: requestStarterRepoAccessArgs,
	returns: requestStarterRepoAccessReturns,
	handler: requestStarterRepoAccessHandler,
});

export const listStarterRepoAccessQueue = internalQuery({
	args: listStarterRepoAccessQueueArgs,
	returns: listStarterRepoAccessQueueReturns,
	handler: listStarterRepoAccessQueueHandler,
});

export const recordStarterRepoProvisioningResult = internalMutation({
	args: recordStarterRepoProvisioningResultArgs,
	returns: recordStarterRepoProvisioningResultReturns,
	handler: recordStarterRepoProvisioningResultHandler,
});

export const resetStarterRepoAccess = internalMutation({
	args: resetStarterRepoAccessArgs,
	returns: resetStarterRepoAccessReturns,
	handler: resetStarterRepoAccessHandler,
});

export const getMissionState = query({
	args: getMissionStateArgs,
	returns: getMissionStateReturns,
	handler: getMissionStateHandler,
});

export const getBonusRouteState = query({
	args: getBonusRouteStateArgs,
	returns: getBonusRouteStateReturns,
	handler: getBonusRouteStateHandler,
});

export const getBonusMissionState = query({
	args: getBonusMissionStateArgs,
	returns: getBonusMissionStateReturns,
	handler: getBonusMissionStateHandler,
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

export const markBonusLessonViewed = mutation({
	args: markBonusLessonViewedArgs,
	returns: markBonusLessonViewedReturns,
	handler: markBonusLessonViewedHandler,
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
