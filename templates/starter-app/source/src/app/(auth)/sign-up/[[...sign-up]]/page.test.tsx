import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs", () => ({
  SignUp: () => <div>Mock Sign Up</div>,
}));

describe("SignUpPage", () => {
  it("uses product-first copy and links to pricing", async () => {
    const { default: SignUpPage } =
      await import("@/app/(auth)/sign-up/[[...sign-up]]/page");

    const markup = renderToStaticMarkup(<SignUpPage />);
    const normalizedMarkup = markup.toLowerCase();

    expect(markup).toContain("Create your workspace");
    expect(markup).toContain("Invite your team");
    expect(markup).toMatch(/<a[^>]*href="\/#pricing"[^>]*>View pricing<\/a>/);

    expect(normalizedMarkup).not.toContain("demo");
    expect(markup).not.toContain("GitHub");
  });
});
