import { ConvexError } from "convex/values";
import type { LessonConfig } from "../../src/lib/course/lesson/model/contracts";
import {
	CURRICULUM_VERSION,
	getLessonByKey,
} from "../../src/lib/course/lesson/model/curriculum";
import {
	hydrateReferenceGalleryValue,
	isReferenceGalleryValue,
} from "../../src/lib/course/lesson/model/reference-gallery";
import {
	type ArtifactPreview,
	buildResolvedArtifactPreview,
	COURSE_SLUG,
	getLessonByArtifactKey,
	getUnlockedLessonKeys,
	isLessonFieldShapeCompatible,
	isUploadFieldValue,
	isUploadFieldValueArray,
	normalizeFieldValues,
	normalizeLessonFieldValues,
	type PersistedFieldValues,
	prepareFieldValuesForPersistence,
} from "../../src/lib/course/lesson/model/registry";
import type { Id } from "../_generated/dataModel";
import { requireTutorialsProductAccess } from "../entitlements/model";
import type {
	CourseMutationCtx,
	CourseQueryCtx,
	CourseReadCtx,
	LessonStateDoc,
} from "./types";

export type ViewerCourseState = {
	clerkUserId: string;
	lessonStates: LessonStateDoc[];
	lessonStateByLessonKey: Map<string, LessonStateDoc>;
	compatibleCompletedLessonKeys: string[];
	compatibleCompletedLessonKeySet: Set<string>;
	unlockedLessonKeys: Set<string>;
};

type LessonStateUpsertOptions =
	| {
			mode: "view";
	  }
	| {
			mode: "draft" | "complete";
			fieldValues: PersistedFieldValues;
	  };

type PinnedArtifactOptions = {
	requireCompletedSource: boolean;
};

type UploadHydrationCandidate = Record<string, unknown> & {
	storageId: Id<"_storage">;
};

function isPresent<T>(value: T | null): value is T {
	return value !== null;
}

async function getViewerLessonStates(
	ctx: CourseReadCtx,
	clerkUserId: string,
): Promise<LessonStateDoc[]> {
	return ctx.db
		.query("lessonStates")
		.withIndex("by_clerk_user_id_and_status", (q) =>
			q.eq("clerkUserId", clerkUserId),
		)
		.collect();
}

function getCompatibleCompletedLessonIds(lessonStates: LessonStateDoc[]) {
	return lessonStates.flatMap((state) => {
		if (state.curriculumVersion !== CURRICULUM_VERSION || !state.lessonKey) {
			return [];
		}

		if (state.status !== "completed") {
			return [];
		}

		const lesson = getLessonByKey(state.lessonKey);
		if (!lesson || !isLessonFieldShapeCompatible(lesson, state.fieldValues)) {
			return [];
		}

		return [state.lessonKey];
	});
}

export async function loadViewerCourseState(
	ctx: CourseReadCtx,
): Promise<ViewerCourseState> {
	const clerkUserId = await requireTutorialsProductAccess(ctx);
	const lessonStates = await getViewerLessonStates(ctx, clerkUserId);
	const compatibleCompletedLessonKeys =
		getCompatibleCompletedLessonIds(lessonStates);
	const currentLessonStates = lessonStates.filter(
		(state): state is LessonStateDoc & { lessonKey: string } =>
			state.curriculumVersion === CURRICULUM_VERSION &&
			typeof state.lessonKey === "string" &&
			state.lessonKey.length > 0,
	);

	return {
		clerkUserId,
		lessonStates: currentLessonStates,
		lessonStateByLessonKey: new Map(
			currentLessonStates.map((state) => [state.lessonKey, state]),
		),
		compatibleCompletedLessonKeys,
		compatibleCompletedLessonKeySet: new Set(compatibleCompletedLessonKeys),
		unlockedLessonKeys: new Set(
			getUnlockedLessonKeys(compatibleCompletedLessonKeys),
		),
	};
}

function collectStorageIdsFromFieldValues(
	fieldValues: PersistedFieldValues | null | undefined,
) {
	const storageIds = new Set<Id<"_storage">>();
	const values = normalizeFieldValues(fieldValues);

	function collectValue(value: unknown) {
		if (isReferenceGalleryValue(value)) {
			for (const item of value.items) {
				if (item.storageId) {
					storageIds.add(item.storageId);
				}
			}
			return;
		}
		if (isUploadFieldValueArray(value)) {
			for (const item of value) {
				if (item.storageId) {
					storageIds.add(item.storageId);
				}
			}
			return;
		}
		if (isUploadFieldValue(value) && value.storageId) {
			storageIds.add(value.storageId);
		}
	}

	for (const value of Object.values(values)) {
		collectValue(value);
	}

	return storageIds;
}

