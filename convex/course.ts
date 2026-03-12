import { ConvexError, v } from "convex/values";
import type { LessonConfig } from "../lib/course/contracts";
import { requireConvexEnv } from "./env";
import {
	COURSE_SLUG,
	buildResolvedArtifactPreview,
	getCompletionIssues,
	getLessonByArtifactKey,
	getLessonById,
	getOrderedBlocks,
	getStudentFacingLessons,
	getUnlockedLessonIds,
	isLessonFieldShapeCompatible,
	isLessonImplemented,
	normalizeLessonFieldValues,
	normalizeFieldValues,
	prepareFieldValuesForPersistence,
	type ArtifactPreview,
	type PersistedFieldValues,
} from "../lib/course/registry";
import type { Doc } from "./_generated/dataModel";
import {
	internalMutation,
	mutation,
	query,
	type MutationCtx,
	type QueryCtx,
} from "./_generated/server";

type CourseReadCtx = QueryCtx | MutationCtx;
type LessonStateDoc = Doc<"lessonStates">;

type ViewerCourseState = {
	clerkUserId: string;
	lessonStates: LessonStateDoc[];
	lessonStateByLessonId: Map<string, LessonStateDoc>;
	compatibleCompletedLessonIds: string[];
	compatibleCompletedLessonIdSet: Set<string>;
	unlockedLessonIds: Set<string>;
};

type LessonStateUpsertOptions =
	| {
			mode: "view";
	  }
	| {
			mode: "draft" | "complete";
			fieldValues: PersistedFieldValues;
	  };

async function requireViewer(ctx: CourseReadCtx) {
	const identity = await ctx.auth.getUserIdentity();

	if (!identity) {
		throw new ConvexError("Unauthorized");
	}

	return identity.subject;
}

async function getEntitlementByCourse(ctx: CourseReadCtx, clerkUserId: string) {
	return ctx.db
		.query("courseEntitlements")
		.withIndex("by_clerk_user_id_and_course_slug", (queryBuilder: any) =>
			queryBuilder.eq("clerkUserId", clerkUserId).eq("courseSlug", COURSE_SLUG),
		)
		.unique();
}

async function requireActiveEntitlement(ctx: CourseReadCtx) {
	const clerkUserId = await requireViewer(ctx);
	const entitlement = await getEntitlementByCourse(ctx, clerkUserId);

	if (!entitlement || entitlement.status !== "active") {
		throw new ConvexError("Access required");
	}

	return clerkUserId;
}

async function getViewerLessonStates(
	ctx: CourseReadCtx,
	clerkUserId: string,
): Promise<LessonStateDoc[]> {
	return ctx.db
		.query("lessonStates")
		.withIndex("by_clerk_user_id_and_status", (queryBuilder: any) =>
			queryBuilder.eq("clerkUserId", clerkUserId),
		)
		.collect();
}

function getCompatibleCompletedLessonIds(lessonStates: LessonStateDoc[]) {
	return lessonStates.flatMap((state) => {
		if (state.status !== "completed") {
			return [];
		}

		const lesson = getLessonById(state.lessonId);
		if (
			!lesson ||
			!isLessonFieldShapeCompatible(
				lesson,
				state.fieldValues as PersistedFieldValues,
			)
		) {
			return [];
		}

		return [state.lessonId];
	});
}

async function loadViewerCourseState(
	ctx: CourseReadCtx,
): Promise<ViewerCourseState> {
	const clerkUserId = await requireActiveEntitlement(ctx);
	const lessonStates = await getViewerLessonStates(ctx, clerkUserId);
	const compatibleCompletedLessonIds =
		getCompatibleCompletedLessonIds(lessonStates);

	return {
		clerkUserId,
		lessonStates,
		lessonStateByLessonId: new Map(
			lessonStates.map((state) => [state.lessonId, state]),
		),
		compatibleCompletedLessonIds,
		compatibleCompletedLessonIdSet: new Set(compatibleCompletedLessonIds),
		unlockedLessonIds: new Set(
			getUnlockedLessonIds(compatibleCompletedLessonIds),
		),
	};
}

function canAccessLesson(lessonId: string, viewerState: ViewerCourseState) {
	return (
		viewerState.unlockedLessonIds.has(lessonId) ||
		viewerState.compatibleCompletedLessonIdSet.has(lessonId) ||
		viewerState.lessonStateByLessonId.has(lessonId)
	);
}

