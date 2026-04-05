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
		expect(homePageContent.hero.body).toContain(
			"The only system that teaches you how to ship a durable product from start to finish in one weekend.",
		);
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
			"More than a starter. A system you can keep shipping from.",
		);
		expect(homePageContent.starterSystemSection.capabilities[1]?.title).toBe(
			"Built-in QA",
		);
		expect(homePageContent.durabilitySection.title).toBe(
			"Ship by Sunday. Keep shipping on Monday.",
		);

		expect(homePageContent.faqSection.items).toEqual([
			expect.objectContaining({
				question: "Is this another course or another starter?",
			}),
			expect.objectContaining({
				question: "What do I actually get at the end?",
			}),
			expect.objectContaining({
				question: "I already have a starter. Why would I need this?",
			}),
			expect.objectContaining({
				question: "Is this just more planning before coding?",
			}),
			expect.objectContaining({
				question: "Who is this for?",
			}),
			expect.objectContaining({
				question: "Why not just use ChatGPT, Claude, or Codex directly?",
			}),
			expect.objectContaining({
				question: "What happens right after I pay?",
			}),
		]);

		expect(homePageContent.pricingSection.includes).toEqual(
			expect.arrayContaining([
				"Agent-Ready Packs",
				"Ship by Sunday Blueprint",
				"Fast Pass Walkthroughs",
			]),
		);
		expect(homePageContent.pricingSection.ctaTitle).toBe("Get the system");
	});

	it("keeps the guarantee in pricing while the faq stays focused on the offer", () => {
		const faqCopy = homePageContent.faqSection.items
			.map((item) => item.answer)
			.join("\n");

		expect(homePageContent.pricingSection.guarantee).toContain("Product stage");
		expect(faqCopy).not.toContain("The guarantee is about clarity");
		expect(faqCopy).toContain("Blueprint");
		expect(faqCopy).toContain("Ship Blueprint");
	});
});
