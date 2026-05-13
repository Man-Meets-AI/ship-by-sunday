"use client";

import type { HomePageContent } from "@/app/_content/home-page";

import { ScrollReveal } from "./scroll-reveal";

type StarterSystemSection = HomePageContent["starterSystemSection"];
type StarterSystemCapability = StarterSystemSection["capabilities"][number];

function StarterSystemCapabilityRow({
	capability,
	index,
}: {
	capability: StarterSystemCapability;
	index: number;
}) {
	return (
		<ScrollReveal delay={0.08 * index}>
			<article className="group relative border-t border-border/40 py-7 pl-4 before:absolute before:inset-y-3 before:left-0 before:w-px before:bg-foreground/0 motion-safe:before:transition-colors motion-safe:before:duration-500 motion-safe:hover:before:bg-foreground/30 lg:py-8">
				<h3 className="text-[1.15rem] font-semibold leading-tight tracking-tight text-foreground sm:text-[1.3rem]">
					{capability.title}
				</h3>
				<p className="mt-1.5 max-w-[38ch] text-[0.95rem] leading-snug text-muted-foreground sm:text-base">
					{capability.description}
				</p>
			</article>
		</ScrollReveal>
	);
}

export function StarterSystemSectionBlock({
	starterSystemSection,
}: {
	starterSystemSection: StarterSystemSection;
}) {
	return (
		<section className="py-24 lg:py-40">
			<div className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:gap-20">
				<ScrollReveal>
					<div className="lg:sticky lg:top-24 lg:h-fit">
						<h2
							aria-label={starterSystemSection.heading.ariaLabel}
							className="leading-none"
						>
							<span className="block font-heading-serif text-[clamp(2rem,5vw,3.25rem)] font-normal italic leading-[0.9]">
								{starterSystemSection.heading.lead}
							</span>
							<span className="block font-home-inter mt-1 text-base font-normal text-foreground/60 sm:text-lg">
								{starterSystemSection.heading.detailLead}
							</span>
							<span className="block font-home-inter font-normal text-foreground/60 text-base sm:text-lg">
								{starterSystemSection.heading.detailTail}
							</span>
						</h2>
					</div>
				</ScrollReveal>
				<div className="border-b border-border/40">
					{starterSystemSection.capabilities.map((capability, index) => (
						<StarterSystemCapabilityRow
							key={capability.title}
							capability={capability}
							index={index}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
