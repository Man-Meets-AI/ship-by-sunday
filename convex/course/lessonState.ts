import { ConvexError, v } from "convex/values";

import {
	getCompletionIssues,
	getLessonById,
	type PersistedFieldValues,
} from "../../features/course/lesson/model/registry";
import {
	canAccessLesson,
	ensureLessonIsUnlocked,
	getNormalizedLessonFieldValues,
	getResolvedPinnedArtifactsForCompletion,
	getResolvedPinnedArtifactsForLesson,
	hydrateUploadUrls,
	isCompatibleLessonState,
	loadViewerCourseState,
	upsertLessonState,
} from "./shared";
import type { CourseMutationCtx, CourseQueryCtx } from "./types";
import { fieldValuesValidator, lessonStateReturnValidator } from "./validators";

const lessonIdArgs = {
	lessonId: v.string(),
};

export const getLessonStateArgs = lessonIdArgs;
export const getLessonStateReturns = lessonStateReturnValidator;

function getLessonOrThrow(lessonId: string) {
	const lesson = getLessonById(lessonId);

	if (!lesson) {
		throw new ConvexError("Lesson not found");
	}

	return lesson;
}

export async function getLessonStateHandler(
	ctx: CourseQueryCtx,
	args: { lessonId: string },
) {
	const viewerState = await loadViewerCourseState(ctx);
	const lesson = getLessonOrThrow(args.lessonId);

	if (!canAccessLesson(lesson.id, viewerState)) {
		return {
			accessStatus: "locked" as const,
		};
	}

	const lessonState = viewerState.lessonStateByLessonId.get(lesson.id);
	const lessonStateIsCompatible = isCompatibleLessonState(lesson, lessonState);
	const pinnedArtifacts = await getResolvedPinnedArtifactsForLesson(
		ctx,
		viewerState,
		lesson,
	);

	return {
		accessStatus: "unlocked" as const,
		fieldValues: await hydrateUploadUrls(
			ctx,
			lessonStateIsCompatible
				? getNormalizedLessonFieldValues(lesson, lessonState)
				: {},
		),
		status: lessonStateIsCompatible
			? (lessonState?.status ?? "not_started")
			: "not_started",
		pinnedArtifacts,
	};
}

export const saveLessonDraftArgs = {
	lessonId: v.string(),
	fieldValues: fieldValuesValidator,
};
export const saveLessonDraftReturns = v.object({
	savedAt: v.number(),
});

export async function saveLessonDraftHandler(
	ctx: CourseMutationCtx,
	args: {
		lessonId: string;
		fieldValues: Record<string, unknown>;
	},
) {
	const viewerState = await loadViewerCourseState(ctx);
	const lesson = getLessonOrThrow(args.lessonId);

	ensureLessonIsUnlocked(lesson.id, viewerState);

	const result = await upsertLessonState(ctx, viewerState, lesson, {
		mode: "draft",
		fieldValues: args.fieldValues as PersistedFieldValues,
	});

	return { savedAt: result.timestamp };
}

export const markLessonViewedArgs = lessonIdArgs;
export const markLessonViewedReturns = v.object({
	viewedAt: v.number(),
	created: v.boolean(),
});

export async function markLessonViewedHandler(
	ctx: CourseMutationCtx,
	args: {
		lessonId: string;
	},
) {
	const viewerState = await loadViewerCourseState(ctx);
	const lesson = getLessonOrThrow(args.lessonId);

	ensureLessonIsUnlocked(lesson.id, viewerState);

	const result = await upsertLessonState(ctx, viewerState, lesson, {
		mode: "view",
	});

	return { viewedAt: result.timestamp, created: result.created };
}

export const completeLessonArgs = {
	lessonId: v.string(),
	fieldValues: fieldValuesValidator,
};
export const completeLessonReturns = v.object({
	completedAt: v.number(),
	nextLessonId: v.union(v.string(), v.null()),
});

export async function completeLessonHandler(
	ctx: CourseMutationCtx,
	args: {
		lessonId: string;
		fieldValues: Record<string, unknown>;
	},
) {
	const viewerState = await loadViewerCourseState(ctx);
	const lesson = getLessonOrThrow(args.lessonId);
	const fieldValues = args.fieldValues as PersistedFieldValues;

	ensureLessonIsUnlocked(lesson.id, viewerState);

	const completionIssues = getCompletionIssues(lesson, fieldValues, {
		pinnedArtifacts: getResolvedPinnedArtifactsForCompletion(
			viewerState,
			lesson,
		),
	});
	if (completionIssues.length > 0) {
		throw new ConvexError({
			code: "INCOMPLETE_LESSON",
			message: "Finish the required work before continuing.",
			issues: completionIssues,
		});
	}

	const result = await upsertLessonState(ctx, viewerState, lesson, {
		mode: "complete",
		fieldValues,
	});

	return {
		completedAt: result.timestamp,
		nextLessonId: lesson.nextLessonId ?? null,
	};
}
