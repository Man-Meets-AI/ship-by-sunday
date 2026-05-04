import { describe, expect, it } from "vitest";

import {
	homePageSectionOrder,
	routeConfig,
	starterConfig,
	type StarterHomePageConfig,
} from "@/config/product";
import { createHomePageRenderModel } from "@/app/_lib/home-page-render-model";

describe("home page render model", () => {
	it("preserves the default section order and checkout CTA defaults", () => {
		const renderModel = createHomePageRenderModel();

		expect(renderModel.sectionOrder).toEqual(homePageSectionOrder);
		expect(renderModel.productPreview.isEnabled).toBe(true);
		expect(renderModel.productPreview.section.cta.label).toBe(
			"Generate my codebase",
		);
		expect(renderModel.productPreview.section.leverageHero.headline).toBe(
			"Install leverage",
		);
		expect(
			renderModel.productPreview.section.codebaseBranch.auditList.title,
		).toBe("The Audit.");
		expect(renderModel.hero.isEnabled).toBe(true);
		expect(renderModel.hero.primaryCtaTarget).toEqual({ kind: "checkout" });
		expect(renderModel.execLoop.isEnabled).toBe(true);
		expect(
			renderModel.execLoop.section.steps.map((step) => step.label),
		).toEqual(["Shippie", "Healios", "Goalie", "Loopie"]);
		expect(renderModel.starterSystem.isEnabled).toBe(true);
		expect(
			renderModel.starterSystem.section.capabilities.map((item) => item.title),
		).toEqual([
			"Role packets",
			"Async channels",
			"Code-side loop",
			"Proof path",
		]);
		expect(
			renderModel.productPreview.section.sections.map((section) => section.id),
		).toEqual([
			"foundation",
			"problem",
			"outcome",
			"design",
			"pricing",
			"setup",
			"generated-preview",
		]);
		expect(
			renderModel.productPreview.section.sections
				.filter((section) => section.status === "interactive")
				.map((section) => section.id),
		).toEqual(["foundation", "design", "pricing"]);
		expect(renderModel.durability.isEnabled).toBe(false);
		expect(renderModel.socialProof.isEnabled).toBe(true);
		expect(renderModel.socialProof.variant.kind).toBe("founder");
		expect(renderModel.programs.isEnabled).toBe(true);
		expect(renderModel.programs.section.pipeline).toEqual([
			"big messy set of ideas",
			"research passes",
			"normalize pass",
			"converged decisions packet",
			"dependency graph",
			"execplan split recommendation",
			"planning brief",
			"execplan loop",
		]);
		expect(renderModel.plansMd.isEnabled).toBe(true);
		expect(renderModel.plansMd.section.callouts).toEqual([
			"Detailed instructions",
			"Persistent task memory",
			"Loopable execution path",
		]);
		expect(renderModel.pricing.isEnabled).toBe(true);
		expect(renderModel.pricing.primaryCtaTarget).toEqual({
			kind: "checkout",
		});
	});

	it("derives non-default section toggles and link CTA targets", () => {
		const homePageConfig = {
			...starterConfig.homePage,
			sections: {
				...starterConfig.homePage.sections,
				productPreview: false,
				starterSystem: false,
				durability: false,
				socialProof: false,
				programs: false,
				plansMd: false,
			},
			heroPrimaryCta: {
				kind: "link",
				href: routeConfig.docs,
			},
			pricingPrimaryCta: {
				kind: "link",
				href: routeConfig.signIn,
			},
		} satisfies StarterHomePageConfig;
		const renderModel = createHomePageRenderModel({ homePageConfig });

		expect(renderModel.productPreview.isEnabled).toBe(false);
		expect(renderModel.starterSystem.isEnabled).toBe(false);
		expect(renderModel.durability.isEnabled).toBe(false);
		expect(renderModel.socialProof.isEnabled).toBe(false);
		expect(renderModel.programs.isEnabled).toBe(false);
		expect(renderModel.plansMd.isEnabled).toBe(false);
		expect(renderModel.hero.primaryCtaTarget).toEqual({
			kind: "link",
			href: routeConfig.docs,
		});
		expect(renderModel.pricing.primaryCtaTarget).toEqual({
			kind: "link",
			href: routeConfig.signIn,
		});
	});
});
