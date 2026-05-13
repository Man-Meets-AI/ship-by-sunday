import { beforeEach, describe, expect, it, vi } from "vitest";

const constructEventMock = vi.fn();
const syncStripeCustomerToConvexMock = vi.fn();
const captureServerExceptionMock = vi.fn();

vi.mock("next/server", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;

  return {
    ...actual,
    after: async (callback: () => Promise<void> | void) => {
      await callback();
    },
  };
});

vi.mock("@/lib/billing/stripe", () => ({
  getStripe: () => ({
    webhooks: {
      constructEvent: constructEventMock,
    },
  }),
}));

vi.mock("@/lib/billing/stripe-sync", () => ({
  syncStripeCustomerToConvex: syncStripeCustomerToConvexMock,
}));

vi.mock("@/lib/sentry/server", () => ({
  captureServerException: captureServerExceptionMock,
}));

describe("stripe webhook route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("rejects requests without a signature", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const response = await POST(
      new Request("http://localhost:3000/api/stripe/webhook", {
        method: "POST",
        body: "{}",
      }),
    );

    expect(response.status).toBe(400);
    expect(syncStripeCustomerToConvexMock).not.toHaveBeenCalled();
  });

  it("rejects requests with an invalid signature", async () => {
    constructEventMock.mockImplementation(() => {
      throw new Error("invalid signature");
    });

    const { POST } = await import("@/app/api/stripe/webhook/route");
    const response = await POST(
      new Request("http://localhost:3000/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "bad-signature",
        },
        body: "{}",
      }),
    );

    expect(response.status).toBe(400);
    expect(captureServerExceptionMock).toHaveBeenCalled();
    expect(syncStripeCustomerToConvexMock).not.toHaveBeenCalled();
  });

  it("syncs tracked webhook events using fresh Stripe state", async () => {
    constructEventMock.mockReturnValue({
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
    });

    const { POST } = await import("@/app/api/stripe/webhook/route");
    const response = await POST(
      new Request("http://localhost:3000/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "valid-signature",
        },
        body: "{}",
      }),
    );

    expect(response.status).toBe(200);
    expect(syncStripeCustomerToConvexMock).toHaveBeenCalledWith({
        eventId: "evt_subscription",
        eventType: "customer.subscription.updated",
        stripeCustomerId: "cus_123",
        workspaceId: "workspace_123",
      });
  });

  it("still returns 200 when background sync fails after verification", async () => {
    constructEventMock.mockReturnValue({
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
    });
    syncStripeCustomerToConvexMock.mockRejectedValue(new Error("sync failed"));

    const { POST } = await import("@/app/api/stripe/webhook/route");
    const response = await POST(
      new Request("http://localhost:3000/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "valid-signature",
        },
        body: "{}",
      }),
    );

    expect(response.status).toBe(200);
    expect(captureServerExceptionMock).toHaveBeenCalled();
  });

  it("ignores unsupported webhook events after verification", async () => {
    constructEventMock.mockReturnValue({
      id: "evt_ignored",
      type: "invoice.created",
      data: {
        object: {},
      },
    });

    const { POST } = await import("@/app/api/stripe/webhook/route");
    const response = await POST(
      new Request("http://localhost:3000/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "valid-signature",
        },
        body: "{}",
      }),
    );

    expect(response.status).toBe(200);
    expect(syncStripeCustomerToConvexMock).not.toHaveBeenCalled();
  });
});
