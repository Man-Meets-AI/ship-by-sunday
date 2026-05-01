import { describe, expect, it } from "vitest";

import { productConfig } from "@/config/product";
import { homePageContent } from "@/app/_content/home-page";

describe("home page content", () => {
	it("anchors the public story around worker-ready agent loops and conversion", () => {
		expect(productConfig.promise).toBe(
			"Ship a real, durable product by Sunday",
		);
		expect(productConfig.metadataDescription).toContain(
			"phone-started agent work",
		);
		expect(productConfig.metadataDescription).toContain(
			"codebases that convert",
		);

		expect(homePageContent.hero.headlineLead).toBe("Ship codebases");
		expect(homePageContent.hero.headlineTailHover).toBe("that convert");
		expect(homePageContent.hero.body).toBe(
			"Turn phone-started ideas, async agent loops, and messy AI output into worker-ready context: product truth, role-specific packs, and a starter path agents can use to ship meaningful code.",
		);
		expect(homePageContent.hero.promoBanner).toEqual({
			label: "Early member",
			message: `Get ${productConfig.name} for ${productConfig.checkoutPriceDisplay} instead of ${productConfig.priceDisplay}. ${productConfig.activeOffer?.percentOff}% off auto-applied at checkout, plus FULL TURBO free.`,
		});
		expect(homePageContent.hero.loginLabel).toBe("Sign in");
		expect(homePageContent.hero.secondaryCta.label).toBe("See the worker path");
		expect(homePageContent.hero.secondaryCta.href).toBe("#system");

		expect(homePageContent.sprintPathSection.titleHighlight).toBe(
			"worker context.",
		);
		expect(homePageContent.sprintPathSection.intro).toContain(
			"start work from your phone",
		);
		expect(homePageContent.whatsInsideSection.title).toBe(
			"Build the worker layer.",
		);
		expect(homePageContent.whatsInsideSection.pillars[1]?.title).toBe(
			"The worker roles",
		);
		expect(homePageContent.whatsInsideSection.pillars[2]?.title).toBe(
			"The execution path",
		);
		expect(homePageContent.starterSystemSection.title).toBe(
			"A worker layer your agents can build from.",
		);
		expect(homePageContent.starterSystemSection.intro).toContain(
			"agents running while you are AFK",
		);
		expect(homePageContent.starterSystemSection.capabilities[1]?.title).toBe(
			"Role-specific packs",
		);
		expect(homePageContent.starterSystemSection.capabilities).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ title: "Async-ready context" }),
				expect.objectContaining({ title: "Built-in QA" }),
				expect.objectContaining({ title: "Curated design direction" }),
			]),
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
				question:
					"Can this help with Telegram, Discord, or phone-started agent loops?",
			}),
			expect.objectContaining({
				question: "What happens right after I pay?",
			}),
		]);

		expect(homePageContent.pricingSection.includes).toEqual(
			expect.arrayContaining([
				"Agent-Ready Packs",
				"Worker-role setup for product, design, marketing, build, and QA",
				"Ship by Sunday Blueprint",
				"Fast Pass Walkthroughs",
			]),
		);
		expect(homePageContent.pricingSection.originalPriceDisplay).toBe(
			productConfig.priceDisplay,
		);
		expect(homePageContent.pricingSection.offerPriceDisplay).toBe(
			productConfig.checkoutPriceDisplay,
		);
		expect(homePageContent.pricingSection.offerBanner).toEqual({
			label: "Early member",
			message: `50% off the ${productConfig.priceDisplay} list price. Auto-applied at checkout.`,
		});
		expect(homePageContent.pricingSection.ctaTitle).toBe("Get the blueprint");
	});

	it("keeps the faq focused on the offer", () => {
		const faqCopy = homePageContent.faqSection.items
			.map((item) => item.answer)
			.join("\n");

		expect(faqCopy).not.toContain("The guarantee is about clarity");
		expect(faqCopy).toContain("Blueprint");
		expect(faqCopy).toContain("worker layer");
	});
});
