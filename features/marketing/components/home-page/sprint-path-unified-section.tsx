import type { HomePageContent } from "@/features/marketing/content/home";

import { SprintPathBlocksAccordion } from "./sprint-path-blocks-accordion";
import {
	SectionLabel,
	SectionLead,
	SectionStack,
	SectionTitle,
} from "./section-shell";

type SprintPathSection = HomePageContent["sprintPathSection"];

export function SprintPathUnifiedSection({
	sprintPathSection,
}: {
	sprintPathSection: SprintPathSection;
}) {
	return (
		<SectionStack id="system" className="gap-8">
			<div className="space-y-4">
				<SectionLabel>{sprintPathSection.label}</SectionLabel>
				<SectionTitle>{sprintPathSection.title}</SectionTitle>
				<SectionLead>{sprintPathSection.intro}</SectionLead>
			</div>
			<SprintPathBlocksAccordion
				blocks={sprintPathSection.blocks}
				outcomesLabel={sprintPathSection.outcomesLabel}
			/>
		</SectionStack>
	);
}
