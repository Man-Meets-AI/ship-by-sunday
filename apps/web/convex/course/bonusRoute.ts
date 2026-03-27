import { v } from "convex/values";
import { getLessonByKey } from "../../features/course/lesson/model/manifest";
import { getPacketWorkflowStateByClerkUserId } from "../packet/workflowState";
import { loadViewerCourseState } from "./shared";
import type { CourseQueryCtx } from "./types";

export const getBonusRouteStateArgs = {};
export const getBonusRouteStateReturns = v.object({
	hasStartedBonusLesson: v.boolean(),
});

function getLessonStateTimestamp(state: {
	lastViewedAt?: number;
	startedAt?: number;
	updatedAt?: number;
}) {
	return state.lastViewedAt ?? state.updatedAt ?? state.startedAt ?? 0;
}

export async function getBonusRouteStateHandler(ctx: CourseQueryCtx) {
	const viewerState = await loadViewerCourseState(ctx);
	const workflowState = await getPacketWorkflowStateByClerkUserId(
		ctx,
		viewerState.clerkUserId,
	);
	const executeShipUnlockedAt = workflowState?.executeShipUnlockedAt ?? null;

	return {
		hasStartedBonusLesson: executeShipUnlockedAt
			? viewerState.lessonStates.some(
					(state) =>
						Boolean(state.lessonKey && getLessonByKey(state.lessonKey)) &&
						getLessonStateTimestamp(state) >= executeShipUnlockedAt,
				)
			: false,
	};
}
