import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@convex/_generated/api";

import {
  ensureStripeCustomerForWorkspace,
  syncStripeCheckoutSessionToConvex,
  syncStripeCustomerToConvex,
} from "@/lib/billing/stripe-sync";

const {
  fetchQueryMock,
  fetchMutationMock,
  customersRetrieveMock,
  customersCreateMock,
  customersUpdateMock,
  subscriptionsListMock,
  checkoutSessionRetrieveMock,
} = vi.hoisted(() => ({
  fetchQueryMock: vi.fn(),
  fetchMutationMock: vi.fn(),
  customersRetrieveMock: vi.fn(),
  customersCreateMock: vi.fn(),
  customersUpdateMock: vi.fn(),
  subscriptionsListMock: vi.fn(),
  checkoutSessionRetrieveMock: vi.fn(),
}));

vi.mock("convex/nextjs", () => ({
  fetchQuery: fetchQueryMock,
  fetchMutation: fetchMutationMock,
}));

vi.mock("@/lib/billing/stripe", () => ({
  getStripe: () => ({
    customers: {
      retrieve: customersRetrieveMock,
      create: customersCreateMock,
      update: customersUpdateMock,
    },
    subscriptions: {
      list: subscriptionsListMock,
    },
    checkout: {
      sessions: {
        retrieve: checkoutSessionRetrieveMock,
      },
    },
  }),
}));

describe("stripe sync helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    customersRetrieveMock.mockResolvedValue({
      deleted: false,
      email: "hello@example.com",
    });
    fetchQueryMock.mockResolvedValue({
      customer: null,
    });
    fetchMutationMock.mockResolvedValue("cus_new");
    subscriptionsListMock.mockResolvedValue({
      data: [
        {
          id: "sub_123",
          status: "active",
          cancel_at_period_end: false,
          items: {
            data: [
              {
                current_period_end: 1_742_000_000,
                price: {
                  id: "price_123",
                  product: { id: "prod_123" },
                },
              },
            ],
          },
        },
      ],
    });
  });

  it("syncs fresh Stripe state for tracked webhook events", async () => {
    await syncStripeCustomerToConvex({
      eventId: "evt_123",
      eventType: "customer.subscription.updated",
      stripeCustomerId: "cus_123",
      workspaceId: "workspace_123",
    });

    expect(fetchMutationMock).toHaveBeenCalledWith(
      api.subscriptions.applyStripeWebhookEvent,
      expect.objectContaining({
        eventId: "evt_123",
        type: "customer.subscription.updated",
        mutationSecret: "convex_webhook_secret",
        workspaceId: "workspace_123",
        stripeCustomerId: "cus_123",
        customerEmail: "hello@example.com",
        stripeSubscriptionId: "sub_123",
        stripePriceId: "price_123",
        stripeProductId: "prod_123",
        status: "active",
        currentPeriodEnd: 1_742_000_000_000,
        cancelAtPeriodEnd: false,
      }),
    );
  });

  it("uses the same sync path for post-checkout landing pages", async () => {
    checkoutSessionRetrieveMock.mockResolvedValue({
      customer: "cus_123",
      metadata: {
        workspaceId: "workspace_123",
      },
    });

    await syncStripeCheckoutSessionToConvex({
      sessionId: "cs_test_123",
      expectedWorkspaceId: "workspace_123",
    });

    expect(fetchMutationMock).toHaveBeenCalledWith(
      api.subscriptions.syncStripeCustomerState,
      expect.objectContaining({
        mutationSecret: "convex_webhook_secret",
        workspaceId: "workspace_123",
        stripeCustomerId: "cus_123",
      }),
    );
  });

  it("fails closed when a checkout session is missing workspace metadata", async () => {
    checkoutSessionRetrieveMock.mockResolvedValue({
      customer: "cus_123",
      metadata: {},
    });

    await expect(
      syncStripeCheckoutSessionToConvex({
        sessionId: "cs_test_123",
        expectedWorkspaceId: "workspace_123",
      }),
    ).rejects.toThrow("Checkout session missing workspace metadata.");

    expect(fetchMutationMock).not.toHaveBeenCalled();
  });

  it("creates and persists a Stripe customer before checkout", async () => {
    customersCreateMock.mockResolvedValue({
      id: "cus_new",
      email: null,
    });

    const customerId = await ensureStripeCustomerForWorkspace({
      token: "convex-token",
      workspaceId: "workspace_123",
      email: "hello@example.com",
    });

    expect(customerId).toBe("cus_new");
    expect(customersCreateMock).toHaveBeenCalledWith(
      {
        metadata: {
          workspaceId: "workspace_123",
        },
      },
      {
        idempotencyKey: "workspace:workspace_123:stripe-customer",
      },
    );
    expect(customersUpdateMock).toHaveBeenCalledWith("cus_new", {
      email: "hello@example.com",
    });
    expect(fetchMutationMock).toHaveBeenCalledWith(
      api.billing.upsertCurrentWorkspaceStripeCustomer,
      {
        stripeCustomerId: "cus_new",
        email: "hello@example.com",
      },
      { token: "convex-token" },
    );
  });

  it("reuses the latest workspace customer before creating a new Stripe customer", async () => {
    fetchQueryMock.mockResolvedValue({
      customer: {
        stripeCustomerId: "cus_existing",
      },
    });

    const customerId = await ensureStripeCustomerForWorkspace({
      token: "convex-token",
      workspaceId: "workspace_123",
    });

    expect(customerId).toBe("cus_existing");
    expect(customersCreateMock).not.toHaveBeenCalled();
    expect(fetchMutationMock).not.toHaveBeenCalled();
  });

  it("fails loudly when Stripe returns multiple current subscriptions", async () => {
    subscriptionsListMock.mockResolvedValue({
      has_more: false,
      data: [
        {
          id: "sub_active",
          created: 2,
          status: "active",
          cancel_at_period_end: false,
          items: { data: [] },
        },
        {
          id: "sub_past_due",
          created: 1,
          status: "past_due",
          cancel_at_period_end: false,
          items: { data: [] },
        },
      ],
    });

    await expect(
      syncStripeCustomerToConvex({
        eventId: "evt_123",
        eventType: "customer.subscription.updated",
        stripeCustomerId: "cus_123",
        workspaceId: "workspace_123",
      }),
    ).rejects.toThrow("Expected at most one current Stripe subscription");
  });
});
