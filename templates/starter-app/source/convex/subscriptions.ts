import { v } from "convex/values";
import { mutation } from "./_generated/server";

import { setEntitlement } from "./entitlements";
import type {
  DatabaseLike,
  ProcessedStripeEventDoc,
  SubscriptionDoc,
} from "./types";
import { currentSubscriptionStatuses } from "../src/lib/billing/plans";
import { shouldEnableStarterProEntitlement } from "../src/lib/billing/entitlements";
import { getConvexBillingSyncEnv } from "../src/lib/env/server";
import { upsertStripeCustomerMapping } from "./stripe_customers";

const stripeSyncArgs = {
  mutationSecret: v.string(),
  workspaceId: v.optional(v.id("workspaces")),
  stripeCustomerId: v.string(),
  customerEmail: v.optional(v.string()),
  stripeSubscriptionId: v.optional(v.string()),
  stripePriceId: v.optional(v.string()),
  stripeProductId: v.optional(v.string()),
  status: v.optional(v.string()),
  currentPeriodEnd: v.optional(v.number()),
  cancelAtPeriodEnd: v.optional(v.boolean()),
};

const applyStripeWebhookEventArgs = {
  eventId: v.string(),
  type: v.string(),
  ...stripeSyncArgs,
};

type StripeWebhookMutationCtx = { db: DatabaseLike };

type StripeSyncArgs = {
  workspaceId?: string;
  stripeCustomerId: string;
  customerEmail?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeProductId?: string;
  status?: string;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
};

async function upsertProcessedStripeEvent(
  ctx: StripeWebhookMutationCtx,
  args: {
    existingEventId?: string;
    eventId: string;
    processedAt: number;
    status: "applied" | "skipped";
    type: string;
    workspaceId?: string;
  },
) {
  if (args.existingEventId) {
    await ctx.db.patch(args.existingEventId, {
      type: args.type,
      workspaceId: args.workspaceId,
      status: args.status,
      processedAt: args.processedAt,
    });
    return;
  }

  await ctx.db.insert("processedStripeEvents", {
    stripeEventId: args.eventId,
    type: args.type,
    workspaceId: args.workspaceId,
    status: args.status,
    processedAt: args.processedAt,
  });
}

async function resolveWorkspaceIdFromCustomer(
  ctx: StripeWebhookMutationCtx,
  stripeCustomerId: string,
) {
  const customer = await ctx.db
    .query("stripeCustomers")
    .withIndex("by_stripe_customer_id", (query) =>
      query.eq("stripeCustomerId", stripeCustomerId),
    )
    .unique();

  return customer?.workspaceId as string | undefined;
}

async function upsertStripeCustomer(
  ctx: StripeWebhookMutationCtx,
  args: {
    customerEmail?: string;
    now: number;
    stripeCustomerId: string;
    workspaceId: string;
  },
) {
  await upsertStripeCustomerMapping({
    conflictStrategy: "throw",
    db: ctx.db,
    email: args.customerEmail,
    now: args.now,
    stripeCustomerId: args.stripeCustomerId,
    workspaceId: args.workspaceId,
  });
}

async function disableWorkspaceEntitlements(
  ctx: StripeWebhookMutationCtx,
  args: {
    now: number;
    workspaceId: string;
  },
) {
  const existingSubscriptions = (await ctx.db
    .query("subscriptions")
    .withIndex("by_workspace", (query) =>
      query.eq("workspaceId", args.workspaceId),
    )
    .collect()) as SubscriptionDoc[];

  for (const subscription of existingSubscriptions) {
    await ctx.db.patch(subscription._id, {
      status: "canceled",
      currentPeriodEnd: undefined,
      cancelAtPeriodEnd: false,
      updatedAt: args.now,
    });
  }

  await setEntitlement({
    workspaceId: args.workspaceId,
    ctx,
    key: "chat_unlimited",
    enabled: false,
    source: "free_plan",
  });
}

async function deactivateSiblingSubscriptions(
  ctx: StripeWebhookMutationCtx,
  args: {
    currentStripeSubscriptionId: string;
    now: number;
    workspaceId: string;
  },
) {
  const existingSubscriptions = (await ctx.db
    .query("subscriptions")
    .withIndex("by_workspace", (query) =>
      query.eq("workspaceId", args.workspaceId),
    )
    .collect()) as SubscriptionDoc[];

  for (const subscription of existingSubscriptions) {
    if (
      subscription.stripeSubscriptionId === args.currentStripeSubscriptionId
    ) {
      continue;
    }

    const isCurrentLike = currentSubscriptionStatuses.has(subscription.status);

    await ctx.db.patch(subscription._id, {
      status: isCurrentLike ? "canceled" : subscription.status,
      currentPeriodEnd: undefined,
      cancelAtPeriodEnd: false,
      updatedAt: args.now,
    });
  }
}

