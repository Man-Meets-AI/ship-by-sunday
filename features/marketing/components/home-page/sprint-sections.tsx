import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { HomePageContent } from "@/features/marketing/content/home";

import { SectionLabel, SectionStack } from "./section-shell";

type ProcessCallout = HomePageContent["processCallout"];
type SprintPathSection = HomePageContent["sprintPathSection"];

export function SprintOverviewSection({
	sprintPathSection,
}: {
	sprintPathSection: SprintPathSection;
}) {
	return (
		<SectionStack id="system" className="gap-8">
			<div className="space-y-3">
				<SectionLabel>{sprintPathSection.label}</SectionLabel>
				<h2 className="font-marketing-display max-w-4xl text-balance text-3xl uppercase tracking-marketing-section sm:text-5xl">
					{sprintPathSection.title}
				</h2>
				<p className="max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-xl">
					{sprintPathSection.intro}
				</p>
			</div>
			<div className="grid gap-4 lg:grid-cols-4">
				{sprintPathSection.blocks.map((block) => (
					<div
						key={block.name}
						className="flex min-h-72 flex-col justify-between gap-6 rounded-lg bg-muted/15 px-4 py-5 transition-colors hover:bg-muted/25"
					>
						<div className="flex items-start justify-between gap-3">
							<p className="text-2xl font-medium sm:text-3xl">{block.name}</p>
							<Badge variant="outline" className="shrink-0">
								{block.eyebrow}
							</Badge>
						</div>
						<div className="space-y-2 border-t border-border/60 pt-4">
							{block.hover.map((item) => (
								<p key={item} className="text-sm font-medium leading-relaxed">
									{item}
								</p>
							))}
						</div>
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							{sprintPathSection.cardHint}
						</p>
					</div>
				))}
			</div>
		</SectionStack>
	);
}

export function ProcessCalloutSection({
	processCallout,
}: {
	processCallout: ProcessCallout;
}) {
	return (
		<Card className="bg-muted/50 p-8 text-center sm:p-10">
			<h2 className="font-marketing-display text-balance text-3xl uppercase tracking-marketing-section sm:text-5xl">
				{processCallout.titleLead}
				<span className="block">{processCallout.titleAccent}</span>
			</h2>
			<p className="mx-auto mt-4 max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-xl">
				{processCallout.body}
			</p>
		</Card>
	);
}

export function SprintDeepDiveSection({
	sprintPathSection,
}: {
	sprintPathSection: SprintPathSection;
}) {
	return (
		<div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-8">
			<SectionStack className="py-0 sm:py-0 lg:sticky lg:top-4 lg:self-start">
				<div className="space-y-4">
					<SectionLabel>{sprintPathSection.deepDiveLabel}</SectionLabel>
					<h2 className="font-marketing-display text-balance text-3xl uppercase tracking-marketing-section sm:text-4xl">
						{sprintPathSection.deepDiveTitle}
					</h2>
					<p className="text-base leading-relaxed text-muted-foreground">
						{sprintPathSection.deepDiveIntro}
					</p>
				</div>
			</SectionStack>
			<div className="grid gap-0 divide-y divide-border/80">
				{sprintPathSection.blocks.map((block) => (
					<div
						key={block.name}
						className="grid gap-6 py-8 first:pt-0 last:pb-0 sm:py-10 lg:grid-cols-[minmax(0,11rem)_1fr]"
					>
						<div className="space-y-2">
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								{block.eyebrow}
							</p>
							<p className="text-2xl font-medium">{block.name}</p>
						</div>
						<div>
							<p className="text-xl font-medium leading-tight tracking-tight sm:text-3xl">
								{block.summary}
							</p>
							<p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
								{block.description}
							</p>
							<div className="mt-6 space-y-3 rounded-lg bg-muted/15 px-4 py-4">
								<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
									{sprintPathSection.outcomesLabel}
								</p>
								<ul className="flex flex-wrap gap-2">
									{block.artifact.map((item) => (
										<li
											key={item}
											className="max-w-full rounded-md border border-border/60 bg-background/80 px-3 py-1.5 text-left text-sm font-medium leading-snug text-foreground"
										>
											{item}
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
