import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	courseEntitlements: defineTable({
		clerkUserId: v.string(),
		courseSlug: v.string(),
		status: v.union(
			v.literal("active"),
			v.literal("pending"),
			v.literal("revoked"),
			v.literal("refunded"),
		),
		source: v.union(
			v.literal("manual"),
			v.literal("stripe_checkout"),
			v.literal("stripe_webhook"),
		),
		stripeCustomerId: v.optional(v.string()),
		stripeCheckoutSessionId: v.optional(v.string()),
		stripePaymentIntentId: v.optional(v.string()),
		grantedAt: v.number(),
		updatedAt: v.number(),
		revokedAt: v.optional(v.number()),
	})
		.index("by_clerk_user_id_and_course_slug", ["clerkUserId", "courseSlug"])
		.index("by_stripe_customer_id", ["stripeCustomerId"])
		.index("by_stripe_checkout_session_id", ["stripeCheckoutSessionId"]),
	lessonStates: defineTable({
		clerkUserId: v.string(),
		courseSlug: v.string(),
		lessonId: v.string(),
		blockId: v.union(
			v.literal("CEO"),
			v.literal("DESIGN"),
			v.literal("BUILD"),
			v.literal("SHIP"),
		),
		status: v.union(
			v.literal("not_started"),
			v.literal("in_progress"),
			v.literal("completed"),
		),
		artifactKey: v.string(),
		artifactType: v.union(
			v.literal("text"),
			v.literal("table"),
			v.literal("board"),
			v.literal("image"),
			v.literal("images"),
			v.literal("video"),
			v.literal("checklist"),
			v.literal("brief"),
			v.literal("link"),
			v.literal("mixed"),
		),
		fieldValues: v.record(v.string(), v.any()),
		startedAt: v.number(),
		updatedAt: v.number(),
		lastViewedAt: v.optional(v.number()),
		completedAt: v.optional(v.number()),
	})
		.index("by_clerk_user_id_and_lesson_id", ["clerkUserId", "lessonId"])
		.index("by_clerk_user_id_and_status", ["clerkUserId", "status"])
		.index("by_clerk_user_id_and_artifact_key", ["clerkUserId", "artifactKey"]),
});
