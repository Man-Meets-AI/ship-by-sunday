import { fetchGitHubContributions } from "@/features/marketing/lib/github";
import { getHomePageRenderModel } from "@/features/marketing/lib/home-page-render-model";

import {
	CommonQuestionsSection,
	FooterSection,
	PricingSectionBlock,
	SocialProofSection,
} from "./home-page/closing-sections";
import { HomeHeroSection } from "./home-page/hero-sections";
import { DurabilitySectionBlock } from "./home-page/durability-section";
import { SprintPathUnifiedSection } from "./home-page/sprint-path-unified-section";
import { StarterSystemSectionBlock } from "./home-page/starter-system-section";
import { WhatsInsideSection } from "./home-page/whats-inside-section";

export default async function HomePage() {
	const homePageRenderModel = getHomePageRenderModel();
	const githubActivity = homePageRenderModel.socialProof.githubActivityUsername
		? await fetchGitHubContributions(
				homePageRenderModel.socialProof.githubActivityUsername,
			)
		: null;

	return (
		<main className="bg-background text-foreground">
			<div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-12 sm:px-12 sm:py-20">
				{homePageRenderModel.hero.isEnabled ? (
					<HomeHeroSection
						hero={homePageRenderModel.hero.section}
						primaryCtaTarget={homePageRenderModel.hero.primaryCtaTarget}
					/>
				) : null}
				{homePageRenderModel.sprintPath.isEnabled ? (
					<SprintPathUnifiedSection
						sprintPathSection={homePageRenderModel.sprintPath.section}
					/>
				) : null}
				{homePageRenderModel.whatsInside.isEnabled ? (
					<WhatsInsideSection
						whatsInsideSection={homePageRenderModel.whatsInside.section}
					/>
				) : null}
				{homePageRenderModel.starterSystem.isEnabled ? (
					<StarterSystemSectionBlock
						starterSystemSection={homePageRenderModel.starterSystem.section}
					/>
				) : null}
				{homePageRenderModel.durability.isEnabled ? (
					<DurabilitySectionBlock
						durabilitySection={homePageRenderModel.durability.section}
					/>
				) : null}
				{homePageRenderModel.socialProof.isEnabled ? (
					<SocialProofSection
						socialProofImage={homePageRenderModel.socialProof.variant.image}
						socialProofSection={homePageRenderModel.socialProof.variant.section}
						githubActivity={githubActivity}
					/>
				) : null}
				{homePageRenderModel.faq.isEnabled ? (
					<CommonQuestionsSection
						faqSection={homePageRenderModel.faq.section}
					/>
				) : null}
				{homePageRenderModel.pricing.isEnabled ? (
					<PricingSectionBlock
						pricingSection={homePageRenderModel.pricing.section}
						primaryCtaTarget={homePageRenderModel.pricing.primaryCtaTarget}
					/>
				) : null}
				{homePageRenderModel.footer.isEnabled ? (
					<FooterSection footerWordmark={homePageRenderModel.footer.wordmark} />
				) : null}
			</div>
		</main>
	);
}
