import { v } from "convex/values";
import { mutationGeneric as mutation, queryGeneric as query } from "convex/server";

import { requireCurrentWorkspace } from "./auth";
import type { DatabaseLike, EntitlementDoc } from "./types";

type Ctx = { db: DatabaseLike };

export async function getEntitlement(
  ctx: unknown,
  workspaceId: string,
  key: string,
) {
  const typedCtx = ctx as Ctx;

  return (await typedCtx.db
    .query("entitlements")
    .withIndex("by_workspace_key", (query) =>
      query.eq("workspaceId", workspaceId).eq("key", key),
    )
    .unique()) as EntitlementDoc | null;
}

export async function setEntitlement(args: {
  ctx: unknown;
  workspaceId: string;
  key: string;
  enabled: boolean;
  source: string;
}) {
  const typedCtx = args.ctx as Ctx;
  const existing = await getEntitlement(typedCtx, args.workspaceId, args.key);
  const now = Date.now();

  if (existing) {
    await typedCtx.db.patch(existing._id, {
      enabled: args.enabled,
      source: args.source,
      updatedAt: now,
    });
    return existing._id;
  }

  return typedCtx.db.insert("entitlements", {
    workspaceId: args.workspaceId,
    key: args.key,
    enabled: args.enabled,
    source: args.source,
    createdAt: now,
    updatedAt: now,
  });
}

export const currentWorkspaceEntitlements = query({
  args: {},
  handler: async (ctx) => {
    const { workspace } = await requireCurrentWorkspace(ctx);

    return ctx.db
      .query("entitlements")
      .withIndex("by_workspace_key", (query) =>
        query.eq("workspaceId", workspace._id),
      )
      .collect();
  },
});

export const syncWorkspaceEntitlements = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    hasActiveSubscription: v.boolean(),
  },
  handler: async (ctx, args) => {
    await setEntitlement({
      ctx,
      workspaceId: args.workspaceId,
      key: "chat_unlimited",
      enabled: args.hasActiveSubscription,
      source: args.hasActiveSubscription ? "stripe_subscription" : "free_plan",
    });
  },
});
