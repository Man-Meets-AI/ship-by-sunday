"use client";

import { PointerHighlight } from "@/components/ui/pointer-highlight";
import type { HomePageContent } from "@/app/_content/home-page";

import { BlueprintDemoCtaBar } from "./blueprint-demo-cta-bar";
import { BlueprintDemoDesignCard } from "./blueprint-demo-design-card";
import { BlueprintDemoFoundationCard } from "./blueprint-demo-foundation-card";
import { BlueprintDemoLockedCard } from "./blueprint-demo-locked-card";
import { useBlueprintDemoStaggerDelays } from "./blueprint-demo-motion";
import { BlueprintDemoPricingCard } from "./blueprint-demo-pricing-card";
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
		<section className="flex min-h-screen flex-col gap-10 pb-20 pt-2 sm:gap-14 sm:pb-24">
			<BlueprintDemoTopBar />
			<ScrollReveal>
				<div className="max-w-3xl space-y-3">
					<h1
						data-testid="blueprint-demo-headline"
						className="text-balance text-4xl font-semibold leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
					>
						{section.headline.prefix}
						<PointerHighlight containerClassName="text-foreground/90">
							{section.headline.highlight}
						</PointerHighlight>
					</h1>
					<p className="max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
						{section.intro}
					</p>
					<p className="max-w-2xl text-sm leading-6 text-muted-foreground">
						{section.unlockNote}
					</p>
				</div>
			</ScrollReveal>
			<div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-10">
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
						const cardElement = (() => {
							if (sectionRow.id === "foundation") {
								return (
									<BlueprintDemoFoundationCard
										sectionNumber={sectionNumber}
										label={sectionRow.label}
										description={sectionRow.description}
										foundation={section.foundation}
										fields={draft.fields}
										lastSavedAt={draft.lastSavedAt}
										onFoundationFieldChange={draft.setFoundationField}
									/>
								);
							}
							if (sectionRow.id === "design") {
								return (
									<BlueprintDemoDesignCard
										sectionNumber={sectionNumber}
										label={sectionRow.label}
										description={sectionRow.description}
										design={section.design}
										fields={draft.fields}
										lastSavedAt={draft.lastSavedAt}
										onSelectPreset={draft.selectDesignPreset}
									/>
								);
							}
							if (sectionRow.id === "pricing") {
								return (
									<BlueprintDemoPricingCard
										sectionNumber={sectionNumber}
										label={sectionRow.label}
										description={sectionRow.description}
										pricing={section.pricing}
										fields={draft.fields}
										lastSavedAt={draft.lastSavedAt}
										onSelectPricingModel={draft.setPricingModel}
										onPricingChange={draft.setPricing}
									/>
								);
							}
							return (
								<BlueprintDemoLockedCard
									sectionId={sectionRow.id}
									sectionNumber={sectionNumber}
									label={sectionRow.label}
									description={sectionRow.description}
								/>
							);
						})();
						return (
							<ScrollReveal key={sectionRow.id} delay={staggerDelay}>
								{cardElement}
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