function ensureLessonIsUnlocked(
	lessonId: string,
	viewerState: ViewerCourseState,
) {
	if (!canAccessLesson(lessonId, viewerState)) {
		throw new ConvexError("Lesson is still locked");
	}
}

function isCompatibleLessonState(
	lesson: LessonConfig,
	lessonState: LessonStateDoc | null | undefined,
) {
	return (
		Boolean(lessonState) &&
		isLessonFieldShapeCompatible(
			lesson,
			lessonState?.fieldValues as PersistedFieldValues,
		)
	);
}

function getNormalizedLessonFieldValues(
	lesson: LessonConfig,
	lessonState: LessonStateDoc | null | undefined,
) {
	return normalizeLessonFieldValues(
		lesson,
		(lessonState?.fieldValues ?? {}) as PersistedFieldValues,
	);
}

async function upsertLessonState(
	ctx: MutationCtx,
	viewerState: ViewerCourseState,
	lesson: LessonConfig,
	options: LessonStateUpsertOptions,
) {
	const existingState = viewerState.lessonStateByLessonId.get(lesson.id);
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
			lessonId: lesson.id,
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
		lessonId: lesson.id,
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

async function hydrateUploadUrls(
	ctx: QueryCtx,
	fieldValues: Record<string, unknown>,
) {
	const values = normalizeFieldValues(fieldValues as any);

	return Object.fromEntries(
		await Promise.all(
			Object.entries(values).map(async ([fieldId, value]) => {
				if (
					!value ||
					typeof value !== "object" ||
					Array.isArray(value) ||
					!("kind" in value) ||
					(value as { kind?: string }).kind !== "upload" ||
					!("storageId" in value) ||
					!(value as { storageId?: string }).storageId
				) {
					return [fieldId, value];
				}

				const url = await ctx.storage.getUrl(
					(value as { storageId: string }).storageId as any,
				);

				return [
					fieldId,
					{
						...(value as Record<string, unknown>),
						status: "stored",
						url: url ?? undefined,
					},
				];
			}),
		),
	);
}

async function buildResolvedArtifactPreviewForLesson(
	ctx: QueryCtx,
	viewerState: ViewerCourseState,
	lesson: LessonConfig,
	cache: Map<string, ArtifactPreview | null>,
): Promise<ArtifactPreview | null> {
	if (cache.has(lesson.id)) {
		return cache.get(lesson.id) ?? null;
	}

	const lessonState = viewerState.lessonStateByLessonId.get(lesson.id);
	if (!isCompatibleLessonState(lesson, lessonState)) {
		cache.set(lesson.id, null);
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
			);
		}),
	);

	const preview = buildResolvedArtifactPreview(
		lesson,
		(await hydrateUploadUrls(
			ctx,
			getNormalizedLessonFieldValues(lesson, lessonState),
		)) as PersistedFieldValues,
		pinnedArtifacts.filter(Boolean) as ArtifactPreview[],
	);

	cache.set(lesson.id, preview);
	return preview;
}

async function getResolvedPinnedArtifactsForLesson(
	ctx: QueryCtx,
	viewerState: ViewerCourseState,
	lesson: LessonConfig,
) {
	const cache = new Map<string, ArtifactPreview | null>();

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
			);
		}),
	);

	return pinnedArtifacts.filter(Boolean) as ArtifactPreview[];
}

export const viewerAccess = query({
	args: {},
	returns: v.any(),
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			return {
				clerkUserId: null,
				courseSlug: COURSE_SLUG,
				hasAccess: false,
				status: "signed_out",
			};
		}

		const entitlement = await getEntitlementByCourse(ctx, identity.subject);

		return {
			clerkUserId: identity.subject,
			courseSlug: COURSE_SLUG,
			hasAccess: entitlement?.status === "active",
			status: entitlement?.status ?? "none",
		};
	},
});

