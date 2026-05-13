import { describe, expect, it } from "vitest";

import { selectCurrentSubscription } from "./billing";
import type { SubscriptionDoc } from "./types";

function createSubscription(
  overrides: Partial<SubscriptionDoc>,
): SubscriptionDoc {
  return {
    _id: overrides._id ?? "subscription_1",
    workspaceId: overrides.workspaceId ?? "workspace_123",
    stripeCustomerId: overrides.stripeCustomerId ?? "cus_123",
    stripeSubscriptionId: overrides.stripeSubscriptionId ?? "sub_123",
    stripePriceId: overrides.stripePriceId,
    stripeProductId: overrides.stripeProductId,
    status: overrides.status ?? "canceled",
    cancelAtPeriodEnd: overrides.cancelAtPeriodEnd ?? false,
    currentPeriodEnd: overrides.currentPeriodEnd,
    createdAt: overrides.createdAt ?? 1,
    updatedAt: overrides.updatedAt ?? 1,
  };
}

describe("selectCurrentSubscription", () => {
  it("fails loudly when multiple current-like subscriptions exist locally", () => {
    expect(() =>
      selectCurrentSubscription([
        createSubscription({
          _id: "subscription_active",
          stripeSubscriptionId: "sub_active",
          status: "active",
        }),
        createSubscription({
          _id: "subscription_past_due",
          stripeSubscriptionId: "sub_past_due",
          status: "past_due",
        }),
      ]),
    ).toThrow("Expected at most one current subscription record per workspace.");
  });

  it("falls back to the most recent historical subscription when none are current", () => {
    const selection = selectCurrentSubscription([
      createSubscription({
        _id: "subscription_old",
        stripeSubscriptionId: "sub_old",
        status: "canceled",
        updatedAt: 1,
      }),
      createSubscription({
        _id: "subscription_recent",
        stripeSubscriptionId: "sub_recent",
        status: "incomplete_expired",
        updatedAt: 2,
      }),
    ]);

    expect(selection?._id).toBe("subscription_recent");
  });
});
