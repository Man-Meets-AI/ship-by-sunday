import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import MarketingHomePage from "@/app/(marketing)/page";

describe("MarketingHomePage", () => {
  it("renders a product-first homepage instead of template/demo copy", () => {
    const markup = renderToStaticMarkup(<MarketingHomePage />);
    const normalizedMarkup = markup.toLowerCase();

    expect(normalizedMarkup).not.toContain("starter template");
    expect(normalizedMarkup).not.toContain("live demo");
    expect(markup).not.toContain("GitHub");

    expect(markup).toContain('id="features"');
    expect(markup).toContain('id="why-northstar"');
    expect(markup).toContain('id="pricing"');
    expect(markup).toContain('id="faq"');

    expect(markup).toMatch(/<a[^>]*href="\/sign-up"[^>]*>Get started<\/a>/);

    expect(markup).toContain("Starter");
    expect(markup).toContain("Pro");
    expect(markup).toContain("Enterprise");
  });
});