export const getResumeDestination = query({
	args: {},
	returns: v.any(),
	handler: async (ctx) => {
		const clerkUserId = await requireActiveEntitlement(ctx);
		const lessonStates = await getViewerLessonStates(ctx, clerkUserId);

		const latestLessonState = [...lessonStates]
			.filter((state: any) => Boolean(getLessonById(state.lessonId)))
			.sort((left: any, right: any) => {
				const leftTimestamp =
					left.lastViewedAt ?? left.updatedAt ?? left.startedAt ?? 0;
				const rightTimestamp =
					right.lastViewedAt ?? right.updatedAt ?? right.startedAt ?? 0;
				return rightTimestamp - leftTimestamp;
			})[0];

		if (!latestLessonState) {
			return {
				destination: "/mission",
				lessonId: null,
			};
		}

		return {
			destination: `/lesson/${latestLessonState.lessonId}`,
			lessonId: latestLessonState.lessonId,
		};
	},
});

export const grantEntitlement = internalMutation({
	args: {
		clerkUserId: v.string(),
		courseSlug: v.optional(v.string()),
		source: v.optional(
			v.union(
				v.literal("manual"),
				v.literal("stripe_checkout"),
				v.literal("stripe_webhook"),
			),
		),
		stripeCustomerId: v.optional(v.string()),
		stripeCheckoutSessionId: v.optional(v.string()),
		stripePaymentIntentId: v.optional(v.string()),
	},
	returns: v.any(),
	handler: async (ctx, args) => {
		const courseSlug = args.courseSlug ?? COURSE_SLUG;
		const now = Date.now();
		const existingEntitlement = await ctx.db
			.query("courseEntitlements")
			.withIndex("by_clerk_user_id_and_course_slug", (queryBuilder: any) =>
				queryBuilder
					.eq("clerkUserId", args.clerkUserId)
					.eq("courseSlug", courseSlug),
			)
			.unique();

		if (existingEntitlement) {
			await ctx.db.patch(existingEntitlement._id, {
				status: "active",
				source: args.source ?? "manual",
				stripeCustomerId: args.stripeCustomerId,
				stripeCheckoutSessionId: args.stripeCheckoutSessionId,
				stripePaymentIntentId: args.stripePaymentIntentId,
				updatedAt: now,
				revokedAt: undefined,
			});

			return { courseSlug, granted: "patched" };
		}

		await ctx.db.insert("courseEntitlements", {
			clerkUserId: args.clerkUserId,
			courseSlug,
			status: "active",
			source: args.source ?? "manual",
			stripeCustomerId: args.stripeCustomerId,
			stripeCheckoutSessionId: args.stripeCheckoutSessionId,
			stripePaymentIntentId: args.stripePaymentIntentId,
			grantedAt: now,
			updatedAt: now,
		});

		return { courseSlug, granted: "inserted" };
	},
});

export const grantEntitlementFromStripe = mutation({
	args: {
		webhookSecret: v.string(),
		clerkUserId: v.string(),
		courseSlug: v.optional(v.string()),
		stripeCustomerId: v.optional(v.string()),
		stripeCheckoutSessionId: v.optional(v.string()),
		stripePaymentIntentId: v.optional(v.string()),
	},
	returns: v.any(),
	handler: async (ctx, args) => {
		if (args.webhookSecret !== requireConvexEnv("STRIPE_WEBHOOK_SECRET")) {
			throw new ConvexError("Invalid webhook secret");
		}

		const courseSlug = args.courseSlug ?? COURSE_SLUG;
		const now = Date.now();
		const existingEntitlement = await ctx.db
			.query("courseEntitlements")
			.withIndex("by_clerk_user_id_and_course_slug", (queryBuilder: any) =>
				queryBuilder
					.eq("clerkUserId", args.clerkUserId)
					.eq("courseSlug", courseSlug),
			)
			.unique();

		if (existingEntitlement) {
			await ctx.db.patch(existingEntitlement._id, {
				status: "active",
				source: "stripe_webhook",
				stripeCustomerId: args.stripeCustomerId,
				stripeCheckoutSessionId: args.stripeCheckoutSessionId,
				stripePaymentIntentId: args.stripePaymentIntentId,
				updatedAt: now,
				revokedAt: undefined,
			});

			return { courseSlug, granted: "patched" };
		}

		await ctx.db.insert("courseEntitlements", {
			clerkUserId: args.clerkUserId,
			courseSlug,
			status: "active",
			source: "stripe_webhook",
			stripeCustomerId: args.stripeCustomerId,
			stripeCheckoutSessionId: args.stripeCheckoutSessionId,
			stripePaymentIntentId: args.stripePaymentIntentId,
			grantedAt: now,
			updatedAt: now,
		});

		return { courseSlug, granted: "inserted" };
	},
});

