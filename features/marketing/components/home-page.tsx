import { homePageContent } from "@/features/marketing/content/home";
import { fetchGitHubContributions } from "@/features/marketing/lib/github";

import {
	CommonQuestionsSection,
	FooterSection,
	FounderProofSection,
	PricingSectionBlock,
} from "./home-page/closing-sections";
import { HomeHeroSection } from "./home-page/hero-sections";
import { SprintPathUnifiedSection } from "./home-page/sprint-path-unified-section";
import { WhatsInsideSection } from "./home-page/whats-inside-section";

export default async function HomePage() {
	const githubActivity = await fetchGitHubContributions(
		homePageContent.proofSection.github.username,
	);

	return (
		<main className="bg-background text-foreground">
			<div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8">
				<HomeHeroSection
					hero={homePageContent.hero}
					heroPreviewImage={homePageContent.assets.heroPreviewImage}
				/>
				<SprintPathUnifiedSection
					sprintPathSection={homePageContent.sprintPathSection}
				/>
				<WhatsInsideSection
					whatsInsideSection={homePageContent.whatsInsideSection}
				/>
				<FounderProofSection
					proofImage={homePageContent.assets.proofImage}
					proofSection={homePageContent.proofSection}
					githubActivity={githubActivity}
				/>
				<CommonQuestionsSection faqSection={homePageContent.faqSection} />
				<PricingSectionBlock pricingSection={homePageContent.pricingSection} />
				<FooterSection footerWordmark={homePageContent.footerWordmark} />
			</div>
		</main>
	);
}
