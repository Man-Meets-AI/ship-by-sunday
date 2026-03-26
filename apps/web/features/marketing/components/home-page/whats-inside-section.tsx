"use client";

import { PointerHighlight } from "@/components/ui/pointer-highlight";
import type { HomePageContent } from "@/features/marketing/content/home";

import {
	HomePageSectionOverline,
	homePageSectionClassName,
} from "./home-page-primitives";

type WhatsInsideSection = HomePageContent["whatsInsideSection"];
type Pillar = WhatsInsideSection["pillars"][number];

const pillarHighlightStyle = {
	rectangle:
		"border-neutral-300 bg-neutral-200 leading-loose dark:border-neutral-600 dark:bg-neutral-700",
	pointer: "h-3 w-3 text-sky-500",
} as const;

function PillarRow({ pillar, index }: { pillar: Pillar; index: number }) {
	return (
		<li className="grid gap-4 border-t border-border/60 py-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6">
			<div className="space-y-3">
				<p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
					0{index + 1}
				</p>
				<div className="h-px w-12 bg-border/70" />
			</div>
			<div className="space-y-3">
				<h3 className="text-xl font-semibold tracking-tight">{pillar.title}</h3>
				<p className="max-w-2xl text-sm leading-relaxed text-foreground/90 sm:text-base">
					{pillar.highlightBefore}
					<PointerHighlight
						rectangleClassName={pillarHighlightStyle.rectangle}
						pointerClassName={pillarHighlightStyle.pointer}
						containerClassName="inline-block"
					>
						<span className="relative z-10">{pillar.highlight}</span>
					</PointerHighlight>
					{pillar.highlightAfter}
				</p>
				<p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
					{pillar.supporting}
				</p>
			</div>
		</li>
	);
}

export function WhatsInsideSection({
	whatsInsideSection,
}: {
	whatsInsideSection: WhatsInsideSection;
}) {
	return (
		<section className={homePageSectionClassName}>
			<div className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-12">
				<div className="space-y-5">
					<HomePageSectionOverline>
						{whatsInsideSection.label}
					</HomePageSectionOverline>
					<div className="space-y-4">
						<h2 className="max-w-xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
							{whatsInsideSection.title}
						</h2>
						<p className="max-w-lg text-pretty text-muted-foreground sm:text-lg">
							{whatsInsideSection.intro}
						</p>
					</div>
					<div className="max-w-md border-t border-border/60 pt-4">
						<p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
							Three deliverables
						</p>
						<div className="mt-3 flex items-end gap-3">
							<span className="text-5xl font-semibold tracking-tight sm:text-6xl">
								3
							</span>
							<p className="pb-1 text-sm leading-relaxed text-muted-foreground">
								The minimum set of artifacts needed to move from clarity to
								execution without rebuilding the context from scratch.
							</p>
						</div>
					</div>
				</div>
				<ol className="grid gap-0">
					{whatsInsideSection.pillars.map((pillar, index) => (
						<PillarRow key={pillar.title} pillar={pillar} index={index} />
					))}
				</ol>
			</div>
		</section>
	);
}
