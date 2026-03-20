import type { HomePageContent } from "@/features/marketing/content/home";

import {
	SectionGroupHeading,
	SectionLabel,
	SectionLead,
	SectionStack,
	SectionTitle,
} from "./section-shell";

type AudienceSection = HomePageContent["audienceSection"];
type MechanismSection = HomePageContent["mechanismSection"];

export function MechanismAudienceSection({
	audienceSection,
	mechanismSection,
}: {
	audienceSection: AudienceSection;
	mechanismSection: MechanismSection;
}) {
	return (
		<SectionStack className="gap-10">
			<div className="space-y-4">
				<SectionLabel>{mechanismSection.label}</SectionLabel>
				<SectionTitle>{mechanismSection.title}</SectionTitle>
				<SectionLead>{mechanismSection.intro}</SectionLead>
			</div>

			<div className="grid gap-12 lg:grid-cols-2 lg:gap-14">
				<div className="flex flex-col gap-4">
					{mechanismSection.cards.map((card) => (
						<div
							key={card.name}
							className="flex flex-col gap-3 rounded-lg bg-muted/15 px-4 py-5 sm:p-6"
						>
							<p className="text-lg font-semibold sm:text-xl">{card.name}</p>
							<p className="text-sm font-medium leading-snug text-foreground/90 sm:text-base">
								{card.prompt}
							</p>
							<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
								{card.description}
							</p>
						</div>
					))}
				</div>

				<div className="flex flex-col gap-6">
					<div className="space-y-3">
						<SectionGroupHeading>
							{audienceSection.titleLead}{" "}
							<span className="text-primary">
								{audienceSection.titleAccent}
							</span>
						</SectionGroupHeading>
						<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
							{audienceSection.intro}
						</p>
					</div>
					<div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
						{audienceSection.cards.map((card) => (
							<div
								key={card.title}
								className="space-y-2 border-l-2 border-primary/35 pl-4 sm:pl-5"
							>
								<p className="text-balance text-lg font-semibold leading-snug whitespace-pre-line sm:text-xl">
									{card.title}
								</p>
								<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
									{card.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			<p className="max-w-3xl border-t border-border/30 pt-8 text-base leading-relaxed text-foreground/90 sm:pt-10 sm:text-lg">
				{mechanismSection.footer}
			</p>
		</SectionStack>
	);
}
