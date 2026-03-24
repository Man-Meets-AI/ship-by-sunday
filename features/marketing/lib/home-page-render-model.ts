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
} from "@/features/marketing/content/home";

export type HomePageSocialProofVariant = {
	readonly kind: "founder";
	readonly image: HomePageContent["assets"]["socialProofImage"];
	readonly section: HomePageContent["socialProofSection"];
	readonly githubUsername: string;
	readonly requiresGitHubActivity: true;
};

export type HomePageRenderModel = {
	readonly sectionOrder: readonly HomePageSectionName[];
	readonly hero: {
		readonly isEnabled: boolean;
		readonly previewImage: HomePageContent["assets"]["heroPreviewImage"];
		readonly section: HomePageContent["hero"];
		readonly primaryCtaTarget: HomePageCtaTarget;
	};
	readonly sprintPath: {
		readonly isEnabled: boolean;
		readonly section: HomePageContent["sprintPathSection"];
	};
	readonly whatsInside: {
		readonly isEnabled: boolean;
		readonly section: HomePageContent["whatsInsideSection"];
	};
	readonly socialProof: {
		readonly isEnabled: boolean;
		readonly githubActivityUsername: string | null;
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
		image: content.assets.socialProofImage,
		section: content.socialProofSection,
		githubUsername: content.socialProofSection.github.username,
		requiresGitHubActivity: true,
	} as const satisfies HomePageSocialProofVariant;
	const shouldFetchSocialProofGitHubActivity =
		homePageConfig.sections.socialProof &&
		socialProofVariant.requiresGitHubActivity;

	return {
		sectionOrder: homePageSectionOrder,
		hero: {
			isEnabled: homePageConfig.sections.hero,
			previewImage: content.assets.heroPreviewImage,
			section: content.hero,
			primaryCtaTarget: homePageConfig.heroPrimaryCta,
		},
		sprintPath: {
			isEnabled: homePageConfig.sections.sprintPath,
			section: content.sprintPathSection,
		},
		whatsInside: {
			isEnabled: homePageConfig.sections.whatsInside,
			section: content.whatsInsideSection,
		},
		socialProof: {
			isEnabled: homePageConfig.sections.socialProof,
			githubActivityUsername: shouldFetchSocialProofGitHubActivity
				? socialProofVariant.githubUsername
				: null,
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
