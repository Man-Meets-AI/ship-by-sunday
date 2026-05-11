import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
	createSupportModeBlockedMutationResult,
	supportModeBlockedMutationResultValidator,
} from "./impersonation/blockedResult";
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
	returns: v.union(
		saveLessonDraftReturns,
		supportModeBlockedMutationResultValidator,
	),
	handler: async (ctx, args) => {
		const actionId = "course.lesson.saveDraft";
		const supportModePolicy = await assertSupportModeWriteAllowedHandler(ctx, {
			actionId,
		});
		if (supportModePolicy.kind === "blocked") {
			return createSupportModeBlockedMutationResult(
				supportModePolicy.blockReason,
			);
		}
		const result = await saveLessonDraftHandler(ctx, args);
		await appendSupportModeWriteSuccessAuditHandler(ctx, { actionId });
		return result;
	},
});

export const markLessonViewed = mutation({
	args: markLessonViewedArgs,
	returns: v.union(
		markLessonViewedReturns,
		supportModeBlockedMutationResultValidator,
	),
	handler: async (ctx, args) => {
		const actionId = "course.lesson.markViewed";
		const supportModePolicy = await assertSupportModeWriteAllowedHandler(ctx, {
			actionId,
		});
		if (supportModePolicy.kind === "blocked") {
			return createSupportModeBlockedMutationResult(
				supportModePolicy.blockReason,
			);
		}
		const result = await markLessonViewedHandler(ctx, args);
		await appendSupportModeWriteSuccessAuditHandler(ctx, { actionId });
		return result;
	},
});

export const markBonusLessonViewed = mutation({
	args: markBonusLessonViewedArgs,
	returns: v.union(
		markBonusLessonViewedReturns,
		supportModeBlockedMutationResultValidator,
	),
	handler: async (ctx, args) => {
		const actionId = "course.bonusLesson.markViewed";
		const supportModePolicy = await assertSupportModeWriteAllowedHandler(ctx, {
			actionId,
		});
		if (supportModePolicy.kind === "blocked") {
			return createSupportModeBlockedMutationResult(
				supportModePolicy.blockReason,
			);
		}
		const result = await markBonusLessonViewedHandler(ctx, args);
		await appendSupportModeWriteSuccessAuditHandler(ctx, { actionId });
		return result;
	},
});

export const completeLesson = mutation({
	args: completeLessonArgs,
	returns: v.union(
		completeLessonReturns,
		supportModeBlockedMutationResultValidator,
	),
	handler: async (ctx, args) => {
		const actionId = "course.lesson.complete";
		const supportModePolicy = await assertSupportModeWriteAllowedHandler(ctx, {
			actionId,
		});
		if (supportModePolicy.kind === "blocked") {
			return createSupportModeBlockedMutationResult(
				supportModePolicy.blockReason,
			);
		}
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
