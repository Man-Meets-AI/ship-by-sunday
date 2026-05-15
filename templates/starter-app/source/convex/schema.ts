import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    authProvider: v.string(),
    authSubject: v.string(),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    name: v.optional(v.string()),
    defaultWorkspaceId: v.optional(v.id("workspaces")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_auth_subject", ["authProvider", "authSubject"])
    .index("by_auth_subject_created_at", [
      "authProvider",
      "authSubject",
      "createdAt",
    ]),

  workspaces: defineTable({
    name: v.string(),
    slug: v.string(),
    personalOwnerAuthSubject: v.optional(v.string()),
    createdByUserId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_personal_owner_auth_subject", ["personalOwnerAuthSubject"]),

  memberships: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_workspace_user", ["workspaceId", "userId"]),

  chatConversations: defineTable({
    workspaceId: v.id("workspaces"),
    createdByUserId: v.id("users"),
    title: v.string(),
    selectedModelKey: v.string(),
    latestOpenAIResponseId: v.optional(v.string()),
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_workspace_updated_at", ["workspaceId", "updatedAt"]),

  chatMessages: defineTable({
    workspaceId: v.id("workspaces"),
    conversationId: v.id("chatConversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    status: v.union(
      v.literal("streaming"),
      v.literal("complete"),
      v.literal("failed"),
    ),
    sourceUserMessageId: v.optional(v.id("chatMessages")),
    modelKey: v.optional(v.string()),
    modelId: v.optional(v.string()),
    reasoningEffort: v.optional(v.string()),
    verbosity: v.optional(v.string()),
    openAIResponseId: v.optional(v.string()),
    previousResponseId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    attemptCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_conversation_created_at", ["conversationId", "createdAt"])
    .index("by_conversation_status_created_at", [
      "conversationId",
      "status",
      "createdAt",
    ])
    .index("by_workspace_role_status_created_at", [
      "workspaceId",
      "role",
      "status",
      "createdAt",
    ]),

  stripeCustomers: defineTable({
    workspaceId: v.id("workspaces"),
    stripeCustomerId: v.string(),
    email: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_stripe_customer_id", ["stripeCustomerId"]),

  subscriptions: defineTable({
    workspaceId: v.id("workspaces"),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.optional(v.string()),
    stripeProductId: v.optional(v.string()),
    status: v.string(),
    cancelAtPeriodEnd: v.boolean(),
    currentPeriodEnd: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_stripe_subscription_id", ["stripeSubscriptionId"]),

  entitlements: defineTable({
    workspaceId: v.id("workspaces"),
    key: v.string(),
    source: v.string(),
    enabled: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_workspace_key", ["workspaceId", "key"]),

  processedStripeEvents: defineTable({
    stripeEventId: v.string(),
    type: v.string(),
    workspaceId: v.optional(v.id("workspaces")),
    status: v.union(v.literal("applied"), v.literal("skipped")),
    processedAt: v.number(),
  }).index("by_stripe_event_id", ["stripeEventId"]),
});
