"use client";

import type { HomePageContent } from "@/app/_content/home-page";
import { ScrollReveal } from "./scroll-reveal";

type SocialProofSectionContent = HomePageContent["socialProofSection"];

export function SocialProofSection({
	socialProofSection,
}: {
	socialProofSection: SocialProofSectionContent;
}) {
	return (
		<section className="border-t border-border/40 py-24 lg:py-40">
			<div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(18rem,0.55fr)] lg:items-center">
				<ScrollReveal>
					<div className="max-w-3xl space-y-6">
						<h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
							{socialProofSection.headline}
						</h2>
						<p className="max-w-2xl text-pretty text-lg leading-7 text-muted-foreground sm:text-xl">
							{socialProofSection.body}
						</p>
					</div>
				</ScrollReveal>
				<ScrollReveal>
					<DitheredFounderPortrait portrait={socialProofSection.portrait} />
				</ScrollReveal>
			</div>
		</section>
	);
}

function DitheredFounderPortrait({
	portrait,
}: {
	portrait: SocialProofSectionContent["portrait"];
}) {
	return (
		<figure className="relative aspect-square w-full max-w-xs overflow-hidden rounded-2xl border border-border/50 bg-muted sm:max-w-sm lg:ml-auto">
			<img
				alt={portrait.alt}
				className="h-full w-full object-cover grayscale contrast-125 saturate-0"
				decoding="async"
				loading="lazy"
				src={portrait.src}
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 opacity-35 mix-blend-multiply"
				style={{
					backgroundImage:
						"radial-gradient(circle at center, rgba(0, 0, 0, 0.9) 0 0.7px, transparent 0.8px)",
					backgroundSize: "4px 4px",
				}}
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),rgba(0,0,0,0.24))] mix-blend-soft-light"
			/>
		</figure>
	);
}
