import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
	productConfig,
	routeConfig,
	starterConfig,
	type StarterHomePageConfig,
} from "@/config/product";
import { homePageContent } from "@/app/_content/home-page";
import { createHomePageRenderModel } from "@/app/_lib/home-page-render-model";
import { getHomePageStructuredData } from "@/app/_lib/home-page-structured-data";

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
		expect(product?.offers?.price).toBe(
			(productConfig.checkoutPriceUsdCents / 100).toString(),
		);
		expect(product?.offers?.priceCurrency).toBe(productConfig.currency);
		expect(faqPage?.mainEntity).toHaveLength(
			homePageContent.faqSection.items.length,
		);
	});

	it("omits FAQPage when the FAQ section is disabled", () => {
		const renderModel = createHomePageRenderModel({
			homePageConfig: {
				...starterConfig.homePage,
				sections: {
					...starterConfig.homePage.sections,
					faq: false,
				},
			} satisfies StarterHomePageConfig,
		});
		const structuredData = JSON.parse(
			getHomePageStructuredData(renderModel),
		) as {
			"@graph": Array<Record<string, unknown>>;
		};

		const faqPage = structuredData["@graph"].find(
			(entry) => entry["@type"] === "FAQPage",
		);

		expect(faqPage).toBeUndefined();
	});

	it("omits Product schema when pricing no longer presents a checkout offer", () => {
		const renderModel = createHomePageRenderModel({
			homePageConfig: {
				...starterConfig.homePage,
				pricingPrimaryCta: {
					kind: "link",
					href: routeConfig.blog,
				},
			} satisfies StarterHomePageConfig,
		});
		const structuredData = JSON.parse(
			getHomePageStructuredData(renderModel),
		) as {
			"@graph": Array<Record<string, unknown>>;
		};

		const product = structuredData["@graph"].find(
			(entry) => entry["@type"] === "Product",
		);

		expect(product).toBeUndefined();
	});
});