function getViewerPersistedStorageIds(viewerState: ViewerCourseState) {
	const storageIds = new Set<Id<"_storage">>();
	for (const lessonState of viewerState.lessonStates) {
		for (const storageId of collectStorageIdsFromFieldValues(
			lessonState.fieldValues,
		)) {
			storageIds.add(storageId);
		}
	}
	return storageIds;
}

function assertFieldValuesUseKnownStorageIds(
	viewerState: ViewerCourseState,
	fieldValues: PersistedFieldValues,
) {
	const storageIds = collectStorageIdsFromFieldValues(fieldValues);
	if (storageIds.size === 0) {
		return;
	}

	const knownStorageIds = getViewerPersistedStorageIds(viewerState);
	for (const storageId of storageIds) {
		if (!knownStorageIds.has(storageId)) {
			throw new ConvexError(
				"Uploaded lesson media is not bound to this viewer",
			);
		}
	}
}

export function canAccessLesson(
	lessonKey: string,
	viewerState: ViewerCourseState,
) {
	return (
		viewerState.unlockedLessonKeys.has(lessonKey) ||
		viewerState.compatibleCompletedLessonKeySet.has(lessonKey)
	);
}

export function ensureLessonIsUnlocked(
	lessonKey: string,
	viewerState: ViewerCourseState,
) {
	if (!canAccessLesson(lessonKey, viewerState)) {
		throw new ConvexError("Lesson is still locked");
	}
}

export function isCompatibleLessonState(
	lesson: LessonConfig,
	lessonState: LessonStateDoc | null | undefined,
) {
	if (!lessonState) {
		return false;
	}

	return isLessonFieldShapeCompatible(lesson, lessonState.fieldValues);
}

export function getNormalizedLessonFieldValues(
	lesson: LessonConfig,
	lessonState: LessonStateDoc | null | undefined,
) {
	return normalizeLessonFieldValues(lesson, lessonState?.fieldValues ?? {});
}

function requireCompletedPinnedArtifacts(lesson: LessonConfig) {
	return (
		lesson.workbench === "brief_assembler" &&
		lesson.briefAssembler?.variant === "stage_unlock"
	);
}

export async function upsertLessonState(
	ctx: CourseMutationCtx,
	viewerState: ViewerCourseState,
	lesson: LessonConfig,
	options: LessonStateUpsertOptions,
) {
	const existingState = viewerState.lessonStateByLessonKey.get(
		lesson.lessonKey,
	);
	const now = Date.now();

	if (options.mode === "view") {
		if (existingState) {
			await ctx.db.patch(existingState._id, {
				lastViewedAt: now,
				updatedAt: existingState.updatedAt ?? now,
			});

			return { created: false, timestamp: now };
		}

		await ctx.db.insert("lessonStates", {
			clerkUserId: viewerState.clerkUserId,
			courseSlug: COURSE_SLUG,
			curriculumVersion: CURRICULUM_VERSION,
			lessonKey: lesson.lessonKey,
			lessonId: lesson.displayLabel,
			blockId: lesson.block,
			status: "not_started",
			artifactKey: lesson.artifact.key,
			artifactType: lesson.artifact.type,
			fieldValues: {},
			startedAt: now,
			updatedAt: now,
			lastViewedAt: now,
		});

		return { created: true, timestamp: now };
	}

	const fieldValues = prepareFieldValuesForPersistence(
		lesson,
		options.fieldValues,
	);
	assertFieldValuesUseKnownStorageIds(viewerState, fieldValues);

	if (existingState) {
		await ctx.db.patch(existingState._id, {
			fieldValues,
			status:
				options.mode === "complete"
					? "completed"
					: existingState.status === "completed"
						? "completed"
						: "in_progress",
			updatedAt: now,
			lastViewedAt: now,
			...(options.mode === "complete" ? { completedAt: now } : {}),
		});

		return { created: false, timestamp: now };
	}

	await ctx.db.insert("lessonStates", {
		clerkUserId: viewerState.clerkUserId,
		courseSlug: COURSE_SLUG,
		curriculumVersion: CURRICULUM_VERSION,
		lessonKey: lesson.lessonKey,
		lessonId: lesson.displayLabel,
		blockId: lesson.block,
		status: options.mode === "complete" ? "completed" : "in_progress",
		artifactKey: lesson.artifact.key,
		artifactType: lesson.artifact.type,
		fieldValues,
		startedAt: now,
		updatedAt: now,
		lastViewedAt: now,
		...(options.mode === "complete" ? { completedAt: now } : {}),
	});

	return { created: true, timestamp: now };
}

