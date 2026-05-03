import {
	DEFAULT_DESIGN_PRESET_ID,
	getBlueprintStageDefinition,
} from "@shipbysunday/blueprint-compiler";
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

		const productPreviewSection = homePageContent.productPreviewSection;

		const canonicalSectionIds = getBlueprintStageDefinition(
			"blueprint",
		).steps.map((step) => step.id);
		expect(productPreviewSection.sections.map((section) => section.id)).toEqual(
			canonicalSectionIds,
		);
		expect(
			productPreviewSection.sections
				.filter((section) => section.status === "interactive")
				.map((section) => section.id),
		).toEqual(["foundation", "design", "pricing"]);
		expect(
			productPreviewSection.sections
				.filter((section) => section.status === "locked")
				.map((section) => section.id),
		).toEqual(["problem", "outcome", "setup", "generated-preview"]);

		expect(productPreviewSection.foundation.fields.productName.label).toBe(
			"What's the name?",
		);
		expect(productPreviewSection.foundation.fields.productSummary.label).toBe(
			"What's the one-liner?",
		);
		expect(productPreviewSection.foundation.fields.primaryUser.label).toBe(
			"Who wants this? Who benefits from this?",
		);

		expect(productPreviewSection.design.defaultPresetId).toBe(
			DEFAULT_DESIGN_PRESET_ID,
		);
		expect(productPreviewSection.design.presets.length).toBeGreaterThan(0);
		expect(
			productPreviewSection.design.presets.some(
				(preset) => preset.id === DEFAULT_DESIGN_PRESET_ID,
			),
		).toBe(true);

		expect(
			productPreviewSection.pricing.modelOptions.map((option) => option.value),
		).toEqual(["one_time", "monthly", "yearly"]);
		expect(productPreviewSection.pricing.defaultModel).toBe("one_time");

		expect(productPreviewSection.leverageHero.headline).toBe(
			"Install leverage",
		);
		expect(productPreviewSection.leverageHero.sublineLead).toBe("and");
		expect(productPreviewSection.leverageHero.sublineBody).toBe(
			"the loop repeats",
		);
		expect(productPreviewSection.leverageHero.sublineEmphasis).toBe("TOMORROW");
		expect(productPreviewSection.leverageHero.defaultOptionId).toBe("idea");
		expect(
			productPreviewSection.leverageHero.options.map((option) => option.label),
		).toEqual(["I have a codebase already", "I have an idea for a product"]);
		expect(productPreviewSection.codebaseBranch.intro).toContain(
			"scan, audit & PR merge queue",
		);
		expect(productPreviewSection.codebaseBranch.shippieImage).toEqual({
			src: "/landing-page/shippie-loop.png",
			alt: "Shippie",
		});
		expect(productPreviewSection.codebaseBranch.auditList.items).toEqual([
			"DOCS Spine",
			"Exec Plans Loop",
			"Oxlint",
			"Oxfmt",
			"Design.md",
			"Agents.md",
			"Programs.md",
			"Linting md files",
			"Token efficient lookup",
			"Low Hanging Fruit `/goal`",
		]);

		expect(productPreviewSection.cta.label).toBe("Generate my codebase");

		expect(homePageContent.hero.headlineLead).toBe("Ship codebases");
		expect(homePageContent.hero.headlineTailHover).toBe("that convert");
		expect(homePageContent.hero.body).toBe(
			"Ship by Sunday gives your agents the worker layer around Codex: exec loops, role packets, channel handoffs, and QA that feeds the next run.",
		);
		expect(homePageContent.hero.promoBanner).toEqual({
			label: "Pilot Member",
			message: `${productConfig.checkoutPriceDisplay} Pilot Member price. FULL TURBO included.`,
		});
		expect(homePageContent.hero.loginLabel).toBe("Sign in");

		expect(homePageContent.sprintPathSection.titleHighlight).toBe(
			"WEAPON of choice",
		);
		expect(homePageContent.sprintPathSection.intro).toContain(
			"decision to agent run",
		);
		expect(homePageContent.execLoopSection.title).toBe("How Workers Work.");
		expect(
			homePageContent.execLoopSection.steps.map((step) => step.label),
		).toEqual(["Shippie", "Healios", "Goalie", "Loopie"]);
		expect(homePageContent.starterSystemSection.title).toBe(
			"A worker layer your agents can build from.",
		);
		expect(homePageContent.starterSystemSection.intro).toContain(
			"trained worker role",
		);
		expect(homePageContent.starterSystemSection.capabilities[1]?.title).toBe(
			"Async channels",
		);
		expect(homePageContent.starterSystemSection.capabilities).toEqual([
			expect.objectContaining({ title: "Role packets" }),
			expect.objectContaining({ title: "Async channels" }),
			expect.objectContaining({ title: "Code-side loop" }),
			expect.objectContaining({ title: "Proof path" }),
		]);
		expect(homePageContent.durabilitySection.title).toBe(
			"Ship by Sunday. Keep shipping on Monday.",
		);
		expect(homePageContent.socialProofSection.portrait).toEqual({
			src: "/founder-portrait.jpg",
			alt: "Founder portrait",
		});

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
				"Role-specific worker packets",
				"Phone, Telegram, and Discord handoff pattern",
				"Codex-ready code run path",
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
			label: "Pilot Member",
			message: `${productConfig.checkoutPriceDisplay} Pilot Member price. Auto-applied at checkout.`,
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
