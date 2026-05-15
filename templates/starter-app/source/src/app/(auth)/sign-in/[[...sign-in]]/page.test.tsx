import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs", () => ({
  SignIn: () => <div>Mock Sign In</div>,
}));

describe("SignInPage", () => {
  it("uses product-first copy and links back home", async () => {
    const { default: SignInPage } =
      await import("@/app/(auth)/sign-in/[[...sign-in]]/page");

    const markup = renderToStaticMarkup(<SignInPage />);
    const normalizedMarkup = markup.toLowerCase();

    expect(markup).toContain("Welcome back");
    expect(markup).toContain("Secure workspace access");
    expect(markup).toMatch(/<a[^>]*href="\/"[^>]*>Back to home<\/a>/);

    expect(normalizedMarkup).not.toContain("demo");
    expect(markup).not.toContain("GitHub");
  });
});
