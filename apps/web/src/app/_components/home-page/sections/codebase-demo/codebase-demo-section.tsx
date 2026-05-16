"use client";

import { useState, type ReactNode } from "react";

import type { HomePageContent } from "@/app/_content/home-page";

import { CodebaseDemoCard } from "./codebase-demo-card";
import { CodebaseDemoCodebaseBranch } from "./codebase-demo-codebase-branch";
import { CodebaseDemoCtaBar } from "./codebase-demo-cta-bar";
import {
	CodebaseDemoLeverageHero,
	type LeverageHeroOptionId,
} from "./codebase-demo-leverage-hero";
import { useCodebaseDemoStaggerDelays } from "./codebase-demo-motion";
import { CodebaseDemoSidebar } from "./codebase-demo-sidebar";
import { buildCodebaseDemoSidebarProgress } from "./codebase-demo-sidebar-progress";
import { CodebaseDemoTopBar } from "./codebase-demo-top-bar";
import { ScrollReveal } from "../scroll-reveal";
import { useHomePageCodebaseDraft } from "./use-home-page-codebase-draft";

type CodebaseDemoSection = HomePageContent["productPreviewSection"];

export function CodebaseDemoSectionBlock({
	section,
	children,
}: {
	readonly section: CodebaseDemoSection;
	readonly children?: ReactNode;
}) {
	const [selectedOptionId, setSelectedOptionId] =
		useState<LeverageHeroOptionId>(section.leverageHero.defaultOptionId);
	const draft = useHomePageCodebaseDraft({
		defaultPresetId: section.design.defaultPresetId,
		defaultPricingModel: section.pricing.defaultModel,
		defaultPrice: section.pricing.defaultPrice,
	});
	const cardStaggerDelays = useCodebaseDemoStaggerDelays(
		section.sections.length,
	);
	const sidebarProgress = buildCodebaseDemoSidebarProgress(
		draft.fields,
		section.design.defaultPresetId,
		section.pricing.defaultModel,
		section.pricing.defaultPrice,
	);
	const isIdeaBranchSelected = selectedOptionId === "idea";

	return (
		<section className="flex flex-col">
			<div className="relative left-1/2 w-screen -translate-x-1/2 bg-[#111111] text-white">
				<div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pt-4 pb-12 sm:px-12 sm:pt-6 sm:pb-16 lg:pt-8">
					<CodebaseDemoTopBar tone="dark" />
					<ScrollReveal direction="none" className="flex flex-1">
						<CodebaseDemoLeverageHero
							leverageHero={section.leverageHero}
							selectedOptionId={selectedOptionId}
							onSelectedOptionChange={setSelectedOptionId}
						/>
					</ScrollReveal>
				</div>
			</div>
			{isIdeaBranchSelected ? (
				<div
					className="grid gap-8 pt-10 pb-20 sm:pt-14 sm:pb-24 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-10 lg:pt-16"
					data-testid="codebase-demo-idea-branch"
				>
					<div className="lg:sticky lg:top-24 lg:self-start">
						<CodebaseDemoSidebar
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
									<CodebaseDemoCard
										section={section}
										sectionRow={sectionRow}
										sectionNumber={sectionNumber}
										draft={draft}
									/>
								</ScrollReveal>
							);
						})}
						<CodebaseDemoCtaBar
							cta={section.cta}
							onBeforeCheckout={draft.persistNow}
						/>
					</div>
				</div>
			) : (
				<CodebaseDemoCodebaseBranch codebaseBranch={section.codebaseBranch} />
			)}
			{children}
			<div className="h-16 sm:hidden" aria-hidden="true" />
		</section>
	);
}
