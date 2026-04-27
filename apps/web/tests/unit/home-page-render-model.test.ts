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
		expect(renderModel.hero.isEnabled).toBe(true);
		expect(renderModel.hero.primaryCtaTarget).toEqual({ kind: "checkout" });
		expect(renderModel.mechanism.isEnabled).toBe(false);
		expect(renderModel.mechanism.section.tagline).toBe(
			"One source of truth. No drift.",
		);
		expect(renderModel.starterSystem.isEnabled).toBe(true);
		expect(
			renderModel.starterSystem.section.capabilities.map((item) => item.title),
		).toEqual([
			"Product blueprint",
			"Built-in QA",
			"Safer agent changes",
			"Reuse the product truth",
			"Extend without starting over",
			"Keep one source of truth",
			"Curated design direction",
		]);
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
