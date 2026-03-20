import type { HomePageContent } from "@/features/marketing/content/home";

import {
	SectionGroupHeading,
	SectionLabel,
	SectionLead,
	SectionStack,
	SectionTitle,
} from "./section-shell";

type Outcomes = HomePageContent["outcomesSection"];
type ProblemOutcome = HomePageContent["problemOutcomeSection"];
type WhyStuck = HomePageContent["whyBuildersGetStuck"];

export function ProblemOutcomeSection({
	outcomesSection,
	problemOutcomeSection,
	whyBuildersGetStuck,
}: {
	outcomesSection: Outcomes;
	problemOutcomeSection: ProblemOutcome;
	whyBuildersGetStuck: WhyStuck;
}) {
	return (
		<SectionStack withTopRule className="gap-10 sm:gap-12">
			<div className="space-y-4">
				<SectionLabel>{problemOutcomeSection.label}</SectionLabel>
				<SectionTitle>{problemOutcomeSection.title}</SectionTitle>
				<SectionLead>{outcomesSection.intro}</SectionLead>
			</div>

			<div className="space-y-5">
				<div className="space-y-2">
					<SectionGroupHeading>{whyBuildersGetStuck.title}</SectionGroupHeading>
					<p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
						{whyBuildersGetStuck.intro}
					</p>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{whyBuildersGetStuck.cards.map((card) => (
						<div
							key={card.title}
							className="flex flex-col gap-3 rounded-lg bg-muted/15 px-4 py-5"
						>
							<p className="text-lg font-semibold leading-snug sm:text-xl">
								{card.title}
							</p>
							<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
								{card.description}
							</p>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-5 border-t border-border/30 pt-10 sm:pt-12">
				<SectionGroupHeading>{outcomesSection.title}</SectionGroupHeading>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{outcomesSection.items.map((item) => (
						<div
							key={item}
							className="flex min-h-32 flex-col justify-end rounded-lg bg-muted/15 px-4 py-5"
						>
							<p className="text-base font-semibold leading-snug sm:text-lg">
								{item}
							</p>
						</div>
					))}
				</div>
			</div>
		</SectionStack>
	);
}
