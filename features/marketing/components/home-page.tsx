import { homePageContent } from "@/features/marketing/content/home";
import {
	FooterSection,
	PricingSectionBlock,
	ProofAndFaqSection,
} from "./home-page/closing-sections";
import { HomeHeroSection } from "./home-page/hero-sections";
import { ProblemOutcomeSection } from "./home-page/problem-outcome-section";
import { SprintPathUnifiedSection } from "./home-page/sprint-path-unified-section";
import {
	MechanismAudienceSection,
	OfferStackSection,
} from "./home-page/story-sections";

export default function HomePage() {
	return (
		<main className="bg-background text-foreground">
			<div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8">
				<HomeHeroSection hero={homePageContent.hero} />
				<ProblemOutcomeSection
					outcomesSection={homePageContent.outcomesSection}
					problemOutcomeSection={homePageContent.problemOutcomeSection}
					whyBuildersGetStuck={homePageContent.whyBuildersGetStuck}
				/>
				<SprintPathUnifiedSection
					sprintPathSection={homePageContent.sprintPathSection}
				/>
				<MechanismAudienceSection
					audienceSection={homePageContent.audienceSection}
					mechanismSection={homePageContent.mechanismSection}
				/>
				<OfferStackSection
					missionImage={homePageContent.assets.missionImage}
					offerSection={homePageContent.offerSection}
				/>
				<ProofAndFaqSection
					faqSection={homePageContent.faqSection}
					proofImage={homePageContent.assets.proofImage}
					proofSection={homePageContent.proofSection}
				/>
				<PricingSectionBlock pricingSection={homePageContent.pricingSection} />
				<FooterSection
					footerNav={homePageContent.footerNav}
					footerWordmark={homePageContent.footerWordmark}
				/>
			</div>
		</main>
	);
}
