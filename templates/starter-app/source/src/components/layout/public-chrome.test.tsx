import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getViewerAuthSubjectMock = vi.fn();

vi.mock("@/lib/auth/clerk", () => ({
  getViewerAuthSubject: getViewerAuthSubjectMock,
}));

vi.mock("@/components/layout/user-menu-button", () => ({
  UserMenuButton: () => <div>User menu</div>,
}));

describe("Public marketing chrome", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getViewerAuthSubjectMock.mockResolvedValue(null);
  });

  it("shows signed-out header actions without a GitHub CTA", async () => {
    const [{ PublicAuthControls }, { PublicHeader }] = await Promise.all([
      import("@/components/layout/public-auth-controls"),
      import("@/components/layout/public-header"),
    ]);

    const actions = await PublicAuthControls();
    const markup = renderToStaticMarkup(
      <PublicHeader
        links={[
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
        ]}
        actions={actions}
      />,
    );

    expect(markup).toContain("Sign in");
    expect(markup).toContain("Get started");
    expect(markup).not.toContain("GitHub");
  });

  it("renders the product footer without a GitHub link", async () => {
    const { PublicFooter } = await import("@/components/layout/public-footer");
    const markup = renderToStaticMarkup(<PublicFooter />);

    expect(markup).toContain("Built from the generated starter source.");
    expect(markup).toContain("Northstar helps small teams");
    expect(markup).not.toContain("GitHub");
  });
});
