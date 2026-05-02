"use client";

import type { HomePageContent } from "@/app/_content/home-page";
import { ScrollReveal } from "./scroll-reveal";

type DurabilitySection = HomePageContent["durabilitySection"];

export function DurabilitySectionBlock({
	durabilitySection,
}: {
	durabilitySection: DurabilitySection;
}) {
	return (
		<section className="border-t border-border/40 py-20 lg:py-32">
			<div className="grid gap-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
				<ScrollReveal>
					<div className="space-y-3 lg:sticky lg:top-24 lg:h-fit">
						<h2 className="text-balance text-4xl font-semibold leading-[0.92] tracking-tight sm:text-5xl lg:text-7xl">
							{durabilitySection.title}
						</h2>
						<p className="max-w-xl text-pretty text-lg leading-snug text-muted-foreground sm:text-xl">
							{durabilitySection.intro}
						</p>
					</div>
				</ScrollReveal>
				<div className="flex flex-col">
					{durabilitySection.items.map((item, i) => (
						<ScrollReveal key={item.title} delay={0.1 * i}>
							<article className="border-t border-border/40 py-8">
								<div className="space-y-1.5">
									<h3 className="text-lg font-bold tracking-tight text-foreground/90">
										{item.title}
									</h3>
									<p className="text-base leading-snug text-muted-foreground">
										{item.description}
									</p>
								</div>
							</article>
						</ScrollReveal>
					))}
				</div>
			</div>
			<ScrollReveal delay={0.3}>
				<div className="mt-12 border-t border-border/40 pt-8">
					<p className="max-w-3xl text-pretty text-base leading-snug text-muted-foreground">
						{durabilitySection.closing}
					</p>
				</div>
			</ScrollReveal>
		</section>
	);
}
