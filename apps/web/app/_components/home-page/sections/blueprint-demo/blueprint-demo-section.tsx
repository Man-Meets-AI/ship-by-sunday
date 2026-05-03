"use client";

import type { HomePageContent } from "@/app/_content/home-page";

import { BlueprintDemoCard } from "./blueprint-demo-card";
import { BlueprintDemoCtaBar } from "./blueprint-demo-cta-bar";
import { BlueprintDemoLeverageHero } from "./blueprint-demo-leverage-hero";
import { useBlueprintDemoStaggerDelays } from "./blueprint-demo-motion";
import {
	BlueprintDemoSidebar,
	type BlueprintDemoSidebarProgressEntry,
} from "./blueprint-demo-sidebar";
import { BlueprintDemoTopBar } from "./blueprint-demo-top-bar";
import { ScrollReveal } from "../scroll-reveal";
import type { HomePageBlueprintDraftFields } from "./home-page-blueprint-draft-storage";
import { useHomePageBlueprintDraft } from "./use-home-page-blueprint-draft";

type BlueprintDemoSection = HomePageContent["productPreviewSection"];

export function BlueprintDemoSectionBlock({
	section,
}: {
	readonly section: BlueprintDemoSection;
}) {
	const draft = useHomePageBlueprintDraft({
		defaultPresetId: section.design.defaultPresetId,
		defaultPricingModel: section.pricing.defaultModel,
		defaultPrice: section.pricing.defaultPrice,
	});
	const cardStaggerDelays = useBlueprintDemoStaggerDelays(
		section.sections.length,
	);
	const sidebarProgress = buildSidebarProgress(
		draft.fields,
		section.design.defaultPresetId,
		section.pricing.defaultModel,
		section.pricing.defaultPrice,
	);

	return (
		<section className="flex flex-col pb-20 sm:pb-24">
			<div className="relative left-1/2 -mt-4 w-screen -translate-x-1/2 bg-[#111111] text-white sm:-mt-6 lg:-mt-8">
				<div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pt-4 pb-12 sm:px-12 sm:pt-6 sm:pb-16 lg:pt-8">
					<BlueprintDemoTopBar tone="dark" />
					<ScrollReveal direction="none" className="flex flex-1">
						<BlueprintDemoLeverageHero leverageHero={section.leverageHero} />
					</ScrollReveal>
				</div>
			</div>
			<div className="grid gap-8 pt-10 sm:pt-14 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-10 lg:pt-16">
				<div className="lg:sticky lg:top-24 lg:self-start">
					<BlueprintDemoSidebar
						sections={section.sections}
						progress={sidebarProgress}
					/>
				</div>
				<div className="space-y-5">
					{section.sections.map((sectionRow, index) => {
						const sectionNumber = index + 1;
						const staggerDelay = cardStaggerDelays[index] ?? 0;

						return (
							<ScrollReveal key={sectionRow.id} delay={staggerDelay}>
								<BlueprintDemoCard
									section={section}
									sectionRow={sectionRow}
									sectionNumber={sectionNumber}
									draft={draft}
								/>
							</ScrollReveal>
						);
					})}
					<BlueprintDemoCtaBar
						cta={section.cta}
						onBeforeCheckout={draft.persistNow}
					/>
				</div>
			</div>
			<div className="h-16 sm:hidden" aria-hidden="true" />
		</section>
	);
}

function buildSidebarProgress(
	fields: HomePageBlueprintDraftFields,
	defaultPresetId: string,
	defaultPricingModel: string,
	defaultPrice: string,
): readonly BlueprintDemoSidebarProgressEntry[] {
	const foundationValues = [
		fields.product_name,
		fields.product_summary,
		fields.primary_user,
	].map((value) => value.trim());
	const filledFoundationCount = foundationValues.filter(
		(value) => value.length > 0,
	).length;
	const foundationStatus =
		filledFoundationCount === 0
			? "empty"
			: filledFoundationCount === foundationValues.length
				? "complete"
				: "started";

	const designStatus =
		fields.design_preset_id !== defaultPresetId ? "complete" : "empty";

	const pricingValueChanged = fields.pricing.trim() !== defaultPrice;
	const pricingModelChanged = fields.pricing_model !== defaultPricingModel;
	const pricingHasUserValue = fields.pricing.trim().length > 0;
	const pricingStatus = !pricingHasUserValue
		? "empty"
		: pricingValueChanged || pricingModelChanged
			? "complete"
			: "started";

	return [
		{ id: "foundation", status: foundationStatus },
		{ id: "design", status: designStatus },
		{ id: "pricing", status: pricingStatus },
	];
}
