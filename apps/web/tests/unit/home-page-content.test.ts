import { describe, expect, it } from "vitest";

import { productConfig } from "@/config/product";
import { homePageContent } from "@/features/marketing/content/home";

describe("home page content", () => {
	it("anchors the public story around the Sunday promise and starter-system advantage", () => {
		expect(productConfig.promise).toBe(
			"Ship a real, durable product by Sunday",
		);
		expect(productConfig.metadataDescription).toContain(
			"contract-first docs packs",
		);
		expect(productConfig.metadataDescription).toContain(
			"Agent-Ready Starter System",
		);

		expect(homePageContent.hero.headlineLead).toBe("Ship a real product");
		expect(homePageContent.hero.headlineTailHover).toBe("by Sunday");
		expect(homePageContent.hero.body).toContain("ship a real v1 by Sunday");
		expect(homePageContent.hero.loginLabel).toBe("Sign in");
		expect(homePageContent.hero.secondaryCta.href).toBe("#system");

		expect(homePageContent.whatsInsideSection.title).toBe(
			"By Sunday, you leave with the product truth, the agent packs, and the starter path.",
		);
		expect(homePageContent.whatsInsideSection.pillars[1]?.title).toBe(
			"The packs",
		);
		expect(homePageContent.whatsInsideSection.pillars[2]?.title).toBe(
			"The starter path",
		);
		expect(homePageContent.starterSystemSection.title).toBe(
			"More than a starter. More like an agent-ready operating system.",
		);
		expect(homePageContent.durabilitySection.title).toBe(
			"Ship on Sunday. Keep shipping on Monday.",
		);

		expect(homePageContent.pricingSection.includes).toEqual(
			expect.arrayContaining([
				"Design, Marketing, Build, and Prompt Packs",
				"Agent-Ready Starter System",
				"Fast Pass Walkthroughs",
			]),
		);
	});

	it("keeps the guarantee framed around early clarity, not a shipping promise", () => {
		const guaranteeCopy = [
			homePageContent.pricingSection.guarantee,
			...homePageContent.faqSection.items.map((item) => item.answer),
		].join("\n");

		expect(guaranteeCopy).not.toContain("CEO Block");
		expect(guaranteeCopy).not.toContain("One-Page Product Brief");
		expect(guaranteeCopy).toContain("The guarantee is about clarity");
		expect(guaranteeCopy).toContain("Product stage");
	});
});
