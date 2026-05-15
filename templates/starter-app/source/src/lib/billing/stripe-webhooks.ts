import type { Id } from "@convex/_generated/dataModel";
import type Stripe from "stripe";

const trackedStripeWebhookEventTypes = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
] as const);

type TrackedStripeWebhookEventType =
  | "checkout.session.completed"
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted";

type StripeSyncTarget = {
  type: TrackedStripeWebhookEventType;
  workspaceId?: Id<"workspaces">;
  stripeCustomerId: string;
};

function getStripeId(
  value: string | Stripe.Customer | Stripe.Subscription | Stripe.DeletedCustomer,
) {
  return typeof value === "string" ? value : value.id;
}

export function getStripeSyncTargetFromWebhookEvent(
  event: Stripe.Event,
): StripeSyncTarget | null {
  if (!trackedStripeWebhookEventTypes.has(event.type as TrackedStripeWebhookEventType)) {
    return null;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const stripeCustomerId = session.customer ? getStripeId(session.customer) : undefined;

    return stripeCustomerId
      ? {
          type: event.type,
          workspaceId: session.metadata?.workspaceId as Id<"workspaces"> | undefined,
          stripeCustomerId,
        }
      : null;
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;

    return {
      type: event.type,
      workspaceId:
        (subscription.metadata.workspaceId as Id<"workspaces"> | undefined) ||
        undefined,
      stripeCustomerId: getStripeId(subscription.customer),
    };
  }

  return null;
}

export type { StripeSyncTarget, TrackedStripeWebhookEventType };
