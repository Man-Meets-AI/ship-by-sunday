import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { fieldValuesValidator } from "./course/validators";
import { codexRateLimitSnapshotsByIdValidator } from "./codexValidators";

export default defineSchema({
	productAccessGrants: defineTable({
		clerkUserId: v.string(),
		status: v.union(
			v.literal("granted"),
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
		.index("by_clerk_user_id", ["clerkUserId"])
		.index("by_stripe_customer_id", ["stripeCustomerId"])
		.index("by_stripe_checkout_session_id", ["stripeCheckoutSessionId"]),
	starterRepoAccess: defineTable({
		clerkUserId: v.string(),
		courseSlug: v.string(),
		githubUsername: v.string(),
		githubUsernameLower: v.string(),
		status: v.union(
			v.literal("requested"),
			v.literal("invited"),
			v.literal("accepted"),
			v.literal("failed"),
		),
		requestedAt: v.number(),
		updatedAt: v.number(),
		invitedAt: v.optional(v.number()),
		acceptedAt: v.optional(v.number()),
		invitationId: v.optional(v.string()),
		lastError: v.optional(v.string()),
	})
		.index("by_clerk_user_id_and_course_slug", ["clerkUserId", "courseSlug"])
		.index("by_status", ["status"])
		.index("by_github_username_lower", ["githubUsernameLower"]),
	lessonStates: defineTable({
		clerkUserId: v.string(),
		courseSlug: v.string(),
		curriculumVersion: v.optional(v.number()),
		lessonKey: v.optional(v.string()),
		lessonId: v.optional(v.string()),
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
		fieldValues: fieldValuesValidator,
		startedAt: v.number(),
		updatedAt: v.number(),
		lastViewedAt: v.optional(v.number()),
		completedAt: v.optional(v.number()),
	})
		.index("by_clerk_user_id_and_status", ["clerkUserId", "status"])
		.index("by_clerk_user_id_and_artifact_key", ["clerkUserId", "artifactKey"]),
	codexConnections: defineTable({
		clerkUserId: v.string(),
		authMode: v.union(v.literal("managed_chatgpt")),
		accountId: v.optional(v.string()),
		planType: v.optional(v.string()),
		connectedAt: v.optional(v.number()),
		status: v.union(
			v.literal("connecting"),
			v.literal("connected"),
			v.literal("disconnected"),
			v.literal("error"),
		),
		lastRateLimitSnapshot: v.optional(codexRateLimitSnapshotsByIdValidator),
		updatedAt: v.number(),
	})
		.index("by_clerk_user_id", ["clerkUserId"])
		.index("by_clerk_user_id_and_status", ["clerkUserId", "status"]),
	codexRuns: defineTable({
		userId: v.string(),
		lessonId: v.optional(v.string()),
		templateId: v.string(),
		status: v.union(v.literal("success"), v.literal("error")),
		latencyMs: v.optional(v.number()),
		errorCode: v.optional(v.string()),
		createdAt: v.number(),
	})
		.index("by_user_id", ["userId"])
		.index("by_user_id_and_template_id", ["userId", "templateId"]),
});
