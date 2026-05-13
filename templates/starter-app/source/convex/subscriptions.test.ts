import { describe, expect, it, vi } from "vitest";

import {
  applyStripeWebhookEventToDatabase,
  syncStripeCustomerStateToDatabase,
} from "./subscriptions";

type QueryOperator = {
  eq: (field: string, value: unknown) => QueryOperator;
};

describe("applyStripeWebhookEventToDatabase", () => {
  it("records skipped webhook receipts when no workspace can be resolved", async () => {
    const inserts: Array<{ table: string; value: Record<string, unknown> }> =
      [];
    const ctx = {
      db: {
        insert: vi.fn(async (table: string, value: Record<string, unknown>) => {
          inserts.push({ table, value });
          return "processed_evt_123";
        }),
        patch: vi.fn(),
        query: vi.fn((table: string) => ({
          withIndex: vi.fn(() => ({
            unique: vi.fn(async () => {
              if (table === "processedStripeEvents") {
                return null;
              }

              return null;
            }),
          })),
        })),
      },
    };

    const result = await applyStripeWebhookEventToDatabase(ctx as never, {
      eventId: "evt_123",
      type: "customer.subscription.updated",
      stripeCustomerId: "cus_123",
    });

    expect(result).toEqual({ duplicate: false, skipped: true });
    expect(inserts).toEqual([
      {
        table: "processedStripeEvents",
        value: expect.objectContaining({
          status: "skipped",
          stripeEventId: "evt_123",
          type: "customer.subscription.updated",
          workspaceId: undefined,
        }),
      },
    ]);
  });

  it("retries a previously skipped event and upgrades the receipt to applied", async () => {
    const processedStripeEvents = [
      {
        _id: "processed_evt_123",
        processedAt: 1,
        status: "skipped" as const,
        stripeEventId: "evt_123",
        type: "customer.subscription.updated",
        workspaceId: undefined,
      },
    ];
    const patches: Array<{ id: string; value: Record<string, unknown> }> = [];
    const ctx = {
      db: {
        insert: vi.fn(),
        patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
          patches.push({ id, value });

          const event = processedStripeEvents.find((entry) => entry._id === id);

          if (event) {
            Object.assign(event, value);
          }
        }),
        query: vi.fn((table: string) => ({
          withIndex: vi.fn(
            (_indexName: string, cb: (query: QueryOperator) => unknown) => {
              const filters: Record<string, unknown> = {};
              const queryOperator: QueryOperator = {
                eq(field: string, value: unknown) {
                  filters[field] = value;
                  return queryOperator;
                },
              };

              cb(queryOperator);

              return {
                collect: vi.fn(async () => {
                  if (table === "subscriptions") {
                    return [];
                  }

                  return [];
                }),
                unique: vi.fn(async () => {
                  if (table === "processedStripeEvents") {
                    return (
                      processedStripeEvents.find(
                        (event) =>
                          event.stripeEventId === filters.stripeEventId,
                      ) ?? null
                    );
                  }

                  return null;
                }),
              };
            },
          ),
        })),
      },
    };

    const result = await applyStripeWebhookEventToDatabase(ctx as never, {
      eventId: "evt_123",
      type: "customer.subscription.updated",
      workspaceId: "workspace_123",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      stripePriceId: "price_123",
      status: "active",
      cancelAtPeriodEnd: false,
    });

    expect(result).toEqual({ duplicate: false, skipped: false });
    expect(patches).toEqual([
      {
        id: "processed_evt_123",
        value: expect.objectContaining({
          status: "applied",
          type: "customer.subscription.updated",
          workspaceId: "workspace_123",
        }),
      },
    ]);
  });

  it("deactivates stale sibling subscriptions before storing the canonical one", async () => {
    const subscriptions = [
      {
        _id: "subscription_old",
        workspaceId: "workspace_123",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_old",
        stripePriceId: "price_old",
        stripeProductId: "prod_old",
        status: "active",
        cancelAtPeriodEnd: false,
        currentPeriodEnd: 123,
        createdAt: 1,
        updatedAt: 1,
      },
    ];
    const stripeCustomers: Array<Record<string, unknown>> = [];
    const entitlements: Array<Record<string, unknown>> = [];
    const subscriptionPatches: Array<{
      id: string;
      value: Record<string, unknown>;
    }> = [];
    const subscriptionInserts: Array<Record<string, unknown>> = [];
    const ctx = {
      db: {
        insert: vi.fn(async (table: string, value: Record<string, unknown>) => {
          if (table === "stripeCustomers") {
            stripeCustomers.push(value);
          }

          if (table === "subscriptions") {
            subscriptionInserts.push(value);
          }

          if (table === "entitlements") {
            entitlements.push(value);
          }

          return `${table}_${Math.random()}`;
        }),
        patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
          const subscription = subscriptions.find((entry) => entry._id === id);

          if (subscription) {
            subscriptionPatches.push({ id, value });
            Object.assign(subscription, value);
          }
        }),
        query: vi.fn((table: string) => ({
          withIndex: vi.fn(
            (_indexName: string, cb: (query: QueryOperator) => unknown) => {
              const filters: Record<string, unknown> = {};
              const queryOperator: QueryOperator = {
                eq(field: string, value: unknown) {
                  filters[field] = value;
                  return queryOperator;
                },
              };

              cb(queryOperator);

              return {
                collect: vi.fn(async () => {
                  if (table === "subscriptions") {
                    return subscriptions.filter(
                      (subscription) =>
                        subscription.workspaceId === filters.workspaceId,
                    );
                  }

                  return [];
                }),
                unique: vi.fn(async () => {
                  if (table === "stripeCustomers") {
                    if (filters.stripeCustomerId) {
                      return (
                        stripeCustomers.find(
                          (customer) =>
                            customer.stripeCustomerId ===
                            filters.stripeCustomerId,
                        ) ?? null
                      );
                    }

                    if (filters.workspaceId) {
                      return (
                        stripeCustomers.find(
                          (customer) =>
                            customer.workspaceId === filters.workspaceId,
                        ) ?? null
                      );
                    }
                  }

                  if (table === "subscriptions") {
                    return (
                      subscriptions.find(
                        (subscription) =>
                          subscription.stripeSubscriptionId ===
                          filters.stripeSubscriptionId,
                      ) ?? null
                    );
                  }

                  if (table === "entitlements") {
                    return (
                      entitlements.find(
                        (entitlement) =>
                          entitlement.workspaceId === filters.workspaceId &&
                          entitlement.key === filters.key,
                      ) ?? null
                    );
                  }

                  return null;
                }),
              };
            },
          ),
        })),
      },
    };

    const result = await syncStripeCustomerStateToDatabase(ctx as never, {
      workspaceId: "workspace_123",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_current",
      stripePriceId: "price_current",
      stripeProductId: "prod_current",
      status: "active",
      cancelAtPeriodEnd: false,
      currentPeriodEnd: 456,
    });

    expect(result).toEqual({ skipped: false, workspaceId: "workspace_123" });
    expect(subscriptionPatches).toEqual([
      {
        id: "subscription_old",
        value: expect.objectContaining({
          status: "canceled",
          currentPeriodEnd: undefined,
          cancelAtPeriodEnd: false,
        }),
      },
    ]);
    expect(subscriptionInserts).toEqual([
      expect.objectContaining({
        workspaceId: "workspace_123",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_current",
        status: "active",
      }),
    ]);
  });

  it("fails closed when a workspace is already mapped to a different Stripe customer", async () => {
    const stripeCustomers = [
      {
        _id: "stripe_customer_1",
        workspaceId: "workspace_123",
        stripeCustomerId: "cus_existing",
        createdAt: 1,
        updatedAt: 1,
      },
    ];
    const ctx = {
      db: {
        insert: vi.fn(),
        patch: vi.fn(),
        query: vi.fn((table: string) => ({
          withIndex: vi.fn(
            (_indexName: string, cb: (query: QueryOperator) => unknown) => {
              const filters: Record<string, unknown> = {};
              const queryOperator: QueryOperator = {
                eq(field: string, value: unknown) {
                  filters[field] = value;
                  return queryOperator;
                },
              };

              cb(queryOperator);

              return {
                collect: vi.fn(async () => []),
                unique: vi.fn(async () => {
                  if (table === "stripeCustomers") {
                    if (filters.stripeCustomerId) {
                      return (
                        stripeCustomers.find(
                          (customer) =>
                            customer.stripeCustomerId ===
                            filters.stripeCustomerId,
                        ) ?? null
                      );
                    }

                    if (filters.workspaceId) {
                      return (
                        stripeCustomers.find(
                          (customer) =>
                            customer.workspaceId === filters.workspaceId,
                        ) ?? null
                      );
                    }
                  }

                  return null;
                }),
              };
            },
          ),
        })),
      },
    };

    await expect(
      syncStripeCustomerStateToDatabase(ctx as never, {
        workspaceId: "workspace_123",
        stripeCustomerId: "cus_conflicting",
        stripeSubscriptionId: "sub_current",
        status: "active",
      }),
    ).rejects.toThrow(
      "Workspace already has a different Stripe customer assigned.",
    );
  });
});
