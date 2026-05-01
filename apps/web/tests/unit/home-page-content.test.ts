import { describe, expect, it } from "vitest";

import { productConfig } from "@/config/product";
import { homePageContent } from "@/app/_content/home-page";

describe("home page content", () => {
	it("anchors the public story around worker-ready agent loops and conversion", () => {
		expect(productConfig.promise).toBe(
			"Ship a real, durable product by Sunday",
		);
		expect(productConfig.metadataDescription).toContain(
			"phone-started exec loops",
		);
		expect(productConfig.metadataDescription).toContain(
			"codebases that convert",
		);

		expect(homePageContent.productPreviewSection.title).toBe(
			"Build the worker layer.",
		);
		expect(homePageContent.productPreviewSection.intro).toContain(
			"Start a decision from your phone",
		);
		expect(homePageContent.productPreviewSection.primaryAction).toEqual({
			label: "Build the worker layer",
			href: "#pricing",
		});
		expect(homePageContent.productPreviewSection.secondaryAction).toEqual({
			label: "See the loop",
			href: "#system",
		});
		expect(homePageContent.productPreviewSection.previewNote).toContain(
			"worker preview",
		);
		expect(
			homePageContent.productPreviewSection.workspace.githubUsernameLabel,
		).toBe("Codebase GitHub username");
		expect(
			homePageContent.productPreviewSection.workspace.tabs.map(
				(tab) => tab.label,
			),
		).toEqual(["Source", "Channels", "Proof"]);
		expect(
			homePageContent.productPreviewSection.workspace.tabs[0]?.items.map(
				(item) => item.label,
			),
		).toEqual(["Product truth", "Operator taste", "Next decision"]);

		expect(homePageContent.hero.headlineLead).toBe("Ship codebases");
		expect(homePageContent.hero.headlineTailHover).toBe("that convert");
		expect(homePageContent.hero.body).toBe(
			"Exec loops turn your decisions into worker briefs agents can run from Codex, Telegram, Discord, or your phone.",
		);
		expect(homePageContent.hero.promoBanner).toEqual({
			label: "Early member",
			message: `${productConfig.checkoutPriceDisplay} early member price. FULL TURBO included.`,
		});
		expect(homePageContent.hero.loginLabel).toBe("Sign in");
		expect(homePageContent.hero.secondaryCta.label).toBe("See the loop");
		expect(homePageContent.hero.secondaryCta.href).toBe("#system");

		expect(homePageContent.sprintPathSection.titleHighlight).toBe(
			"agents useful.",
		);
		expect(homePageContent.sprintPathSection.intro).toContain(
			"decision to agent run",
		);
		expect(homePageContent.execLoopSection.title).toBe("How the loop works.");
		expect(
			homePageContent.execLoopSection.steps.map((step) => step.label),
		).toEqual(["Decide", "Brief", "Run", "Review"]);
		expect(homePageContent.execLoopSection.steps[2]?.description).toContain(
			"phone-started prompt",
		);
		expect(homePageContent.starterSystemSection.title).toBe(
			"A worker layer your agents can build from.",
		);
		expect(homePageContent.starterSystemSection.intro).toContain(
			"reviewed product changes",
		);
		expect(homePageContent.starterSystemSection.capabilities[1]?.title).toBe(
			"Async channels",
		);
		expect(homePageContent.starterSystemSection.capabilities).toEqual([
			expect.objectContaining({ title: "Worker packs" }),
			expect.objectContaining({ title: "Async channels" }),
			expect.objectContaining({ title: "QA path" }),
			expect.objectContaining({ title: "Conversion-aware repo" }),
		]);
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
				"Exec loop setup",
				"Agent-ready worker packs",
				"Review and QA path",
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
			message: `${productConfig.checkoutPriceDisplay} early member price. Auto-applied at checkout.`,
		});
		expect(homePageContent.pricingSection.ctaTitle).toBe(
			"Build the worker layer",
		);
	});

	it("keeps the faq focused on the offer", () => {
		const faqCopy = homePageContent.faqSection.items
			.map((item) => item.answer)
			.join("\n");

		expect(faqCopy).not.toContain("The guarantee is about clarity");
		expect(faqCopy).toContain("exec loops");
		expect(faqCopy).toContain("worker layer");
	});
});
