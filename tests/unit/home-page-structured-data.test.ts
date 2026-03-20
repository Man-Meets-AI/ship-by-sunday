import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { homePageContent } from "@/features/marketing/content/home";
import { getHomePageStructuredData } from "@/features/marketing/lib/home-page-structured-data";

describe("home page structured data", () => {
	it("includes organization, product, and FAQ schema with absolute URLs", () => {
		const structuredData = JSON.parse(getHomePageStructuredData()) as {
			"@graph": Array<Record<string, unknown>>;
		};

		const organization = structuredData["@graph"].find(
			(entry) => entry["@type"] === "Organization",
		);
		const product = structuredData["@graph"].find(
			(entry) => entry["@type"] === "Product",
		) as { offers?: { url?: string } } | undefined;
		const faqPage = structuredData["@graph"].find(
			(entry) => entry["@type"] === "FAQPage",
		) as { mainEntity?: unknown[] } | undefined;

		expect(organization).toBeTruthy();
		expect(organization?.url).toMatch(/^https?:\/\//);
		expect(organization?.logo).toMatch(/^https?:\/\//);
		expect(product?.offers?.url).toContain("#pricing");
		expect(faqPage?.mainEntity).toHaveLength(homePageContent.faqSection.items.length);
	});
});
