import { v } from "convex/values";

import { getLessonById } from "../../lib/course/registry";
import {
	buildResolvedArtifactPreviewForLesson,
	loadViewerCourseState,
} from "./shared";
import type { CourseQueryCtx } from "./types";
import { completedArtifactPreviewValidator } from "./validators";

function isPresent<T>(value: T | null): value is T {
	return value !== null;
}

export const listArtifactsArgs = {};
export const listArtifactsReturns = v.array(completedArtifactPreviewValidator);

export async function listArtifactsHandler(ctx: CourseQueryCtx) {
	const viewerState = await loadViewerCourseState(ctx);

	return (
		await Promise.all(
			viewerState.compatibleCompletedLessonIds.map(async (lessonId) => {
				const lesson = getLessonById(lessonId);
				const lessonState = viewerState.lessonStateByLessonId.get(lessonId);
				if (!lesson || !lessonState) {
					return null;
				}

				const preview = await buildResolvedArtifactPreviewForLesson(
					ctx,
					viewerState,
					lesson,
					new Map(),
					{ requireCompletedSource: false },
				);
				if (!preview) {
					return null;
				}

				return {
					...preview,
					completedAt: lessonState.completedAt ?? lessonState.updatedAt,
				};
			}),
		)
	).filter(isPresent);
}
