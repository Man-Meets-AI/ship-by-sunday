import { describe, expect, it } from "vitest";

import {
	homePageSectionOrder,
	routeConfig,
	starterConfig,
	type StarterHomePageConfig,
} from "@/config/product";
import { createHomePageRenderModel } from "@/features/marketing/lib/home-page-render-model";

describe("home page render model", () => {
	it("preserves the default section order and checkout CTA defaults", () => {
		const renderModel = createHomePageRenderModel();

		expect(renderModel.sectionOrder).toEqual(homePageSectionOrder);
		expect(renderModel.hero.isEnabled).toBe(true);
		expect(renderModel.hero.primaryCtaTarget).toEqual({ kind: "checkout" });
		expect(renderModel.durability.isEnabled).toBe(true);
		expect(renderModel.socialProof.isEnabled).toBe(true);
		expect(renderModel.socialProof.githubActivityUsername).toBe("ParkerRex");
		expect(renderModel.socialProof.variant.kind).toBe("founder");
		expect(renderModel.socialProof.variant.requiresGitHubActivity).toBe(true);
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

		expect(renderModel.durability.isEnabled).toBe(false);
		expect(renderModel.socialProof.isEnabled).toBe(false);
		expect(renderModel.socialProof.githubActivityUsername).toBeNull();
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
