import { describe, expect, it } from "vitest";

import { productConfig } from "@/config/product";
import { homePageContent } from "@/features/marketing/content/home";

describe("home page content", () => {
	it("anchors the public story around agent-ready packs", () => {
		expect(productConfig.promise).toBe(
			"Turn one product idea into agent-ready packs",
		);
		expect(productConfig.metadataDescription).toContain("Agent-Ready Packs");
		expect(productConfig.metadataDescription).toContain("Starter Snapshot");

		expect(homePageContent.hero.headlineLead).toBe("Turn one product idea");
		expect(homePageContent.hero.headlineTailHover).toBe("Agent-Ready Packs");
		expect(homePageContent.hero.body).toContain("Agent-Ready Packs");
		expect(homePageContent.hero.body).toContain("Starter Snapshot");

		expect(homePageContent.whatsInsideSection.title).toBe(
			"One intake, four packs, and a final Starter Snapshot.",
		);
		expect(homePageContent.whatsInsideSection.pillars[1]?.title).toBe(
			"Four Agent-Ready Packs",
		);
		expect(homePageContent.whatsInsideSection.pillars[2]?.title).toBe(
			"Starter Snapshot review download",
		);
		expect(homePageContent.durabilitySection.title).toBe(
			"Agents will change. Your packs still work.",
		);

		expect(homePageContent.pricingSection.includes).toEqual(
			expect.arrayContaining([
				"Design Pack",
				"Marketing Pack",
				"Build Pack",
				"Prompt Pack",
				"Starter Snapshot download",
			]),
		);
	});

	it("drops the old guarantee language from the FAQ and pricing surfaces", () => {
		const guaranteeCopy = [
			homePageContent.pricingSection.guarantee,
			...homePageContent.faqSection.items.map((item) => item.answer),
		].join("\n");

		expect(guaranteeCopy).not.toContain("CEO Block");
		expect(guaranteeCopy).not.toContain("One-Page Product Brief");
		expect(guaranteeCopy).toContain("Product stage");
	});
});
