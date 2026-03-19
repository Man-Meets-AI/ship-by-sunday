import { homePageContent } from "@/features/marketing/content/home";
import {
	FooterSection,
	PricingSectionBlock,
	ProofAndFaqSection,
} from "./home-page/closing-sections";
import {
	HomeHeroSection,
	OutcomesSection,
	WhyBuildersGetStuckSection,
} from "./home-page/hero-sections";
import {
	ProcessCalloutSection,
	SprintDeepDiveSection,
	SprintOverviewSection,
} from "./home-page/sprint-sections";
import {
	AudienceFitSection,
	MechanismStorySection,
	OfferStackSection,
} from "./home-page/story-sections";

export default function HomePage() {
	return (
		<main className="bg-background text-foreground">
			<div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8">
				<HomeHeroSection hero={homePageContent.hero} />
				<OutcomesSection outcomesSection={homePageContent.outcomesSection} />
				<WhyBuildersGetStuckSection
					whyBuildersGetStuck={homePageContent.whyBuildersGetStuck}
				/>
				<SprintOverviewSection
					sprintPathSection={homePageContent.sprintPathSection}
				/>
				<ProcessCalloutSection
					processCallout={homePageContent.processCallout}
				/>
				<SprintDeepDiveSection
					sprintPathSection={homePageContent.sprintPathSection}
				/>
				<MechanismStorySection
					mechanismSection={homePageContent.mechanismSection}
				/>
				<AudienceFitSection audienceSection={homePageContent.audienceSection} />
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
