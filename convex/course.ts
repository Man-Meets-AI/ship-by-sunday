import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireConvexEnv } from "./env";
import {
	COURSE_SLUG,
	buildArtifactPreview,
	getCompletionIssues,
	getLessonByArtifactKey,
	getLessonById,
	getOrderedBlocks,
	getOrderedLessons,
	getStudentFacingLessons,
	getUnlockedLessonIds,
	isLessonFieldShapeCompatible,
	isLessonImplemented,
	normalizeLessonFieldValues,
	normalizeFieldValues,
	prepareFieldValuesForPersistence,
} from "../lib/course/registry";

async function requireViewer(ctx: any) {
	const identity = await ctx.auth.getUserIdentity();

	if (!identity) {
		throw new ConvexError("Unauthorized");
	}

	return identity.subject;
}

async function getEntitlementByCourse(ctx: any, clerkUserId: string) {
	return ctx.db
		.query("courseEntitlements")
		.withIndex("by_clerk_user_id_and_course_slug", (queryBuilder: any) =>
			queryBuilder.eq("clerkUserId", clerkUserId).eq("courseSlug", COURSE_SLUG),
		)
		.unique();
}

async function requireActiveEntitlement(ctx: any) {
	const clerkUserId = await requireViewer(ctx);
	const entitlement = await getEntitlementByCourse(ctx, clerkUserId);

	if (!entitlement || entitlement.status !== "active") {
		throw new ConvexError("Access required");
	}

	return clerkUserId;
}

async function getViewerLessonStates(ctx: any, clerkUserId: string) {
	return ctx.db
		.query("lessonStates")
		.withIndex("by_clerk_user_id_and_status", (queryBuilder: any) =>
			queryBuilder.eq("clerkUserId", clerkUserId),
		)
		.collect();
}

function ensureLessonIsUnlocked(
	lessonId: string,
	completedLessonIds: string[],
) {
	const unlockedLessonIds = new Set(getUnlockedLessonIds(completedLessonIds));

	if (
		!unlockedLessonIds.has(lessonId) &&
		!completedLessonIds.includes(lessonId)
	) {
		throw new ConvexError("Lesson is still locked");
	}
}

async function hydrateUploadUrls(
	ctx: any,
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
		const clerkUserId = await requireActiveEntitlement(ctx);
		const lessonStates = await getViewerLessonStates(ctx, clerkUserId);
		const completedLessonIds = lessonStates
			.filter((state: any) => {
				if (state.status !== "completed") {
					return false;
				}

				const lesson = getLessonById(state.lessonId);
				return lesson
					? isLessonFieldShapeCompatible(lesson, state.fieldValues as any)
					: false;
			})
			.map((state: any) => state.lessonId);
		const unlockedLessonIds = new Set(getUnlockedLessonIds(completedLessonIds));
		const lessons = getStudentFacingLessons().map((lesson) => {
			const lessonState = lessonStates.find(
				(state: any) => state.lessonId === lesson.id,
			);
			let status: "locked" | "available" | "in_progress" | "completed" =
				"locked";

			if (lessonState?.status === "completed") {
				status = "completed";
			} else if (lessonState?.status === "in_progress") {
				status = "in_progress";
			} else if (unlockedLessonIds.has(lesson.id)) {
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
			unlockedLessonIds: Array.from(unlockedLessonIds).filter(
				(lessonId) => lessonId !== "0.0",
			),
		};
	},
});

