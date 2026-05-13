import { v } from "convex/values";
import {
  mutationGeneric as mutation,
  queryGeneric as query,
} from "convex/server";

import { canManageBilling, requireCurrentWorkspace } from "./auth";
import { currentSubscriptionStatuses } from "../src/lib/billing/plans";
import type {
  EntitlementDoc,
  StripeCustomerDoc,
  SubscriptionDoc,
} from "./types";
import { upsertStripeCustomerMapping } from "./stripe_customers";

function sortSubscriptionsByRecency(
  left: SubscriptionDoc,
  right: SubscriptionDoc,
) {
  if (left.updatedAt !== right.updatedAt) {
    return right.updatedAt - left.updatedAt;
  }

  if (left.createdAt !== right.createdAt) {
    return right.createdAt - left.createdAt;
  }

  return right._id.localeCompare(left._id);
}

export function selectCurrentSubscription(subscriptions: SubscriptionDoc[]) {
  const currentLikeSubscriptions = subscriptions.filter((subscription) =>
    currentSubscriptionStatuses.has(subscription.status),
  );

  if (currentLikeSubscriptions.length > 1) {
    throw new Error(
      "Expected at most one current subscription record per workspace. Reconcile Stripe billing state before continuing.",
    );
  }

  if (currentLikeSubscriptions.length === 1) {
    return currentLikeSubscriptions[0];
  }

  return [...subscriptions].sort(sortSubscriptionsByRecency)[0] ?? null;
}

export const currentWorkspaceState = query({
  args: {},
  handler: async (ctx) => {
    const { workspace, membership } = await requireCurrentWorkspace(ctx);
    const customer = (await ctx.db
      .query("stripeCustomers")
      .withIndex("by_workspace", (query) =>
        query.eq("workspaceId", workspace._id),
      )
      .unique()) as StripeCustomerDoc | null;
    const subscriptions = (await ctx.db
      .query("subscriptions")
      .withIndex("by_workspace", (query) =>
        query.eq("workspaceId", workspace._id),
      )
      .collect()) as SubscriptionDoc[];
    const entitlements = (await ctx.db
      .query("entitlements")
      .withIndex("by_workspace_key", (query) =>
        query.eq("workspaceId", workspace._id),
      )
      .collect()) as EntitlementDoc[];

    const currentSubscription = selectCurrentSubscription(subscriptions);

    return {
      workspace,
      membership,
      customer,
      subscription: currentSubscription,
      entitlements,
    };
  },
});

export const upsertCurrentWorkspaceStripeCustomer = mutation({
  args: {
    stripeCustomerId: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { workspace, membership } = await requireCurrentWorkspace(ctx);

    if (!canManageBilling(membership)) {
      throw new Error("Only workspace owners and admins can manage billing.");
    }

    return upsertStripeCustomerMapping({
      conflictStrategy: "preserve_existing",
      db: ctx.db,
      email: args.email,
      now: Date.now(),
      stripeCustomerId: args.stripeCustomerId,
      workspaceId: workspace._id,
    });
  },
});
