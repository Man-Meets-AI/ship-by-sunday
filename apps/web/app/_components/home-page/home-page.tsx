import { getHomePageRenderModel } from "@/app/_lib/home-page-render-model";

import {
	CommonQuestionsSection,
	FooterSection,
	PricingSectionBlock,
	SocialProofSection,
} from "./sections/closing-sections";
import { HomeHeroSection } from "./sections/hero-sections";
import { BlueprintDemoSectionBlock } from "./sections/blueprint-demo/blueprint-demo-section";
import { DurabilitySectionBlock } from "./sections/durability-section";
import { ExecLoopSectionBlock } from "./sections/exec-loop-section";
import { SprintPathUnifiedSection } from "./sections/sprint-path-unified-section";
import { StarterSystemSectionBlock } from "./sections/starter-system-section";

export default async function HomePage() {
	const homePageRenderModel = getHomePageRenderModel();
	const shouldRenderProductPreview =
		homePageRenderModel.productPreview.isEnabled;

	return (
		<main className="overflow-x-clip bg-background text-foreground">
			<div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pt-4 pb-12 sm:px-12 sm:pt-6 sm:pb-20 lg:pt-8">
				{shouldRenderProductPreview ? (
					<BlueprintDemoSectionBlock
						section={homePageRenderModel.productPreview.section}
					>
						<HomePageIdeaContinuation
							homePageRenderModel={homePageRenderModel}
							heroVariant="supporting"
						/>
					</BlueprintDemoSectionBlock>
				) : (
					<HomePageIdeaContinuation
						homePageRenderModel={homePageRenderModel}
						heroVariant="lead"
					/>
				)}
				{homePageRenderModel.socialProof.isEnabled ? (
					<SocialProofSection
						socialProofSection={homePageRenderModel.socialProof.variant.section}
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
			{homePageRenderModel.sprintPath.isEnabled ? (
				<SprintPathUnifiedSection
					sprintPathSection={homePageRenderModel.sprintPath.section}
					mechanismSection={
						homePageRenderModel.mechanism.isEnabled
							? homePageRenderModel.mechanism.section
							: undefined
					}
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
