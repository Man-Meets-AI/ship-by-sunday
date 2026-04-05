"use client";

import Image from "next/image";

import type { HomePageContent } from "@/features/marketing/content/home";
import { ScrollReveal } from "./scroll-reveal";

type SocialProofSectionContent = HomePageContent["socialProofSection"];

export function SocialProofSection({
	socialProofSection,
}: {
	socialProofSection: SocialProofSectionContent;
}) {
	return (
		<section className="border-t border-border/40 py-24 lg:py-40">
			<div className="grid gap-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
				<ScrollReveal>
					<div className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
						<h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
							{socialProofSection.headline}
						</h2>
						<p className="max-w-xl text-pretty text-lg leading-7 text-muted-foreground sm:text-xl">
							{socialProofSection.body}
						</p>
					</div>
				</ScrollReveal>

				<div className="grid gap-6 sm:grid-cols-3">
					{socialProofSection.screenshots.map((screenshot, i) => (
						<ScrollReveal key={screenshot.alt} delay={0.1 * i}>
							<div className="overflow-hidden rounded-xl border border-border/40 bg-muted/30">
								<div className="relative aspect-[4/3]">
									<Image
										src={screenshot.src}
										alt={screenshot.alt}
										fill
										className="object-cover"
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
									/>
								</div>
							</div>
						</ScrollReveal>
					))}
				</div>
			</div>
		</section>
	);
}
