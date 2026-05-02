"use client";

import { ShieldCheck } from "lucide-react";

import { PointerHighlight } from "@/components/ui/pointer-highlight";
import type { HomePageContent } from "@/app/_content/home-page";

import { BlueprintDemoCtaBar } from "./blueprint-demo-cta-bar";
import { BlueprintDemoDesignCard } from "./blueprint-demo-design-card";
import { BlueprintDemoFoundationCard } from "./blueprint-demo-foundation-card";
import { BlueprintDemoLockedCard } from "./blueprint-demo-locked-card";
import { BlueprintDemoPricingCard } from "./blueprint-demo-pricing-card";
import { BlueprintDemoSidebar } from "./blueprint-demo-sidebar";
import { BlueprintDemoTopBar } from "./blueprint-demo-top-bar";
import { ScrollReveal } from "../scroll-reveal";
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
						<PointerHighlight containerClassName="text-primary/90">
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
				<div className="lg:sticky lg:top-20 lg:self-start">
					<BlueprintDemoSidebar sections={section.sections} />
				</div>
				<div className="space-y-5">
					{section.sections.map((sectionRow, index) => {
						const sectionNumber = index + 1;
						if (sectionRow.id === "foundation") {
							return (
								<BlueprintDemoFoundationCard
									key={sectionRow.id}
									sectionNumber={sectionNumber}
									label={sectionRow.label}
									description={sectionRow.description}
									foundation={section.foundation}
									fields={draft.fields}
									onFoundationFieldChange={draft.setFoundationField}
								/>
							);
						}
						if (sectionRow.id === "design") {
							return (
								<BlueprintDemoDesignCard
									key={sectionRow.id}
									sectionNumber={sectionNumber}
									label={sectionRow.label}
									description={sectionRow.description}
									design={section.design}
									fields={draft.fields}
									onSelectPreset={draft.selectDesignPreset}
								/>
							);
						}
						if (sectionRow.id === "pricing") {
							return (
								<BlueprintDemoPricingCard
									key={sectionRow.id}
									sectionNumber={sectionNumber}
									label={sectionRow.label}
									description={sectionRow.description}
									pricing={section.pricing}
									fields={draft.fields}
									onSelectPricingModel={draft.setPricingModel}
									onPricingChange={draft.setPricing}
								/>
							);
						}
						return (
							<BlueprintDemoLockedCard
								key={sectionRow.id}
								sectionId={sectionRow.id}
								sectionNumber={sectionNumber}
								label={sectionRow.label}
								description={sectionRow.description}
							/>
						);
					})}
					<BlueprintDemoCtaBar
						cta={section.cta}
						onBeforeCheckout={draft.persistNow}
					/>
				</div>
			</div>
			<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
				<ShieldCheck className="size-4" aria-hidden />
				<span>{section.previewNote}</span>
			</div>
		</section>
	);
}