export async function hydrateUploadUrls(
	_ctx: CourseQueryCtx,
	fieldValues: PersistedFieldValues | null | undefined,
): Promise<PersistedFieldValues> {
	const values = normalizeFieldValues(fieldValues);

	function hydrateUploadValue(value: UploadHydrationCandidate) {
		return {
			...value,
			status: "stored",
			url: undefined,
			previewUrl: undefined,
		};
	}

	return Object.fromEntries(
		await Promise.all(
			Object.entries(values).map(async ([fieldId, value]) => {
				if (isReferenceGalleryValue(value)) {
					return [
						fieldId,
						await hydrateReferenceGalleryValue(value, async () => null),
					];
				}

				if (isUploadFieldValueArray(value)) {
					return [
						fieldId,
						await Promise.all(
							value.map(async (item) => {
								if (!item.storageId) {
									return item;
								}

								return hydrateUploadValue(item as UploadHydrationCandidate);
							}),
						),
					];
				}

				if (!isUploadFieldValue(value) || !value.storageId) {
					return [fieldId, value];
				}

				return [fieldId, hydrateUploadValue(value as UploadHydrationCandidate)];
			}),
		),
	) as PersistedFieldValues;
}

export async function buildResolvedArtifactPreviewForLesson(
	ctx: CourseQueryCtx,
	viewerState: ViewerCourseState,
	lesson: LessonConfig,
	cache: Map<string, ArtifactPreview | null>,
	options: PinnedArtifactOptions,
): Promise<ArtifactPreview | null> {
	if (cache.has(lesson.lessonKey)) {
		return cache.get(lesson.lessonKey) ?? null;
	}

	const lessonState = viewerState.lessonStateByLessonKey.get(lesson.lessonKey);
	if (
		!isCompatibleLessonState(lesson, lessonState) ||
		(options.requireCompletedSource && lessonState?.status !== "completed")
	) {
		cache.set(lesson.lessonKey, null);
		return null;
	}

	const pinnedArtifacts = await Promise.all(
		(lesson.pinnedArtifacts ?? []).map(async (artifactKey) => {
			const sourceLesson = getLessonByArtifactKey(artifactKey);
			if (!sourceLesson) {
				return null;
			}

			return buildResolvedArtifactPreviewForLesson(
				ctx,
				viewerState,
				sourceLesson,
				cache,
				options,
			);
		}),
	);

	const preview = buildResolvedArtifactPreview(
		lesson,
		await hydrateUploadUrls(
			ctx,
			getNormalizedLessonFieldValues(lesson, lessonState),
		),
		pinnedArtifacts.filter(isPresent),
	);

	cache.set(lesson.lessonKey, preview);
	return preview;
}

export async function getResolvedPinnedArtifactsForLesson(
	ctx: CourseQueryCtx,
	viewerState: ViewerCourseState,
	lesson: LessonConfig,
) {
	const cache = new Map<string, ArtifactPreview | null>();
	const options = {
		requireCompletedSource: requireCompletedPinnedArtifacts(lesson),
	};

	const pinnedArtifacts = await Promise.all(
		(lesson.pinnedArtifacts ?? []).map(async (artifactKey) => {
			const sourceLesson = getLessonByArtifactKey(artifactKey);
			if (!sourceLesson) {
				return null;
			}

			return buildResolvedArtifactPreviewForLesson(
				ctx,
				viewerState,
				sourceLesson,
				cache,
				options,
			);
		}),
	);

	return pinnedArtifacts.filter(isPresent);
}

export function getResolvedPinnedArtifactsForCompletion(
	viewerState: ViewerCourseState,
	lesson: LessonConfig,
) {
	const requireCompletedSource = requireCompletedPinnedArtifacts(lesson);

	return (lesson.pinnedArtifacts ?? [])
		.map((artifactKey) => {
			const sourceLesson = getLessonByArtifactKey(artifactKey);
			const sourceState = sourceLesson
				? viewerState.lessonStateByLessonKey.get(sourceLesson.lessonKey)
				: null;

			if (
				!sourceLesson ||
				!sourceState ||
				!isCompatibleLessonState(sourceLesson, sourceState) ||
				(requireCompletedSource && sourceState.status !== "completed")
			) {
				return null;
			}

			return buildResolvedArtifactPreview(
				sourceLesson,
				getNormalizedLessonFieldValues(sourceLesson, sourceState),
			);
		})
		.filter(isPresent);
}
