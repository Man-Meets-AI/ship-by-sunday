"use client";

import { PointerHighlight } from "@/components/ui/pointer-highlight";
import type { HomePageContent } from "@/features/marketing/content/home";
import { ScrollReveal } from "./scroll-reveal";

type SprintPathSection = HomePageContent["sprintPathSection"];

export function SprintPathUnifiedSection({
	sprintPathSection,
}: {
	sprintPathSection: SprintPathSection;
}) {
	return (
		<section id="system" className="py-20 lg:py-32">
			<div className="mx-auto flex max-w-4xl flex-col gap-10">
				<ScrollReveal>
					<div className="space-y-6">
						<h2 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
							{sprintPathSection.titlePrefix}
							<PointerHighlight containerClassName="inline-block text-primary/90">
								{sprintPathSection.titleHighlight}
							</PointerHighlight>
						</h2>
						<p className="max-w-xl text-pretty text-lg leading-7 text-muted-foreground sm:text-xl">
							{sprintPathSection.intro}
						</p>
					</div>
				</ScrollReveal>
				<div className="grid gap-6">
					{sprintPathSection.supportingPoints.map((point, i) => (
						<ScrollReveal key={point} delay={0.08 * (i + 1)}>
							<div className="group relative flex gap-4 transition-all duration-300">
								<div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/40 transition-transform group-hover:scale-125 group-hover:bg-primary" />
								<p className="text-base leading-7 text-foreground/80 sm:text-lg">
									{point}
								</p>
							</div>
						</ScrollReveal>
					))}
				</div>
				<ScrollReveal delay={0.3}>
					<div className="border-t border-border/40 pt-6">
						<p className="max-w-2xl text-sm font-medium leading-7 text-foreground/70">
							{sprintPathSection.valueFrame}
						</p>
					</div>
				</ScrollReveal>
			</div>
		</section>
	);
}
