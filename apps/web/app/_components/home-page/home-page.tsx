import { getHomePageRenderModel } from "@/app/_lib/home-page-render-model";

import { CommonQuestionsSection } from "./sections/common-questions-section";
import {
	FooterSection,
	PricingSectionBlock,
} from "./sections/pricing-footer-sections";
import { SocialProofSection } from "./sections/social-proof-section";
import { HomeHeroSection } from "./sections/hero-sections";
import { CodebaseDemoSectionBlock } from "./sections/codebase-demo/codebase-demo-section";
import { DurabilitySectionBlock } from "./sections/durability-section";
import { ExecLoopSectionBlock } from "./sections/exec-loop-section";
import { PlansMdSectionBlock } from "./sections/plans-md-section";
import { ProgramsSectionBlock } from "./sections/programs-section";
import { StarterSystemSectionBlock } from "./sections/starter-system-section";

export default async function HomePage() {
	const homePageRenderModel = getHomePageRenderModel();
	const shouldRenderProductPreview =
		homePageRenderModel.productPreview.isEnabled;

	return (
		<main className="overflow-x-clip bg-background text-foreground">
			<div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-12 sm:px-12 sm:pb-20">
				{shouldRenderProductPreview ? (
					<CodebaseDemoSectionBlock
						section={homePageRenderModel.productPreview.section}
					>
						<HomePageIdeaContinuation
							homePageRenderModel={homePageRenderModel}
							heroVariant="supporting"
						/>
					</CodebaseDemoSectionBlock>
				) : (
					<div className="pt-4 sm:pt-6 lg:pt-8">
						<HomePageIdeaContinuation
							homePageRenderModel={homePageRenderModel}
							heroVariant="lead"
						/>
					</div>
				)}
				{homePageRenderModel.socialProof.isEnabled ? (
					<SocialProofSection
						socialProofSection={homePageRenderModel.socialProof.variant.section}
					/>
				) : null}
				{homePageRenderModel.programs.isEnabled ? (
					<ProgramsSectionBlock
						programsSection={homePageRenderModel.programs.section}
					/>
				) : null}
				{homePageRenderModel.faq.isEnabled ? (
					<CommonQuestionsSection
						faqSection={homePageRenderModel.faq.section}
					/>
				) : null}
				{homePageRenderModel.plansMd.isEnabled ? (
					<PlansMdSectionBlock
						plansMdSection={homePageRenderModel.plansMd.section}
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

function HomePageIdeaContinuation({
	homePageRenderModel,
	heroVariant,
}: {
	readonly homePageRenderModel: ReturnType<typeof getHomePageRenderModel>;
	readonly heroVariant: "lead" | "supporting";
}) {
	return (
		<>
			{homePageRenderModel.hero.isEnabled ? (
				<HomeHeroSection
					hero={homePageRenderModel.hero.section}
					primaryCtaTarget={homePageRenderModel.hero.primaryCtaTarget}
					variant={heroVariant}
				/>
			) : null}
			{homePageRenderModel.execLoop.isEnabled ? (
				<ExecLoopSectionBlock
					execLoopSection={homePageRenderModel.execLoop.section}
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
		</>
	);
}
