import type { HomePageContent } from "@/app/_content/home-page";

import { CodebaseDemoDesignCard } from "./codebase-demo-design-card";
import { CodebaseDemoFoundationCard } from "./codebase-demo-foundation-card";
import { CodebaseDemoLockedCard } from "./codebase-demo-locked-card";
import { CodebaseDemoPricingCard } from "./codebase-demo-pricing-card";
import type { useHomePageCodebaseDraft } from "./use-home-page-codebase-draft";

type CodebaseDemoSection = HomePageContent["productPreviewSection"];
type CodebaseDemoSectionRow = CodebaseDemoSection["sections"][number];
type CodebaseDemoDraft = ReturnType<typeof useHomePageCodebaseDraft>;

export function CodebaseDemoCard({
	section,
	sectionRow,
	sectionNumber,
	draft,
}: {
	readonly section: CodebaseDemoSection;
	readonly sectionRow: CodebaseDemoSectionRow;
	readonly sectionNumber: number;
	readonly draft: CodebaseDemoDraft;
}) {
	if (sectionRow.id === "foundation") {
		return (
			<CodebaseDemoFoundationCard
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
			<CodebaseDemoDesignCard
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
			<CodebaseDemoPricingCard
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
		<CodebaseDemoLockedCard
			sectionId={sectionRow.id}
			sectionNumber={sectionNumber}
			label={sectionRow.label}
			description={sectionRow.description}
		/>
	);
}
