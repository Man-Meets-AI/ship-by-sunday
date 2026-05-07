import { mutation, query } from "./_generated/server";
import {
	appendSupportModeWriteSuccessAuditHandler,
	assertSupportModeWriteAllowedHandler,
} from "./impersonation/model";
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

export const getResumeDestination = query({
	args: getResumeDestinationArgs,
	returns: getResumeDestinationReturns,
	handler: getResumeDestinationHandler,
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
	handler: async (ctx, args) => {
		const actionId = "course.lesson.saveDraft";
		await assertSupportModeWriteAllowedHandler(ctx, { actionId });
		const result = await saveLessonDraftHandler(ctx, args);
		await appendSupportModeWriteSuccessAuditHandler(ctx, { actionId });
		return result;
	},
});

export const markLessonViewed = mutation({
	args: markLessonViewedArgs,
	returns: markLessonViewedReturns,
	handler: async (ctx, args) => {
		const actionId = "course.lesson.markViewed";
		await assertSupportModeWriteAllowedHandler(ctx, { actionId });
		const result = await markLessonViewedHandler(ctx, args);
		await appendSupportModeWriteSuccessAuditHandler(ctx, { actionId });
		return result;
	},
});

export const markBonusLessonViewed = mutation({
	args: markBonusLessonViewedArgs,
	returns: markBonusLessonViewedReturns,
	handler: async (ctx, args) => {
		const actionId = "course.bonusLesson.markViewed";
		await assertSupportModeWriteAllowedHandler(ctx, { actionId });
		const result = await markBonusLessonViewedHandler(ctx, args);
		await appendSupportModeWriteSuccessAuditHandler(ctx, { actionId });
		return result;
	},
});

export const completeLesson = mutation({
	args: completeLessonArgs,
	returns: completeLessonReturns,
	handler: async (ctx, args) => {
		const actionId = "course.lesson.complete";
		await assertSupportModeWriteAllowedHandler(ctx, { actionId });
		const result = await completeLessonHandler(ctx, args);
		await appendSupportModeWriteSuccessAuditHandler(ctx, { actionId });
		return result;
	},
});

export const listArtifacts = query({
	args: listArtifactsArgs,
	returns: listArtifactsReturns,
	handler: listArtifactsHandler,
});