export const getMissionState = query({
	args: {},
	returns: v.any(),
	handler: async (ctx) => {
		const viewerState = await loadViewerCourseState(ctx);
		const lessons = getStudentFacingLessons().map((lesson) => {
			const lessonState = viewerState.lessonStateByLessonId.get(lesson.id);
			const lessonStateIsCompatible = isCompatibleLessonState(
				lesson,
				lessonState,
			);
			let status: "locked" | "available" | "in_progress" | "completed" =
				"locked";

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
			const blockLessons = lessons.filter(
				(lesson) => lesson.block === block.id,
			);
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
	},
});

export const getLessonState = query({
	args: { lessonId: v.string() },
	returns: v.any(),
	handler: async (ctx, args) => {
		const viewerState = await loadViewerCourseState(ctx);
		const lesson = getLessonById(args.lessonId);

		if (!lesson) {
			throw new ConvexError("Lesson not found");
		}

		const canOpenLesson = canAccessLesson(lesson.id, viewerState);

		if (!canOpenLesson) {
			return {
				accessStatus: "locked",
			};
		}

		const lessonState = viewerState.lessonStateByLessonId.get(lesson.id);
		const lessonStateIsCompatible = isCompatibleLessonState(
			lesson,
			lessonState,
		);
		const pinnedArtifacts = await getResolvedPinnedArtifactsForLesson(
			ctx,
			viewerState,
			lesson,
		);

		return {
			accessStatus: "unlocked",
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
	},
});

export const saveLessonDraft = mutation({
	args: {
		lessonId: v.string(),
		fieldValues: v.record(v.string(), v.any()),
	},
	returns: v.any(),
	handler: async (ctx, args) => {
		const viewerState = await loadViewerCourseState(ctx);
		const lesson = getLessonById(args.lessonId);

		if (!lesson) {
			throw new ConvexError("Lesson not found");
		}

		ensureLessonIsUnlocked(lesson.id, viewerState);

		const result = await upsertLessonState(ctx, viewerState, lesson, {
			mode: "draft",
			fieldValues: args.fieldValues as PersistedFieldValues,
		});

		return { savedAt: result.timestamp };
	},
});

export const markLessonViewed = mutation({
	args: {
		lessonId: v.string(),
	},
	returns: v.any(),
	handler: async (ctx, args) => {
		const viewerState = await loadViewerCourseState(ctx);
		const lesson = getLessonById(args.lessonId);

		if (!lesson) {
			throw new ConvexError("Lesson not found");
		}

		ensureLessonIsUnlocked(lesson.id, viewerState);

		const result = await upsertLessonState(ctx, viewerState, lesson, {
			mode: "view",
		});

		return { viewedAt: result.timestamp, created: result.created };
	},
});

export const completeLesson = mutation({
	args: {
		lessonId: v.string(),
		fieldValues: v.record(v.string(), v.any()),
	},
	returns: v.any(),
	handler: async (ctx, args) => {
		const viewerState = await loadViewerCourseState(ctx);
		const lesson = getLessonById(args.lessonId);

		if (!lesson) {
			throw new ConvexError("Lesson not found");
		}

		ensureLessonIsUnlocked(lesson.id, viewerState);

		const pinnedArtifacts = (lesson.pinnedArtifacts ?? [])
			.map((artifactKey) => {
				const sourceLesson = getLessonByArtifactKey(artifactKey);
				const sourceState = sourceLesson
					? viewerState.lessonStateByLessonId.get(sourceLesson.id)
					: null;

				if (
					!sourceLesson ||
					!sourceState ||
					!isCompatibleLessonState(sourceLesson, sourceState)
				) {
					return null;
				}

				return buildResolvedArtifactPreview(
					sourceLesson,
					getNormalizedLessonFieldValues(sourceLesson, sourceState),
				);
			})
			.filter(Boolean) as ArtifactPreview[];

		const completionIssues = getCompletionIssues(lesson, args.fieldValues, {
			pinnedArtifacts,
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
			fieldValues: args.fieldValues as PersistedFieldValues,
		});

		return {
			completedAt: result.timestamp,
			nextLessonId: lesson.nextLessonId ?? null,
		};
	},
});

export const listArtifacts = query({
	args: {},
	returns: v.any(),
	handler: async (ctx) => {
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
		).filter(Boolean);
	},
});
