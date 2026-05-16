"use client";

import { WandSparkles } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { CodebaseDemoCard } from "@/app/_components/home-page/sections/codebase-demo/codebase-demo-card";
import { CodebaseDemoSidebar } from "@/app/_components/home-page/sections/codebase-demo/codebase-demo-sidebar";
import { buildCodebaseDemoSidebarProgress } from "@/app/_components/home-page/sections/codebase-demo/codebase-demo-sidebar-progress";
import { useHomePageCodebaseDraft } from "@/app/_components/home-page/sections/codebase-demo/use-home-page-codebase-draft";
import type { HomePageContent } from "@/app/_content/home-page";
import {
	PublicRouteContainer,
	PublicRouteEyebrow,
	PublicRouteIcon,
	PublicRouteSection,
	PublicRouteSectionTitle,
} from "@/components/layout/public-route-surface";

import { StarterPreviewCheckoutBar } from "./StarterPreviewCheckoutBar";

type StarterPreviewSection = HomePageContent["productPreviewSection"];
type StarterPreviewSectionRow = StarterPreviewSection["sections"][number];

const STARTER_PREVIEW_SECTION_IDS = [
	"foundation",
	"design",
	"pricing",
	"generated-preview",
] as const;

export function StarterInteractivePreview({
	section,
	offerPriceDisplay,
}: {
	readonly section: StarterPreviewSection;
	readonly offerPriceDisplay: string;
}) {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const draft = useHomePageCodebaseDraft({
		defaultPresetId: section.design.defaultPresetId,
		defaultPricingModel: section.pricing.defaultModel,
		defaultPrice: section.pricing.defaultPrice,
	});
	const previewSections = useMemo(
		() => section.sections.filter(isStarterPreviewSection),
		[section.sections],
	);
	const sidebarProgress = buildCodebaseDemoSidebarProgress(
		draft.fields,
		section.design.defaultPresetId,
		section.pricing.defaultModel,
		section.pricing.defaultPrice,
	);

	const dismissError = useCallback(() => {
		setErrorMessage(null);
	}, []);

	return (
		<PublicRouteSection tone="muted" data-testid="starter-interactive-preview">
			<PublicRouteContainer className="grid min-w-0 gap-8 py-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
				<div className="min-w-0 lg:sticky lg:top-24">
					<PublicRouteIcon>
						<WandSparkles className="size-5" aria-hidden />
					</PublicRouteIcon>
					<PublicRouteEyebrow className="mt-5">
						Starter preview
					</PublicRouteEyebrow>
					<PublicRouteSectionTitle>
						Try the first three answers before checkout.
					</PublicRouteSectionTitle>
					<p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
						Shape the idea, pick the design direction, and set the first pricing
						assumption. Starter saves the draft locally so the protected
						workspace can pick up where this preview leaves off.
					</p>
					<div className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3 lg:grid-cols-1">
						<StarterPreviewPill label="Idea" value="Product facts" />
						<StarterPreviewPill label="Design" value="Visual DNA" />
						<StarterPreviewPill label="Repo" value="Unlocked after checkout" />
					</div>
					<div className="mt-5">
						<CodebaseDemoSidebar
							sections={previewSections}
							progress={sidebarProgress}
						/>
					</div>
				</div>
				<div className="min-w-0 space-y-4">
					{previewSections.map((sectionRow, index) => (
						<CodebaseDemoCard
							key={sectionRow.id}
							section={section}
							sectionRow={sectionRow}
							sectionNumber={index + 1}
							draft={draft}
						/>
					))}
					<StarterPreviewCheckoutBar
						label={section.cta.label}
						lockedNote={section.cta.lockedNote}
						offerPriceDisplay={offerPriceDisplay}
						errorMessage={errorMessage}
						onDismissError={dismissError}
						onError={setErrorMessage}
						onBeforeCheckout={draft.persistNow}
					/>
				</div>
			</PublicRouteContainer>
		</PublicRouteSection>
	);
}

function isStarterPreviewSection(sectionRow: StarterPreviewSectionRow) {
	return STARTER_PREVIEW_SECTION_IDS.some((id) => id === sectionRow.id);
}

function StarterPreviewPill({
	label,
	value,
}: {
	readonly label: string;
	readonly value: string;
}) {
	return (
		<div className="rounded-lg border border-border/70 bg-background/70 px-3 py-2">
			<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
				{label}
			</p>
			<p className="mt-1 text-sm font-medium leading-5 text-foreground">
				{value}
			</p>
		</div>
	);
}