export const getLessonState = query({
	args: { lessonId: v.string() },
	returns: v.any(),
	handler: async (ctx, args) => {
		const clerkUserId = await requireActiveEntitlement(ctx);
		const lesson = getLessonById(args.lessonId);

		if (!lesson) {
			throw new ConvexError("Lesson not found");
		}

		const lessonStates = await getViewerLessonStates(ctx, clerkUserId);
		const completedLessonIds = lessonStates
			.filter((state: any) => {
				if (state.status !== "completed") {
					return false;
				}

				const stateLesson = getLessonById(state.lessonId);
				return stateLesson
					? isLessonFieldShapeCompatible(stateLesson, state.fieldValues as any)
					: false;
			})
			.map((state: any) => state.lessonId);

		const unlockedLessonIds = new Set(getUnlockedLessonIds(completedLessonIds));
		const canOpenLesson =
			unlockedLessonIds.has(lesson.id) ||
			completedLessonIds.includes(lesson.id);

		if (!canOpenLesson) {
			return {
				accessStatus: "locked",
				lessonId: lesson.id,
				title: lesson.title,
				shortTitle: lesson.shortTitle,
				requiredLessonId: lesson.prevLessonId ?? null,
			};
		}

		const lessonState = lessonStates.find(
			(state: any) => state.lessonId === lesson.id,
		);
		const lessonStateIsCompatible = lessonState
			? isLessonFieldShapeCompatible(lesson, lessonState.fieldValues as any)
			: false;
		const pinnedArtifacts = (lesson.pinnedArtifacts ?? [])
			.map((artifactKey) => {
				const sourceLesson = getLessonByArtifactKey(artifactKey);
				const sourceState = sourceLesson
					? lessonStates.find(
							(state: any) => state.lessonId === sourceLesson.id,
						)
					: null;

				if (!sourceLesson || !sourceState) {
					return null;
				}

				return buildArtifactPreview(
					sourceLesson,
					normalizeLessonFieldValues(sourceLesson, sourceState.fieldValues as any),
				);
			})
			.filter(Boolean);

		return {
			accessStatus: "unlocked",
			lesson,
			fieldValues: await hydrateUploadUrls(
				ctx,
				lessonStateIsCompatible ? (lessonState?.fieldValues as any) : {},
			),
			status: lessonStateIsCompatible
				? (lessonState?.status ?? "not_started")
				: "not_started",
			pinnedArtifacts,
			isImplemented: isLessonImplemented(lesson),
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
		const clerkUserId = await requireActiveEntitlement(ctx);
		const lesson = getLessonById(args.lessonId);

		if (!lesson) {
			throw new ConvexError("Lesson not found");
		}

		const lessonStates = await getViewerLessonStates(ctx, clerkUserId);
		const completedLessonIds = lessonStates
			.filter((state: any) => {
				if (state.status !== "completed") {
					return false;
				}

				const stateLesson = getLessonById(state.lessonId);
				return stateLesson
					? isLessonFieldShapeCompatible(stateLesson, state.fieldValues as any)
					: false;
			})
			.map((state: any) => state.lessonId);

		ensureLessonIsUnlocked(lesson.id, completedLessonIds);

		const existingState = await ctx.db
			.query("lessonStates")
			.withIndex("by_clerk_user_id_and_lesson_id", (queryBuilder: any) =>
				queryBuilder.eq("clerkUserId", clerkUserId).eq("lessonId", lesson.id),
			)
			.unique();
		const now = Date.now();

		if (existingState) {
			await ctx.db.patch(existingState._id, {
				fieldValues: prepareFieldValuesForPersistence(
					lesson,
					args.fieldValues as any,
				),
				status:
					existingState.status === "completed" ? "completed" : "in_progress",
				updatedAt: now,
				lastViewedAt: now,
			});
		} else {
			await ctx.db.insert("lessonStates", {
				clerkUserId,
				courseSlug: COURSE_SLUG,
				lessonId: lesson.id,
				blockId: lesson.block,
				status: "in_progress",
				artifactKey: lesson.artifact.key,
				artifactType: lesson.artifact.type,
				fieldValues: prepareFieldValuesForPersistence(
					lesson,
					args.fieldValues as any,
				),
				startedAt: now,
				updatedAt: now,
				lastViewedAt: now,
			});
		}

		return { savedAt: now };
	},
});

export const markLessonViewed = mutation({
	args: {
		lessonId: v.string(),
	},
	returns: v.any(),
	handler: async (ctx, args) => {
		const clerkUserId = await requireActiveEntitlement(ctx);
		const lesson = getLessonById(args.lessonId);

		if (!lesson) {
			throw new ConvexError("Lesson not found");
		}

		const lessonStates = await getViewerLessonStates(ctx, clerkUserId);
		const completedLessonIds = lessonStates
			.filter((state: any) => {
				if (state.status !== "completed") {
					return false;
				}

				const stateLesson = getLessonById(state.lessonId);
				return stateLesson
					? isLessonFieldShapeCompatible(stateLesson, state.fieldValues as any)
					: false;
			})
			.map((state: any) => state.lessonId);

		ensureLessonIsUnlocked(lesson.id, completedLessonIds);

		const existingState = await ctx.db
			.query("lessonStates")
			.withIndex("by_clerk_user_id_and_lesson_id", (queryBuilder: any) =>
				queryBuilder.eq("clerkUserId", clerkUserId).eq("lessonId", lesson.id),
			)
			.unique();
		const now = Date.now();

		if (existingState) {
			await ctx.db.patch(existingState._id, {
				lastViewedAt: now,
				updatedAt: existingState.updatedAt ?? now,
			});

			return { viewedAt: now, created: false };
		}

		await ctx.db.insert("lessonStates", {
			clerkUserId,
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

		return { viewedAt: now, created: true };
	},
});

export const completeLesson = mutation({
	args: {
		lessonId: v.string(),
		fieldValues: v.record(v.string(), v.any()),
	},
	returns: v.any(),
	handler: async (ctx, args) => {
		const clerkUserId = await requireActiveEntitlement(ctx);
		const lesson = getLessonById(args.lessonId);

		if (!lesson) {
			throw new ConvexError("Lesson not found");
		}

		const lessonStates = await getViewerLessonStates(ctx, clerkUserId);
		const completedLessonIds = lessonStates
			.filter((state: any) => {
				if (state.status !== "completed") {
					return false;
				}

				const stateLesson = getLessonById(state.lessonId);
				return stateLesson
					? isLessonFieldShapeCompatible(stateLesson, state.fieldValues as any)
					: false;
			})
			.map((state: any) => state.lessonId);

		ensureLessonIsUnlocked(lesson.id, completedLessonIds);

		const completionIssues = getCompletionIssues(lesson, args.fieldValues);
		if (completionIssues.length > 0) {
			throw new ConvexError({
				code: "INCOMPLETE_LESSON",
				message: "Finish the required work before continuing.",
				issues: completionIssues,
			});
		}

		const existingState = await ctx.db
			.query("lessonStates")
			.withIndex("by_clerk_user_id_and_lesson_id", (queryBuilder: any) =>
				queryBuilder.eq("clerkUserId", clerkUserId).eq("lessonId", lesson.id),
			)
			.unique();
		const now = Date.now();

		if (existingState) {
			await ctx.db.patch(existingState._id, {
				fieldValues: prepareFieldValuesForPersistence(
					lesson,
					args.fieldValues as any,
				),
				status: "completed",
				updatedAt: now,
				lastViewedAt: now,
				completedAt: now,
			});
		} else {
			await ctx.db.insert("lessonStates", {
				clerkUserId,
				courseSlug: COURSE_SLUG,
				lessonId: lesson.id,
				blockId: lesson.block,
				status: "completed",
				artifactKey: lesson.artifact.key,
				artifactType: lesson.artifact.type,
				fieldValues: prepareFieldValuesForPersistence(
					lesson,
					args.fieldValues as any,
				),
				startedAt: now,
				updatedAt: now,
				lastViewedAt: now,
				completedAt: now,
			});
		}

		return { completedAt: now, nextLessonId: lesson.nextLessonId ?? null };
	},
});

export const listArtifacts = query({
	args: {},
	returns: v.any(),
	handler: async (ctx) => {
		const clerkUserId = await requireActiveEntitlement(ctx);
		const lessonStates = await getViewerLessonStates(ctx, clerkUserId);

		return lessonStates
			.filter((state: any) => {
				if (state.status !== "completed") {
					return false;
				}

				const lesson = getLessonById(state.lessonId);
				return lesson
					? isLessonFieldShapeCompatible(lesson, state.fieldValues as any)
					: false;
			})
			.map((state: any) => {
				const lesson = getLessonById(state.lessonId);
				if (!lesson) {
					return null;
				}

				return {
					...buildArtifactPreview(
						lesson,
						normalizeLessonFieldValues(lesson, state.fieldValues as any),
					),
					completedAt: state.completedAt ?? state.updatedAt,
				};
			})
			.filter(Boolean);
	},
});
