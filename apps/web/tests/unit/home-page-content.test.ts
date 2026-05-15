import {
	DEFAULT_DESIGN_PRESET_ID,
	getCodebaseStageDefinition,
} from "@shipbysunday/codebase-compiler";
import { describe, expect, it } from "vitest";

import { productConfig } from "@/config/product";
import { homePageContent } from "@/app/_content/home-page";

describe("home page content", () => {
	it("anchors the public story around worker-ready agent loops and conversion", () => {
		expect(productConfig.promise).toBe("The agent doctor for web apps");
		expect(productConfig.metadataDescription).toContain("web-app blockers");
		expect(productConfig.metadataDescription).toContain(
			"proof or blocked-proof reports",
		);

		const productPreviewSection = homePageContent.productPreviewSection;

		const canonicalSectionIds = getCodebaseStageDefinition(
			"codebase",
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
		).toEqual(["I want an AI worker", "I want an AI starter template"]);
		expect(productPreviewSection.codebaseBranch.intro).toContain(
			"private doctor pass through your local runner",
		);
		expect(productPreviewSection.codebaseBranch.privacyAnswer).toContain(
			"does not push branches, open PRs, rerun CI, or share raw source",
		);
		expect(productPreviewSection.codebaseBranch.shippieImage).toEqual({
			src: "/landing-page/shippie-loop.png",
			alt: "Shippie",
		});
		expect(productPreviewSection.codebaseBranch.auditList.items).toEqual([
			"Machine Setup",
			"Project Setup",
			"Local runner pairing",
			"Read-only probes",
			"Top 9 findings",
			"Sync preview approval",
			"First loop approval",
			"Proof or blocked proof",
			"Managed GitHub consent only",
			"Next recommendation",
		]);

		expect(productPreviewSection.cta.label).toBe(
			"Start my AI starter template",
		);

		expect(homePageContent.hero.headlineLead).toBe("Agent doctor");
		expect(homePageContent.hero.headlineTailPrefix).toBe("for ");
		expect(homePageContent.hero.headlineTailHover).toBe("web apps");
		expect(homePageContent.hero.body).toBe(
			"Ship by Sunday diagnoses blockers, ranks the highest-leverage fixes, runs the first approved AI worker loop, and ends with proof or a clear blocked-proof report.",
		);
		expect(homePageContent.hero.promoBanner).toBeNull();
		expect(homePageContent.hero.loginLabel).toBe("Sign in");

		expect(homePageContent.execLoopSection.title).toBe("How Workers Work.");
		expect(
			homePageContent.execLoopSection.steps.map((step) => step.label),
		).toEqual(["Shippie", "Healios", "Goalie", "Loopie"]);
		expect(
			homePageContent.execLoopSection.steps.map((step) => step.description),
		).not.toContain("Gets your code branched, built, and merged.");
		expect(homePageContent.starterSystemSection.heading).toEqual({
			ariaLabel: "A worker layer. Each hat, a trained role.",
			lead: "A worker layer.",
			detailLead: "each hat,",
			detailTail: "a trained role.",
		});
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
		expect(homePageContent.programsSection.title).toBe("PROGRAMS.md");
		expect(homePageContent.programsSection.headline).toBe(
			"PROGRAMS.md is not a bigger ExecPlan.",
		);
		expect(
			homePageContent.programsSection.explainers.map(
				(explainer) => explainer.title,
			),
		).toEqual([
			"Research Passes",
			"Normalize Pass",
			"Converged Decisions Packet",
			"Dependency Graph",
			"ExecPlan Split Recommendation",
			"Planning Brief",
			"Program Validator",
			"ExecPlan Loop",
		]);
		expect(homePageContent.programsSection.outcome).toBe(
			"validated shipping slices",
		);
		expect(homePageContent.plansMdSection.title).toBe("PLANS.md");
		expect(homePageContent.plansMdSection.callouts).toEqual([
			"Detailed instructions",
			"Persistent task memory",
			"Loopable execution path",
		]);
		expect(
			homePageContent.plansMdSection.differentiators.map(
				(differentiator) => differentiator.title,
			),
		).toEqual([
			"Persistent memory for long tasks",
			"Turns vague intent into executable steps",
			"Keeps scope from drifting",
			"A shared source of truth",
			"Progress survives the chat",
			"Built for iteration",
			"Forces verification",
			"Compresses complexity",
			"Reduces prompt re-explaining",
			"Makes autonomy safer",
		]);
		expect(homePageContent.socialProofSection.heading).toEqual({
			eyebrow: "Built BY",
			title: "PARKER, shipper of products,",
			tail: "teacher of AI.",
		});
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
				question: "Can this help my existing or broken app?",
			}),
			expect.objectContaining({
				question: "What happens right after I pay?",
			}),
		]);

		expect(homePageContent.pricingSection.includes).toEqual(
			expect.arrayContaining([
				"Generated codebase or private local doctor pass",
				"Top 9 findings and first-loop recommendation",
				"One approved AI worker loop",
				"Proof or blocked-proof report",
				"Local privacy and sync-safe report boundaries",
				"Next recommendation after the loop",
			]),
		);
		expect(homePageContent.pricingSection.originalPriceDisplay).toBeNull();
		expect(homePageContent.pricingSection.headline).toEqual({
			prefix: "Run the",
			rotatingPhrases: ["doctor pass", "first worker loop"],
		});
		expect(homePageContent.pricingSection.offerPriceDisplay).toBe(
			productConfig.checkoutPriceDisplay,
		);
		expect(homePageContent.pricingSection.offerBanner).toBeNull();
		expect(homePageContent.pricingSection.ctaTitle).toBe("Start my AI build");
	});

	it("keeps the faq focused on the offer", () => {
		const faqCopy = homePageContent.faqSection.items
			.map((item) => item.answer)
			.join("\n");

		expect(faqCopy).not.toContain("The guarantee is about clarity");
		expect(faqCopy).toContain("agent doctor for web apps");
		expect(faqCopy).toContain("private local doctor pass");
	});
});
