import {
	homePageSectionOrder,
	starterConfig,
	type HomePageCtaTarget,
	type HomePageSectionName,
	type StarterHomePageConfig,
} from "@/config/product";
import {
	homePageContent,
	type HomePageContent,
} from "@/app/_content/home-page";

export type HomePageSocialProofVariant = {
	readonly kind: "founder";
	readonly section: HomePageContent["socialProofSection"];
};

export type HomePageRenderModel = {
	readonly sectionOrder: readonly HomePageSectionName[];
	readonly productPreview: {
		readonly isEnabled: boolean;
		readonly section: HomePageContent["productPreviewSection"];
	};
	readonly hero: {
		readonly isEnabled: boolean;
		readonly section: HomePageContent["hero"];
		readonly primaryCtaTarget: HomePageCtaTarget;
	};
	readonly sprintPath: {
		readonly isEnabled: boolean;
		readonly section: HomePageContent["sprintPathSection"];
	};
	readonly mechanism: {
		readonly isEnabled: boolean;
		readonly section: HomePageContent["mechanismSection"];
	};
	readonly execLoop: {
		readonly isEnabled: boolean;
		readonly section: HomePageContent["execLoopSection"];
	};
	readonly starterSystem: {
		readonly isEnabled: boolean;
		readonly section: HomePageContent["starterSystemSection"];
	};
	readonly durability: {
		readonly isEnabled: boolean;
		readonly section: HomePageContent["durabilitySection"];
	};
	readonly socialProof: {
		readonly isEnabled: boolean;
		readonly variant: HomePageSocialProofVariant;
	};
	readonly faq: {
		readonly isEnabled: boolean;
		readonly section: HomePageContent["faqSection"];
	};
	readonly pricing: {
		readonly isEnabled: boolean;
		readonly section: HomePageContent["pricingSection"];
		readonly primaryCtaTarget: HomePageCtaTarget;
	};
	readonly footer: {
		readonly isEnabled: boolean;
		readonly wordmark: HomePageContent["footerWordmark"];
	};
};

type CreateHomePageRenderModelArgs = {
	readonly homePageConfig?: StarterHomePageConfig;
	readonly content?: HomePageContent;
};

export function createHomePageRenderModel({
	homePageConfig = starterConfig.homePage,
	content = homePageContent,
}: CreateHomePageRenderModelArgs = {}): HomePageRenderModel {
	const socialProofVariant = {
		kind: "founder",
		section: content.socialProofSection,
	} as const satisfies HomePageSocialProofVariant;

	return {
		sectionOrder: homePageSectionOrder,
		productPreview: {
			isEnabled: homePageConfig.sections.productPreview,
			section: content.productPreviewSection,
		},
		hero: {
			isEnabled: homePageConfig.sections.hero,
			section: content.hero,
			primaryCtaTarget: homePageConfig.heroPrimaryCta,
		},
		sprintPath: {
			isEnabled: homePageConfig.sections.sprintPath,
			section: content.sprintPathSection,
		},
		mechanism: {
			isEnabled: homePageConfig.sections.mechanism,
			section: content.mechanismSection,
		},
		execLoop: {
			isEnabled: homePageConfig.sections.execLoop,
			section: content.execLoopSection,
		},
		starterSystem: {
			isEnabled: homePageConfig.sections.starterSystem,
			section: content.starterSystemSection,
		},
		durability: {
			isEnabled: homePageConfig.sections.durability,
			section: content.durabilitySection,
		},
		socialProof: {
			isEnabled: homePageConfig.sections.socialProof,
			variant: socialProofVariant,
		},
		faq: {
			isEnabled: homePageConfig.sections.faq,
			section: content.faqSection,
		},
		pricing: {
			isEnabled: homePageConfig.sections.pricing,
			section: content.pricingSection,
			primaryCtaTarget: homePageConfig.pricingPrimaryCta,
		},
		footer: {
			isEnabled: homePageConfig.sections.footer,
			wordmark: content.footerWordmark,
		},
	};
}

export function getHomePageRenderModel() {
	return createHomePageRenderModel();
}
