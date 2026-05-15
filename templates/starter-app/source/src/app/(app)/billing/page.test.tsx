import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const billingPanelMock = vi.fn();
const getBillingEnvIfConfiguredMock = vi.fn();

vi.mock("@/components/app/billing-panel", () => ({
  BillingPanel: (props: { billingConfigured: boolean; billingStatus?: string }) => {
    billingPanelMock(props);
    return null;
  },
}));

vi.mock("@/components/layout/page-shell", () => ({
  PageShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/layout/section-header", () => ({
  SectionHeader: () => null,
}));

vi.mock("@/lib/env/server", () => ({
  getBillingEnvIfConfigured: getBillingEnvIfConfiguredMock,
}));

describe("BillingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("treats partially configured billing env as unconfigured", async () => {
    getBillingEnvIfConfiguredMock.mockImplementation(() => {
      throw new Error(
        "Invalid billing environment variables:\nSTRIPE_SECRET_KEY is required",
      );
    });

    const { default: BillingPage } = await import("@/app/(app)/billing/page");
    const page = await BillingPage({
      searchParams: Promise.resolve({ billing: "unconfigured" }),
    });

    renderToStaticMarkup(page);

    expect(billingPanelMock).toHaveBeenCalledWith({
      billingConfigured: false,
      billingStatus: "unconfigured",
    });
  });
});
