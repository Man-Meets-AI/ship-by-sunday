import { ConvexError, v } from "convex/values";
import {
	getOrderedBlocks,
	getStudentFacingLessons,
	isLessonImplemented,
} from "../../features/course/lesson/model/registry";
import { getLessonByKey } from "../../features/course/lesson/model/manifest";
import { getPacketWorkflowStateByClerkUserId } from "../packet/workflowState";
import { upsertLessonState, loadViewerCourseState } from "./shared";
import type { CourseMutationCtx, CourseQueryCtx, LessonStateDoc } from "./types";
import { bonusMissionStateReturnValidator } from "./validators";

export const getBonusMissionStateArgs = {};
export const getBonusMissionStateReturns = bonusMissionStateReturnValidator;

export const markBonusLessonViewedArgs = {
	lessonKey: v.string(),
};
export const markBonusLessonViewedReturns = v.object({
	viewedAt: v.number(),
	created: v.boolean(),
});

function isBonusLessonExplored(state: LessonStateDoc | undefined) {
	return Boolean(state?.lastViewedAt ?? state?.startedAt ?? state?.updatedAt);
}

function getBonusLessonStatus(
	state: LessonStateDoc | undefined,
): "available" | "opened" | "completed" {
	if (state?.status === "completed") {
		return "completed";
	}

	return isBonusLessonExplored(state) ? "opened" : "available";
}

async function requireBonusViewerState(ctx: CourseQueryCtx | CourseMutationCtx) {
	const viewerState = await loadViewerCourseState(ctx);
	const workflowState = await getPacketWorkflowStateByClerkUserId(
		ctx,
		viewerState.clerkUserId,
	);

	if (!workflowState?.executeShipUnlockedAt) {
		throw new ConvexError("Execute / Ship is still locked");
	}

	return viewerState;
}

export async function getBonusMissionStateHandler(ctx: CourseQueryCtx) {
	const viewerState = await requireBonusViewerState(ctx);
	const lessons = getStudentFacingLessons().map((lesson) => {
		const lessonState = viewerState.lessonStateByLessonKey.get(lesson.lessonKey);

		return {
			lessonKey: lesson.lessonKey,
			routeSegment: lesson.routeSegment,
			id: lesson.id,
			displayLabel: lesson.displayLabel,
			title: lesson.title,
			shortTitle: lesson.shortTitle,
			block: lesson.block,
			order: lesson.order,
			status: getBonusLessonStatus(lessonState),
			isImplemented: isLessonImplemented(lesson),
			artifactLabel: lesson.artifact.label,
			durationLabel: lesson.content.coach.video?.durationLabel,
		};
	});

	return {
		exploredCount: lessons.filter((lesson) => lesson.status !== "available").length,
		totalLessons: lessons.length,
		blocks: getOrderedBlocks().map((block) => ({
			id: block.id,
			order: block.order,
			lessons: lessons.filter((lesson) => lesson.block === block.id),
		})),
	};
}

export async function markBonusLessonViewedHandler(
	ctx: CourseMutationCtx,
	args: {
		lessonKey: string;
	},
) {
	const viewerState = await requireBonusViewerState(ctx);
	const lesson = getLessonByKey(args.lessonKey);

	if (!lesson) {
		throw new ConvexError("Lesson not found");
	}

	const result = await upsertLessonState(ctx, viewerState, lesson, {
		mode: "view",
	});

	return { viewedAt: result.timestamp, created: result.created };
}
