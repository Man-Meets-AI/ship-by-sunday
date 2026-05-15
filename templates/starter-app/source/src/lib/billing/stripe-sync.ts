"server-only";

import type { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import type Stripe from "stripe";

import { currentSubscriptionStatuses } from "@/lib/billing/plans";
import { getStripe } from "@/lib/billing/stripe";
import type { TrackedStripeWebhookEventType } from "@/lib/billing/stripe-webhooks";
import { getBillingEnv } from "@/lib/env/server";

function getStripeId(
  value:
    | string
    | Stripe.Customer
    | Stripe.Subscription
    | Stripe.DeletedCustomer,
) {
  return typeof value === "string" ? value : value.id;
}

function getCurrentPeriodEndMs(subscription: Stripe.Subscription | undefined) {
  const firstItem = subscription?.items.data[0] as
    | (Stripe.SubscriptionItem & { current_period_end?: number })
    | undefined;

  return firstItem?.current_period_end
    ? firstItem.current_period_end * 1000
    : undefined;
}

function getStripeCustomerIdempotencyKey(workspaceId: string) {
  return `workspace:${workspaceId}:stripe-customer`;
}

function selectCanonicalSubscription(subscriptions: Stripe.Subscription[]) {
  const preferredSubscriptions = subscriptions.filter((subscription) =>
    currentSubscriptionStatuses.has(subscription.status),
  );

  if (preferredSubscriptions.length > 1) {
    throw new Error(
      "Expected at most one current Stripe subscription per customer. Enable Stripe's single-subscription redirect setting before using this starter in production.",
    );
  }

  if (preferredSubscriptions.length === 1) {
    return preferredSubscriptions[0];
  }

  return [...subscriptions].sort(
    (left, right) => right.created - left.created,
  )[0];
}

async function fetchStripeBillingSnapshot(stripeCustomerId: string) {
  const stripe = getStripe();
  const [customer, subscriptions] = await Promise.all([
    stripe.customers.retrieve(stripeCustomerId),
    stripe.subscriptions.list({
      customer: stripeCustomerId,
      limit: 10,
      status: "all",
      expand: ["data.items.data.price.product"],
    }),
  ]);

  if (subscriptions.has_more) {
    throw new Error(
      "Stripe returned more subscriptions than this starter is willing to reconcile safely.",
    );
  }

  const subscription = selectCanonicalSubscription(subscriptions.data);
  const firstItem = subscription?.items.data[0];

  return {
    customerEmail: !customer.deleted
      ? (customer.email ?? undefined)
      : undefined,
    stripeSubscriptionId: subscription?.id,
    stripePriceId: firstItem?.price.id,
    stripeProductId:
      typeof firstItem?.price.product === "string"
        ? firstItem.price.product
        : firstItem?.price.product?.id,
    status: subscription?.status,
    currentPeriodEnd: getCurrentPeriodEndMs(subscription),
    cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
  };
}

export async function ensureStripeCustomerForWorkspace(args: {
  email?: string;
  stripeCustomerId?: string;
  token: string;
  workspaceId: string;
}) {
  if (args.stripeCustomerId) {
    return args.stripeCustomerId;
  }

  const latestBillingState = await fetchQuery(
    api.billing.currentWorkspaceState,
    {},
    { token: args.token },
  );

  if (latestBillingState.customer?.stripeCustomerId) {
    return latestBillingState.customer.stripeCustomerId;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create(
    {
      metadata: {
        workspaceId: args.workspaceId,
      },
    },
    {
      idempotencyKey: getStripeCustomerIdempotencyKey(args.workspaceId),
    },
  );

  if (args.email && customer.email !== args.email) {
    await stripe.customers.update(customer.id, {
      email: args.email,
    });
  }

  return fetchMutation(
    api.billing.upsertCurrentWorkspaceStripeCustomer,
    {
      stripeCustomerId: customer.id,
      email: customer.email ?? args.email,
    },
    { token: args.token },
  );
}

export async function syncStripeCustomerToConvex(args: {
  eventId?: string;
  eventType?: TrackedStripeWebhookEventType;
  stripeCustomerId: string;
  workspaceId?: string;
}) {
  const billingEnv = getBillingEnv();
  const billingSnapshot = await fetchStripeBillingSnapshot(
    args.stripeCustomerId,
  );
  const mutationArgs = {
    mutationSecret: billingEnv.CONVEX_WEBHOOK_MUTATION_SECRET,
    workspaceId: args.workspaceId as Id<"workspaces"> | undefined,
    stripeCustomerId: args.stripeCustomerId,
    ...billingSnapshot,
  };

  if (args.eventId && args.eventType) {
    return fetchMutation(api.subscriptions.applyStripeWebhookEvent, {
      eventId: args.eventId,
      type: args.eventType,
      ...mutationArgs,
    });
  }

  return fetchMutation(api.subscriptions.syncStripeCustomerState, mutationArgs);
}

export async function syncStripeCheckoutSessionToConvex(args: {
  expectedWorkspaceId?: string;
  sessionId: string;
}) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(args.sessionId);
  const sessionWorkspaceId = session.metadata?.workspaceId;

  if (!sessionWorkspaceId) {
    throw new Error("Checkout session missing workspace metadata.");
  }

  if (
    args.expectedWorkspaceId &&
    sessionWorkspaceId !== args.expectedWorkspaceId
  ) {
    throw new Error("Checkout session workspace mismatch.");
  }

  const stripeCustomerId = session.customer
    ? getStripeId(session.customer)
    : undefined;

  if (!stripeCustomerId) {
    throw new Error("Checkout session missing Stripe customer.");
  }

  await syncStripeCustomerToConvex({
    stripeCustomerId,
    workspaceId: sessionWorkspaceId,
  });

  return {
    stripeCustomerId,
    workspaceId: sessionWorkspaceId,
  };
}
