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
			<article className="border-t border-border/40 py-7 lg:py-8">
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
					<div className="space-y-3 lg:sticky lg:top-24 lg:h-fit">
						<h2
							aria-label={starterSystemSection.title}
							className="flex flex-col gap-1 text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[0.9] tracking-tight text-foreground"
						>
							{starterSystemSection.titleLines.map((titleLine) => (
								<span key={titleLine} className="block">
									{titleLine}
								</span>
							))}
						</h2>
						<p className="max-w-[38ch] text-base leading-snug text-muted-foreground sm:text-lg">
							{starterSystemSection.intro}
						</p>
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