export async function syncStripeCustomerStateToDatabase(
  ctx: unknown,
  args: StripeSyncArgs,
) {
  const typedCtx = ctx as StripeWebhookMutationCtx;
  const now = Date.now();
  const workspaceId =
    args.workspaceId ??
    (await resolveWorkspaceIdFromCustomer(typedCtx, args.stripeCustomerId));

  if (!workspaceId) {
    return { skipped: true };
  }

  await upsertStripeCustomer(typedCtx, {
    workspaceId,
    stripeCustomerId: args.stripeCustomerId,
    customerEmail: args.customerEmail,
    now,
  });

  if (!args.stripeSubscriptionId) {
    await disableWorkspaceEntitlements(typedCtx, {
      workspaceId,
      now,
    });

    return { skipped: false, workspaceId };
  }

  const existingSubscription = await typedCtx.db
    .query("subscriptions")
    .withIndex("by_stripe_subscription_id", (query) =>
      query.eq("stripeSubscriptionId", args.stripeSubscriptionId),
    )
    .unique();
  const status = args.status ?? "incomplete";
  const billingSyncEnv = getConvexBillingSyncEnv();
  const hasStarterProEntitlement = shouldEnableStarterProEntitlement({
    status,
    stripePriceId: args.stripePriceId,
    starterPriceId: billingSyncEnv.STRIPE_PRICE_PRO_MONTHLY,
  });

  await deactivateSiblingSubscriptions(typedCtx, {
    currentStripeSubscriptionId: args.stripeSubscriptionId,
    workspaceId,
    now,
  });

  if (existingSubscription) {
    await typedCtx.db.patch(existingSubscription._id, {
      workspaceId,
      stripeCustomerId: args.stripeCustomerId,
      stripePriceId: args.stripePriceId,
      stripeProductId: args.stripeProductId,
      status,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd ?? false,
      updatedAt: now,
    });
  } else {
    await typedCtx.db.insert("subscriptions", {
      workspaceId,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: args.stripePriceId,
      stripeProductId: args.stripeProductId,
      status,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd ?? false,
      createdAt: now,
      updatedAt: now,
    });
  }

  await setEntitlement({
    workspaceId,
    ctx: typedCtx,
    key: "chat_unlimited",
    enabled: hasStarterProEntitlement,
    source: hasStarterProEntitlement ? "stripe_subscription" : "free_plan",
  });

  return { skipped: false, workspaceId };
}

export async function applyStripeWebhookEventToDatabase(
  ctx: unknown,
  args: {
    eventId: string;
    type: string;
  } & StripeSyncArgs,
) {
  const typedCtx = ctx as StripeWebhookMutationCtx;
  const existingEvent = await typedCtx.db
    .query("processedStripeEvents")
    .withIndex("by_stripe_event_id", (query) =>
      query.eq("stripeEventId", args.eventId),
    )
    .unique();
  const processedEvent = existingEvent as ProcessedStripeEventDoc | null;

  if (processedEvent?.status === "applied") {
    return { duplicate: true };
  }

  const now = Date.now();
  const syncResult = await syncStripeCustomerStateToDatabase(typedCtx, {
    workspaceId: args.workspaceId,
    stripeCustomerId: args.stripeCustomerId,
    customerEmail: args.customerEmail,
    stripeSubscriptionId: args.stripeSubscriptionId,
    stripePriceId: args.stripePriceId,
    stripeProductId: args.stripeProductId,
    status: args.status,
    currentPeriodEnd: args.currentPeriodEnd,
    cancelAtPeriodEnd: args.cancelAtPeriodEnd,
  });

  if (syncResult.skipped) {
    await upsertProcessedStripeEvent(typedCtx, {
      existingEventId: processedEvent?._id,
      eventId: args.eventId,
      processedAt: now,
      status: "skipped",
      type: args.type,
    });

    return { duplicate: false, skipped: true };
  }

  await upsertProcessedStripeEvent(typedCtx, {
    existingEventId: processedEvent?._id,
    eventId: args.eventId,
    processedAt: now,
    status: "applied",
    type: args.type,
    workspaceId: syncResult.workspaceId,
  });

  return { duplicate: false, skipped: false };
}

export const applyStripeWebhookEvent = mutation({
  args: applyStripeWebhookEventArgs,
  handler: async (ctx, args) => {
    const billingSyncEnv = getConvexBillingSyncEnv();

    if (args.mutationSecret !== billingSyncEnv.CONVEX_WEBHOOK_MUTATION_SECRET) {
      throw new Error("Unauthorized webhook mutation call.");
    }

    return applyStripeWebhookEventToDatabase(ctx, args);
  },
});

export const syncStripeCustomerState = mutation({
  args: stripeSyncArgs,
  handler: async (ctx, args) => {
    const billingSyncEnv = getConvexBillingSyncEnv();

    if (args.mutationSecret !== billingSyncEnv.CONVEX_WEBHOOK_MUTATION_SECRET) {
      throw new Error("Unauthorized webhook mutation call.");
    }

    return syncStripeCustomerStateToDatabase(ctx, args);
  },
});
