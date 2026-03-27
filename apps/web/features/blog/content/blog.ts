import { homePageContent } from "@/features/marketing/content/home";
import { blogDisplayConfig } from "@/features/starter/lib/starter-selectors";

const heroHeadline = [
	homePageContent.hero.headlineLead,
	homePageContent.hero.headlineTailPrefix,
	homePageContent.hero.headlineTailHover,
]
	.filter(Boolean)
	.join(" ");

export const blogIndexContent = {
	eyebrow: "Public editorial surface",
	titleLead: "Build the operating system",
	titleAccent: "before the prompt",
	intro:
		"Field notes on durable product truth, premium editorial structure, and the context decisions that let AI tools keep shipping after the first sprint.",
	archiveLabel: "Latest essays",
	emptyState:
		"No published essays yet. The route is live, but the first editorial draft is still marked private.",
	description: blogDisplayConfig.description,
	siteName: blogDisplayConfig.siteName,
} as const;

export const blogPromoContent = {
	eyebrow: "From the same system",
	title: heroHeadline,
	body: `Ship by Sunday turns the editorial thinking into a working weekend build system: durable product truth, agent-ready packs, and a starter path that keeps the repo aligned after the first ship.`,
	ctaLabel: homePageContent.pricingSection.ctaTitle,
} as const;
