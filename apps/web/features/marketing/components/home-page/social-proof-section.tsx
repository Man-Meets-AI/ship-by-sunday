"use client";

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
			<div className="max-w-3xl">
				<ScrollReveal>
					<div className="space-y-6">
						<h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
							{socialProofSection.headline}
						</h2>
						<p className="max-w-2xl text-pretty text-lg leading-7 text-muted-foreground sm:text-xl">
							{socialProofSection.body}
						</p>
					</div>
				</ScrollReveal>
			</div>
		</section>
	);
}
