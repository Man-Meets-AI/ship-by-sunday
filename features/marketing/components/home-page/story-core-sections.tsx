import type { HomePageContent } from "@/features/marketing/content/home";

import { SectionLabel, SectionStack } from "./section-shell";

type AudienceSection = HomePageContent["audienceSection"];
type MechanismSection = HomePageContent["mechanismSection"];

export function MechanismStorySection({
	mechanismSection,
}: {
	mechanismSection: MechanismSection;
}) {
	return (
		<SectionStack className="gap-8">
			<div className="space-y-3">
				<SectionLabel>{mechanismSection.label}</SectionLabel>
				<h2 className="font-marketing-display max-w-4xl text-balance text-3xl uppercase tracking-marketing-section sm:text-5xl">
					{mechanismSection.title}
				</h2>
				<p className="max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-xl">
					{mechanismSection.intro}
				</p>
			</div>
			<div className="grid gap-4 lg:grid-cols-3">
				{mechanismSection.cards.map((card) => (
					<div
						key={card.name}
						className="flex flex-col gap-4 rounded-lg bg-muted/15 px-4 py-5 sm:p-6"
					>
						<p className="text-2xl font-medium sm:text-[2rem]">{card.name}</p>
						<p className="text-base font-medium leading-snug sm:text-lg">
							{card.prompt}
						</p>
						<p className="text-base leading-relaxed text-muted-foreground">
							{card.description}
						</p>
					</div>
				))}
			</div>
			<p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
				{mechanismSection.footer}
			</p>
		</SectionStack>
	);
}

export function AudienceFitSection({
	audienceSection,
}: {
	audienceSection: AudienceSection;
}) {
	return (
		<SectionStack className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-8">
			<div className="space-y-2">
				<h2 className="font-marketing-display text-balance text-3xl uppercase tracking-marketing-section sm:text-5xl">
					{audienceSection.titleLead}
					<span className="mt-1 block text-primary">
						{audienceSection.titleAccent}
					</span>
				</h2>
			</div>
			<div className="flex items-end">
				<p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
					{audienceSection.intro}
				</p>
			</div>
			<div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:col-span-2">
				{audienceSection.cards.map((card) => (
					<div
						key={card.title}
						className="space-y-2.5 border-l-2 border-primary/35 pl-5"
					>
						<p className="text-balance text-2xl font-medium leading-[1.15] tracking-tight whitespace-pre-line sm:text-[2rem] sm:leading-[1.12]">
							{card.title}
						</p>
						<p className="text-base leading-snug text-muted-foreground">
							{card.description}
						</p>
					</div>
				))}
			</div>
		</SectionStack>
	);
}
