"use client";

import { Badge } from "@/components/ui/badge";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
import type { HomePageContent } from "@/features/marketing/content/home";

type WhatsInsideSection = HomePageContent["whatsInsideSection"];
type Pillar = WhatsInsideSection["pillars"][number];

const HIGHLIGHT_STYLES = [
	{
		rectangle:
			"bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 leading-loose",
		pointer: "text-yellow-500 h-3 w-3",
	},
	{
		rectangle:
			"bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 leading-loose",
		pointer: "text-blue-500 h-3 w-3",
	},
	{
		rectangle:
			"bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 leading-loose",
		pointer: "text-green-500 h-3 w-3",
	},
] as const;

function PillarCard({ pillar, index }: { pillar: Pillar; index: number }) {
	const style = HIGHLIGHT_STYLES[index % HIGHLIGHT_STYLES.length];

	return (
		<div className="space-y-4 rounded-lg border border-border/80 bg-muted/40 p-5 sm:p-6">
			<div className="aspect-video w-full rounded-lg bg-muted/60 border border-border/60" />
			<h3 className="text-base font-semibold tracking-tight sm:text-lg">
				{pillar.title}
			</h3>
			<p className="text-sm leading-relaxed text-foreground/90 sm:text-base">
				{pillar.highlightBefore}
				<PointerHighlight
					rectangleClassName={style.rectangle}
					pointerClassName={style.pointer}
					containerClassName="inline-block"
				>
					<span className="relative z-10">{pillar.highlight}</span>
				</PointerHighlight>
				{pillar.highlightAfter}
			</p>
			<p className="text-xs text-muted-foreground sm:text-sm">
				{pillar.supporting}
			</p>
		</div>
	);
}

export function WhatsInsideSection({
	whatsInsideSection,
}: {
	whatsInsideSection: WhatsInsideSection;
}) {
	return (
		<section className="grid gap-8 border-t py-10 sm:gap-10 sm:py-12">
			<div className="space-y-4">
				<Badge variant="outline">{whatsInsideSection.label}</Badge>
				<h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
					{whatsInsideSection.title}
				</h2>
				<p className="max-w-2xl text-pretty text-muted-foreground sm:text-lg">
					{whatsInsideSection.intro}
				</p>
			</div>
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{whatsInsideSection.pillars.map((pillar, index) => (
					<PillarCard key={pillar.title} pillar={pillar} index={index} />
				))}
			</div>
		</section>
	);
}
