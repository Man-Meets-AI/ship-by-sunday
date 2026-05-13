import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchQueryMock = vi.fn();
const ensureConvexViewerReadyMock = vi.fn();
const checkoutCreateMock = vi.fn();
const portalCreateMock = vi.fn();
const ensureStripeCustomerForWorkspaceMock = vi.fn();
const syncStripeCheckoutSessionToConvexMock = vi.fn();
const captureServerEventMock = vi.fn();
const captureServerExceptionMock = vi.fn();

function withBillingEnvDisabled() {
  const original = {
    CONVEX_WEBHOOK_MUTATION_SECRET: process.env.CONVEX_WEBHOOK_MUTATION_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  };

  delete process.env.CONVEX_WEBHOOK_MUTATION_SECRET;
  delete process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.STRIPE_PRICE_PRO_MONTHLY;
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_WEBHOOK_SECRET;

  return () => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };
}

vi.mock("convex/nextjs", () => ({
  fetchQuery: fetchQueryMock,
}));

vi.mock("@/lib/auth/convex-viewer", () => ({
  ensureConvexViewerReady: ensureConvexViewerReadyMock,
}));

vi.mock("@/lib/billing/stripe", () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: checkoutCreateMock,
      },
    },
    billingPortal: {
      sessions: {
        create: portalCreateMock,
      },
    },
  }),
}));

vi.mock("@/lib/billing/stripe-sync", () => ({
  ensureStripeCustomerForWorkspace: ensureStripeCustomerForWorkspaceMock,
  syncStripeCheckoutSessionToConvex: syncStripeCheckoutSessionToConvexMock,
}));

vi.mock("@/lib/analytics/server", () => ({
  captureServerEvent: captureServerEventMock,
}));

vi.mock("@/lib/sentry/server", () => ({
  captureServerException: captureServerExceptionMock,
}));

