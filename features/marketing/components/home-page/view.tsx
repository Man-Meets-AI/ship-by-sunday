import type { HomePageContent } from "@/features/marketing/content/home";
import { PublicPageFrame } from "@/shared/ui/public-surface";

import {
	FooterSection,
	PricingSectionBlock,
	ProofAndFaqSection,
} from "./closing-sections";
import {
	HomeHeroSection,
	OutcomesSection,
	WhyBuildersGetStuckSection,
} from "./hero-sections";
import {
	ProcessCalloutSection,
	SprintDeepDiveSection,
	SprintOverviewSection,
} from "./sprint-sections";
import {
	AudienceFitSection,
	MechanismStorySection,
	OfferStackSection,
} from "./story-sections";

export function HomePageView({ content }: { content: HomePageContent }) {
	return (
		<PublicPageFrame>
			<HomeHeroSection hero={content.hero} />
			<OutcomesSection outcomesSection={content.outcomesSection} />
			<WhyBuildersGetStuckSection
				whyBuildersGetStuck={content.whyBuildersGetStuck}
			/>
			<SprintOverviewSection sprintPathSection={content.sprintPathSection} />
			<ProcessCalloutSection processCallout={content.processCallout} />
			<SprintDeepDiveSection sprintPathSection={content.sprintPathSection} />
			<MechanismStorySection mechanismSection={content.mechanismSection} />
			<AudienceFitSection audienceSection={content.audienceSection} />
			<OfferStackSection
				missionImage={content.assets.missionImage}
				offerSection={content.offerSection}
			/>
			<ProofAndFaqSection
				faqSection={content.faqSection}
				proofImage={content.assets.proofImage}
				proofSection={content.proofSection}
			/>
			<PricingSectionBlock pricingSection={content.pricingSection} />
			<FooterSection
				footerNav={content.footerNav}
				footerWordmark={content.footerWordmark}
			/>
		</PublicPageFrame>
	);
}
