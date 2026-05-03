import type { HomePageContent } from "@/app/_content/home-page";

import { BlueprintDemoDesignCard } from "./blueprint-demo-design-card";
import { BlueprintDemoFoundationCard } from "./blueprint-demo-foundation-card";
import { BlueprintDemoLockedCard } from "./blueprint-demo-locked-card";
import { BlueprintDemoPricingCard } from "./blueprint-demo-pricing-card";
import type { useHomePageBlueprintDraft } from "./use-home-page-blueprint-draft";

type BlueprintDemoSection = HomePageContent["productPreviewSection"];
type BlueprintDemoSectionRow = BlueprintDemoSection["sections"][number];
type BlueprintDemoDraft = ReturnType<typeof useHomePageBlueprintDraft>;

export function BlueprintDemoCard({
	section,
	sectionRow,
	sectionNumber,
	draft,
}: {
	readonly section: BlueprintDemoSection;
	readonly sectionRow: BlueprintDemoSectionRow;
	readonly sectionNumber: number;
	readonly draft: BlueprintDemoDraft;
}) {
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
}