describe("billing routes", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    ensureConvexViewerReadyMock.mockResolvedValue({
      identity: {
        authSubject: "user_123",
        email: "hello@example.com",
      },
      token: "convex-token",
    });
    ensureStripeCustomerForWorkspaceMock.mockResolvedValue("cus_123");
    captureServerEventMock.mockResolvedValue(undefined);
  });

  it("blocks checkout when the viewer cannot manage billing", async () => {
    fetchQueryMock.mockResolvedValue({
      customer: null,
      membership: { role: "member" },
      workspace: { _id: "workspace_123", name: "Starter" },
    });

    const { POST } = await import("@/app/api/billing/checkout/route");
    const response = await POST(
      new Request("http://localhost:3000/api/billing/checkout", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("/billing?error=forbidden");
    expect(checkoutCreateMock).not.toHaveBeenCalled();
  });

  it("redirects checkout back to billing when Stripe is not configured", async () => {
    const restoreBillingEnv = withBillingEnvDisabled();
    const { POST } = await import("@/app/api/billing/checkout/route");

    try {
      const response = await POST(
        new Request("http://localhost:3000/api/billing/checkout", {
          method: "POST",
        }),
      );

      expect(response.status).toBe(303);
      expect(response.headers.get("location")).toContain(
        "/billing?billing=unconfigured",
      );
      expect(ensureConvexViewerReadyMock).not.toHaveBeenCalled();
      expect(checkoutCreateMock).not.toHaveBeenCalled();
    } finally {
      restoreBillingEnv();
    }
  });

  it("creates a checkout session with a known Stripe customer", async () => {
    fetchQueryMock.mockResolvedValue({
      customer: null,
      membership: { role: "owner" },
      workspace: { _id: "workspace_123", name: "Starter" },
    });
    checkoutCreateMock.mockResolvedValue({
      url: "https://checkout.stripe.com/session/test",
    });

    const { POST } = await import("@/app/api/billing/checkout/route");
    const response = await POST(
      new Request("http://localhost:3000/api/billing/checkout", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "https://checkout.stripe.com/session/test",
    );
    expect(ensureStripeCustomerForWorkspaceMock).toHaveBeenCalledWith({
      token: "convex-token",
      workspaceId: "workspace_123",
      stripeCustomerId: undefined,
      email: "hello@example.com",
    });
    expect(checkoutCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: "cus_123",
        metadata: { workspaceId: "workspace_123" },
        success_url:
          "http://localhost:3000/api/billing/success?session_id={CHECKOUT_SESSION_ID}",
      }),
    );
  });

  it("blocks portal access when the viewer cannot manage billing", async () => {
    fetchQueryMock.mockResolvedValue({
      customer: { stripeCustomerId: "cus_123" },
      membership: { role: "member" },
      workspace: { _id: "workspace_123", name: "Starter" },
    });

    const { POST } = await import("@/app/api/billing/portal/route");
    const response = await POST(
      new Request("http://localhost:3000/api/billing/portal", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("/billing?error=forbidden");
    expect(portalCreateMock).not.toHaveBeenCalled();
  });

  it("redirects to billing when no customer portal is available yet", async () => {
    fetchQueryMock.mockResolvedValue({
      customer: null,
      membership: { role: "owner" },
      workspace: { _id: "workspace_123", name: "Starter" },
    });

    const { POST } = await import("@/app/api/billing/portal/route");
    const response = await POST(
      new Request("http://localhost:3000/api/billing/portal", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/billing?portal=unavailable",
    );
    expect(portalCreateMock).not.toHaveBeenCalled();
  });

  it("redirects portal back to billing when Stripe is not configured", async () => {
    const restoreBillingEnv = withBillingEnvDisabled();
    const { POST } = await import("@/app/api/billing/portal/route");

    try {
      const response = await POST(
        new Request("http://localhost:3000/api/billing/portal", {
          method: "POST",
        }),
      );

      expect(response.status).toBe(303);
      expect(response.headers.get("location")).toContain(
        "/billing?billing=unconfigured",
      );
      expect(ensureConvexViewerReadyMock).not.toHaveBeenCalled();
      expect(portalCreateMock).not.toHaveBeenCalled();
    } finally {
      restoreBillingEnv();
    }
  });

  it("creates a customer portal session for an owner", async () => {
    fetchQueryMock.mockResolvedValue({
      customer: { stripeCustomerId: "cus_123" },
      membership: { role: "owner" },
      workspace: { _id: "workspace_123", name: "Starter" },
    });
    portalCreateMock.mockResolvedValue({
      url: "https://billing.stripe.com/session/test",
    });

    const { POST } = await import("@/app/api/billing/portal/route");
    const response = await POST(
      new Request("http://localhost:3000/api/billing/portal", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "https://billing.stripe.com/session/test",
    );
    expect(portalCreateMock).toHaveBeenCalledWith({
      customer: "cus_123",
      return_url: "http://localhost:3000/billing",
    });
  });

  it("redirects successful checkout returns through the sync route", async () => {
    fetchQueryMock.mockResolvedValue({
      customer: { stripeCustomerId: "cus_123" },
      membership: { role: "owner" },
      workspace: { _id: "workspace_123", name: "Starter" },
    });

    const { GET } = await import("@/app/api/billing/success/route");
    const response = await GET(
      new Request(
        "http://localhost:3000/api/billing/success?session_id=cs_test_123",
        {
          method: "GET",
        },
      ),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/billing?checkout=success",
    );
    expect(syncStripeCheckoutSessionToConvexMock).toHaveBeenCalledWith({
      sessionId: "cs_test_123",
      expectedWorkspaceId: "workspace_123",
    });
  });

  it("redirects to a billing error when the success route is missing a session id", async () => {
    const { GET } = await import("@/app/api/billing/success/route");
    const response = await GET(
      new Request("http://localhost:3000/api/billing/success", {
        method: "GET",
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/billing?checkout=missing_session",
    );
    expect(syncStripeCheckoutSessionToConvexMock).not.toHaveBeenCalled();
  });

  it("redirects to a billing error when checkout sync fails", async () => {
    fetchQueryMock.mockResolvedValue({
      customer: { stripeCustomerId: "cus_123" },
      membership: { role: "owner" },
      workspace: { _id: "workspace_123", name: "Starter" },
    });
    syncStripeCheckoutSessionToConvexMock.mockRejectedValue(
      new Error("checkout sync failed"),
    );

    const { GET } = await import("@/app/api/billing/success/route");
    const response = await GET(
      new Request(
        "http://localhost:3000/api/billing/success?session_id=cs_test_123",
        {
          method: "GET",
        },
      ),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/billing?checkout=sync_failed",
    );
    expect(captureServerExceptionMock).toHaveBeenCalled();
  });
});
