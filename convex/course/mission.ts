import {
	COURSE_SLUG,
	getLessonById,
	getOrderedBlocks,
	getStudentFacingLessons,
	isLessonImplemented,
} from "../../features/course/lesson/model/registry";
import {
	canAccessLesson,
	isCompatibleLessonState,
	loadViewerCourseState,
} from "./shared";
import type { CourseQueryCtx, LessonStateDoc } from "./types";
import {
	missionStateReturnValidator,
	resumeDestinationReturnValidator,
} from "./validators";

export const getMissionStateArgs = {};
export const getMissionStateReturns = missionStateReturnValidator;

function getLessonStateTimestamp(state: LessonStateDoc) {
	return state.lastViewedAt ?? state.updatedAt ?? state.startedAt ?? 0;
}

export async function getMissionStateHandler(ctx: CourseQueryCtx) {
	const viewerState = await loadViewerCourseState(ctx);
	const lessons = getStudentFacingLessons().map((lesson) => {
		const lessonState = viewerState.lessonStateByLessonId.get(lesson.id);
		const lessonStateIsCompatible = isCompatibleLessonState(
			lesson,
			lessonState,
		);
		let status: "locked" | "available" | "in_progress" | "completed" = "locked";

		if (viewerState.compatibleCompletedLessonIdSet.has(lesson.id)) {
			status = "completed";
		} else if (
			lessonState?.status === "in_progress" &&
			lessonStateIsCompatible
		) {
			status = "in_progress";
		} else if (canAccessLesson(lesson.id, viewerState)) {
			status = "available";
		}

		return {
			id: lesson.id,
			title: lesson.title,
			shortTitle: lesson.shortTitle,
			block: lesson.block,
			order: lesson.order,
			status,
			isImplemented: isLessonImplemented(lesson),
			artifactLabel: lesson.artifact.label,
		};
	});

	const progressCount = lessons.filter(
		(lesson) => lesson.status === "completed",
	).length;

	const missionBlocks = getOrderedBlocks().map((block) => {
		const blockLessons = lessons.filter((lesson) => lesson.block === block.id);
		const completedCount = blockLessons.filter(
			(lesson) => lesson.status === "completed",
		).length;
		const availableCount = blockLessons.filter(
			(lesson) => lesson.status !== "locked",
		).length;

		return {
			id: block.id,
			label: block.label,
			order: block.order,
			completedCount,
			availableCount,
			totalLessons: blockLessons.length,
			lessons: blockLessons,
		};
	});

	return {
		courseSlug: COURSE_SLUG,
		progressCount,
		totalLessons: lessons.length,
		blocks: missionBlocks,
		unlockedLessonIds: Array.from(viewerState.unlockedLessonIds).filter(
			(lessonId) => lessonId !== "0.0",
		),
	};
}

export const getResumeDestinationArgs = {};
export const getResumeDestinationReturns = resumeDestinationReturnValidator;

export async function getResumeDestinationHandler(ctx: CourseQueryCtx) {
	const viewerState = await loadViewerCourseState(ctx);

	const latestAccessibleLessonState = [...viewerState.lessonStates]
		.filter((state) => Boolean(getLessonById(state.lessonId)))
		.filter((state) => canAccessLesson(state.lessonId, viewerState))
		.sort(
			(left, right) =>
				getLessonStateTimestamp(right) - getLessonStateTimestamp(left),
		)[0];

	if (!latestAccessibleLessonState) {
		return {
			destination: "/mission",
			lessonId: null,
		};
	}

	return {
		destination: `/lesson/${latestAccessibleLessonState.lessonId}`,
		lessonId: latestAccessibleLessonState.lessonId,
	};
}
