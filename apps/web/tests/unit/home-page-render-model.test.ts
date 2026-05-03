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
		expect(renderModel.productPreview.section.cta.secondaryHref).toBe(
			"#system",
		);
		expect(renderModel.hero.isEnabled).toBe(true);
		expect(renderModel.hero.primaryCtaTarget).toEqual({ kind: "checkout" });
		expect(renderModel.mechanism.isEnabled).toBe(false);
		expect(renderModel.mechanism.section.tagline).toBe(
			"One source of truth. No drift.",
		);
		expect(renderModel.execLoop.isEnabled).toBe(true);
		expect(
			renderModel.execLoop.section.steps.map((step) => step.label),
		).toEqual(["Decide", "Brief", "Run", "Review"]);
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
