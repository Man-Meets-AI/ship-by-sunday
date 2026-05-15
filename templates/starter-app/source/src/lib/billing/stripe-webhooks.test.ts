import { describe, expect, it } from "vitest";

import { getStripeSyncTargetFromWebhookEvent } from "@/lib/billing/stripe-webhooks";

describe("getStripeSyncTargetFromWebhookEvent", () => {
  it("extracts the customer and workspace from checkout completion", () => {
    const target = getStripeSyncTargetFromWebhookEvent({
      id: "evt_checkout",
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { workspaceId: "workspace_123" },
          customer: "cus_123",
          customer_details: { email: "hello@example.com" },
          subscription: "sub_123",
        },
      },
    } as never);

    expect(target).toEqual({
      type: "checkout.session.completed",
      workspaceId: "workspace_123",
      stripeCustomerId: "cus_123",
    });
  });

  it("extracts the customer and workspace from subscription events", () => {
    const target = getStripeSyncTargetFromWebhookEvent({
      id: "evt_subscription",
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_123",
          customer: "cus_123",
          status: "active",
          cancel_at_period_end: false,
          metadata: { workspaceId: "workspace_123" },
          items: {
            data: [
              {
                current_period_end: 1_742_000_000,
                price: {
                  id: "price_123",
                  product: "prod_123",
                },
              },
            ],
          },
        },
      },
    } as never);

    expect(target).toEqual({
      type: "customer.subscription.updated",
      workspaceId: "workspace_123",
      stripeCustomerId: "cus_123",
    });
  });

  it("ignores unrelated Stripe events", () => {
    expect(
      getStripeSyncTargetFromWebhookEvent({
        id: "evt_invoice",
        type: "invoice.created",
        data: { object: {} },
      } as never),
    ).toBeNull();
  });
});
