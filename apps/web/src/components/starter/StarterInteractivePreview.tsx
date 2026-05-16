"use client";

import { WandSparkles } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { buildCodebaseDemoSidebarProgress } from "@/app/_components/home-page/sections/codebase-demo/codebase-demo-sidebar-progress";
import { useHomePageCodebaseDraft } from "@/app/_components/home-page/sections/codebase-demo/use-home-page-codebase-draft";
import {
	PublicRouteContainer,
	PublicRouteEyebrow,
	PublicRouteIcon,
	PublicRouteSection,
	PublicRouteSectionTitle,
} from "@/components/layout/public-route-surface";

import { StarterPreviewControls } from "./StarterPreviewControls";
import { StarterPreviewCheckoutBar } from "./StarterPreviewCheckoutBar";
import { StarterPreviewLivePanel } from "./StarterPreviewLivePanel";
import { StarterPreviewPill } from "./StarterPreviewPill";
import { StarterPreviewProgressRail } from "./StarterPreviewProgressRail";
import type {
	StarterPreviewSection,
	StarterPreviewSectionRow,
} from "./StarterPreviewTypes";

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
	const generatedPreviewSection =
		previewSections.find(
			(sectionRow) => sectionRow.id === "generated-preview",
		) ?? null;
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
			<PublicRouteContainer className="grid min-w-0 gap-8 py-14">
				<div className="grid min-w-0 gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
					<div className="min-w-0">
						<PublicRouteIcon>
							<WandSparkles className="size-5" aria-hidden />
						</PublicRouteIcon>
						<PublicRouteEyebrow className="mt-5">
							Starter preview
						</PublicRouteEyebrow>
						<PublicRouteSectionTitle>
							Turn the idea into repo-ready facts.
						</PublicRouteSectionTitle>
						<p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
							Shape the product, design direction, and pricing assumption in a
							compact pass. Starter saves the draft locally so the protected
							workspace can pick up where this preview leaves off.
						</p>
						<div className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
							<StarterPreviewPill label="Idea" value="Product facts" />
							<StarterPreviewPill label="Design" value="Visual DNA" />
							<StarterPreviewPill
								label="Repo"
								value="Unlocked after checkout"
							/>
						</div>
					</div>
					<StarterPreviewLivePanel
						section={section}
						draft={draft}
						offerPriceDisplay={offerPriceDisplay}
					/>
				</div>
				<div className="grid min-w-0 gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
					<div className="min-w-0 lg:sticky lg:top-24">
						<StarterPreviewProgressRail
							sections={previewSections}
							progress={sidebarProgress}
						/>
					</div>
					<div className="min-w-0 space-y-4">
						<StarterPreviewControls
							section={section}
							draft={draft}
							generatedPreviewSection={generatedPreviewSection}
						/>
					</div>
				</div>
				<div className="grid min-w-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
					<div aria-hidden="true" />
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
