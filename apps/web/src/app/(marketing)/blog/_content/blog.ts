import { homePageContent } from "@/app/_content/home-page";
import { blogDisplayConfig } from "@/config/starter-selectors";

const heroHeadline = [
	homePageContent.hero.headlineLead,
	homePageContent.hero.headlineTailPrefix,
	homePageContent.hero.headlineTailHover,
]
	.filter(Boolean)
	.join(" ");

export const blogIndexContent = {
	eyebrow: "Ship by Sunday",
	titleLead: "Recent essays",
	titleAccent: "",
	intro: blogDisplayConfig.description,
	archiveLabel: "Latest field notes",
	emptyState:
		"No published essays yet. The route is live, but the first editorial draft is still marked private.",
	description: blogDisplayConfig.description,
	siteName: blogDisplayConfig.siteName,
} as const;

export const blogPromoContent = {
	eyebrow: "From the same system",
	title: heroHeadline,
	body: `Ship by Sunday turns phone-started exec loops into worker packs, QA paths, and an aligned starter path.`,
	ctaLabel: homePageContent.pricingSection.ctaTitle,
} as const;
