"use client";

import type { HomePageContent } from "@/features/marketing/content/home";
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
					<div className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
						<h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
							{durabilitySection.title}
						</h2>
						<p className="max-w-xl text-pretty text-xl leading-7 text-muted-foreground">
							{durabilitySection.intro}
						</p>
					</div>
				</ScrollReveal>
				<div className="flex flex-col">
					{durabilitySection.items.map((item, i) => (
						<ScrollReveal key={item.title} delay={0.1 * i}>
							<article className="grid gap-4 border-t border-border/40 py-8 md:grid-cols-[minmax(0,0.18fr)_minmax(0,0.82fr)] md:gap-8">
								<p className="font-marketing-display text-2xl font-black leading-none text-foreground/70">
									{String(i + 1).padStart(2, "0")}
								</p>
								<div className="space-y-2">
									<p className="text-lg font-bold tracking-tight text-foreground/90">
										{item.title}
									</p>
									<p className="text-base leading-7 text-muted-foreground">
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
					<p className="max-w-3xl text-balance text-base leading-7 text-muted-foreground">
						{durabilitySection.closing}
					</p>
				</div>
			</ScrollReveal>
		</section>
	);
}
