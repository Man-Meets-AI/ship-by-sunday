import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import {
	COURSE_SLUG,
	buildArtifactPreview,
	getLessonByArtifactKey,
	getLessonById,
	getOrderedBlocks,
	getOrderedLessons,
	getUnlockedLessonIds,
	isLessonImplemented,
	normalizeFieldValues,
	validateRequiredFields,
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

function ensureLessonIsUnlocked(lessonId: string, completedLessonIds: string[]) {
	const unlockedLessonIds = new Set(getUnlockedLessonIds(completedLessonIds));

	if (!unlockedLessonIds.has(lessonId) && !completedLessonIds.includes(lessonId)) {
		throw new ConvexError("Lesson is still locked");
	}
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
				queryBuilder.eq("clerkUserId", args.clerkUserId).eq("courseSlug", courseSlug),
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
		if (
			!process.env.STRIPE_WEBHOOK_SECRET ||
			args.webhookSecret !== process.env.STRIPE_WEBHOOK_SECRET
		) {
			throw new ConvexError("Invalid webhook secret");
		}

		const courseSlug = args.courseSlug ?? COURSE_SLUG;
		const now = Date.now();
		const existingEntitlement = await ctx.db
			.query("courseEntitlements")
			.withIndex("by_clerk_user_id_and_course_slug", (queryBuilder: any) =>
				queryBuilder.eq("clerkUserId", args.clerkUserId).eq("courseSlug", courseSlug),
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
			.filter((state: any) => state.status === "completed")
			.map((state: any) => state.lessonId);
		const unlockedLessonIds = new Set(getUnlockedLessonIds(completedLessonIds));
		const lessons = getOrderedLessons().map((lesson) => {
			const lessonState = lessonStates.find((state: any) => state.lessonId === lesson.id);
			let status: "locked" | "available" | "in_progress" | "completed" = "locked";

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

		const progressCount = lessons.filter((lesson) => lesson.status === "completed").length;

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
			unlockedLessonIds: Array.from(unlockedLessonIds),
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
			.filter((state: any) => state.status === "completed")
			.map((state: any) => state.lessonId);

		ensureLessonIsUnlocked(lesson.id, completedLessonIds);

		const lessonState = lessonStates.find((state: any) => state.lessonId === lesson.id);
		const pinnedArtifacts = (lesson.pinnedArtifacts ?? [])
			.map((artifactKey) => {
				const sourceLesson = getLessonByArtifactKey(artifactKey);
				const sourceState = sourceLesson
					? lessonStates.find((state: any) => state.lessonId === sourceLesson.id)
					: null;

				if (!sourceLesson || !sourceState) {
					return null;
				}

				return buildArtifactPreview(
					sourceLesson,
					normalizeFieldValues(sourceState.fieldValues as any),
				);
			})
			.filter(Boolean);

		return {
			lesson,
			fieldValues: normalizeFieldValues(
				lessonState?.fieldValues as any,
			),
			status: lessonState?.status ?? "not_started",
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
			.filter((state: any) => state.status === "completed")
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
				fieldValues: args.fieldValues,
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
				fieldValues: args.fieldValues,
				startedAt: now,
				updatedAt: now,
				lastViewedAt: now,
			});
		}

		return { savedAt: now };
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
			.filter((state: any) => state.status === "completed")
			.map((state: any) => state.lessonId);

		ensureLessonIsUnlocked(lesson.id, completedLessonIds);

		if (!validateRequiredFields(lesson, args.fieldValues)) {
			throw new ConvexError("Required fields are missing");
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
				fieldValues: args.fieldValues,
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
				fieldValues: args.fieldValues,
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
			.filter((state: any) => state.status === "completed")
			.map((state: any) => {
				const lesson = getLessonById(state.lessonId);
				if (!lesson) {
					return null;
				}

				return {
					...buildArtifactPreview(
						lesson,
						normalizeFieldValues(state.fieldValues as any),
					),
					completedAt: state.completedAt ?? state.updatedAt,
				};
			})
			.filter(Boolean);
	},
});
