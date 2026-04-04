"use client";

import { PointerHighlight } from "@/components/ui/pointer-highlight";
import type { HomePageContent } from "@/features/marketing/content/home";
import { ScrollReveal } from "./scroll-reveal";

type WhatsInsideSection = HomePageContent["whatsInsideSection"];
type Pillar = WhatsInsideSection["pillars"][number];

const pillarHighlightStyle = {
	rectangle:
		"border-neutral-300 bg-neutral-200 dark:border-neutral-600 dark:bg-neutral-700",
	pointer: "h-3 w-3 text-sky-500",
} as const;

function PillarRow({ pillar, index }: { pillar: Pillar; index: number }) {
	return (
		<ScrollReveal delay={0.1 * index}>
			<li className="group space-y-4 border-t border-border/40 py-10">
				<h3 className="text-2xl font-bold tracking-tight text-foreground/90 transition-transform duration-300 group-hover:translate-x-1">
					{pillar.title}
				</h3>
				<div className="space-y-6">
					<p className="max-w-3xl text-balance text-lg leading-7 text-foreground/80 sm:text-2xl">
						{pillar.highlightBefore}
						<PointerHighlight
							rectangleClassName={pillarHighlightStyle.rectangle}
							pointerClassName={pillarHighlightStyle.pointer}
							containerClassName="inline-block"
						>
							<span className="relative z-10 px-1 font-semibold text-foreground underline decoration-primary/30 decoration-4 underline-offset-4">
								{pillar.highlight}
							</span>
						</PointerHighlight>
						{pillar.highlightAfter}
					</p>
					<p className="max-w-2xl text-base leading-7 text-muted-foreground lg:text-lg">
						{pillar.supporting}
					</p>
				</div>
			</li>
		</ScrollReveal>
	);
}

export function WhatsInsideSection({
	whatsInsideSection,
}: {
	whatsInsideSection: WhatsInsideSection;
}) {
	return (
		<section id="deliverables" className="py-24 lg:py-40">
			<div className="grid gap-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
				<ScrollReveal>
					<div className="space-y-8 lg:sticky lg:top-24 lg:h-fit">
						<h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
							{whatsInsideSection.title}
						</h2>
						<p className="max-w-xl text-pretty text-xl leading-7 text-muted-foreground">
							{whatsInsideSection.intro}
						</p>
					</div>
				</ScrollReveal>
				<ol className="flex flex-col border-b border-border/40">
					{whatsInsideSection.pillars.map((pillar, i) => (
						<PillarRow key={pillar.title} pillar={pillar} index={i} />
					))}
				</ol>
			</div>
		</section>
	);
}
