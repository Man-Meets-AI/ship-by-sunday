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
} from "@/components/layout/public-route-surface";

import { StarterPreviewControls } from "./StarterPreviewControls";
import { StarterPreviewCheckoutBar } from "./StarterPreviewCheckoutBar";
import { StarterPreviewLivePanel } from "./StarterPreviewLivePanel";
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
			<PublicRouteContainer className="py-10 sm:py-12">
				<div className="overflow-hidden rounded-lg border border-border/70 bg-card text-card-foreground shadow-xs/5">
					<div className="border-b border-border/60 bg-background/80 px-4 py-4 sm:px-5">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							<div className="flex min-w-0 items-start gap-3">
								<PublicRouteIcon className="size-8 shrink-0">
									<WandSparkles className="size-4" aria-hidden />
								</PublicRouteIcon>
								<div className="min-w-0">
									<PublicRouteEyebrow>Starter preview</PublicRouteEyebrow>
									<h2 className="mt-1 text-xl font-semibold leading-tight text-foreground sm:text-2xl">
										Make the brief before checkout.
									</h2>
									<p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
										Edit the source facts Starter saves locally, then carry them
										into the protected workspace after Stripe.
									</p>
								</div>
							</div>
							<div className="grid gap-2 text-xs sm:grid-cols-3 lg:min-w-[25rem]">
								<WorkbenchStat label="Idea" value="Product facts" />
								<WorkbenchStat label="Design" value="Visual DNA" />
								<WorkbenchStat label="Repo" value="Post-checkout" />
							</div>
						</div>
					</div>
					<div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
						<div className="order-2 min-w-0 space-y-4 bg-background p-4 sm:p-5 lg:order-1">
							<StarterPreviewControls
								section={section}
								draft={draft}
								generatedPreviewSection={generatedPreviewSection}
							/>
							<StarterPreviewProgressRail
								sections={previewSections}
								progress={sidebarProgress}
							/>
						</div>
						<div className="order-1 border-b border-border/60 bg-muted/20 p-4 sm:p-5 lg:order-2 lg:border-b-0 lg:border-l">
							<StarterPreviewLivePanel
								section={section}
								draft={draft}
								offerPriceDisplay={offerPriceDisplay}
							/>
						</div>
						<div className="order-3 border-t border-border/60 bg-background p-4 sm:p-5 lg:col-span-2">
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
					</div>
				</div>
			</PublicRouteContainer>
		</PublicRouteSection>
	);
}

function WorkbenchStat({
	label,
	value,
}: {
	readonly label: string;
	readonly value: string;
}) {
	return (
		<div className="rounded-lg border border-border/70 bg-card px-3 py-2">
			<p className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
				{label}
			</p>
			<p className="mt-0.5 truncate font-medium text-foreground">{value}</p>
		</div>
	);
}

function isStarterPreviewSection(sectionRow: StarterPreviewSectionRow) {
	return STARTER_PREVIEW_SECTION_IDS.some((id) => id === sectionRow.id);
}
