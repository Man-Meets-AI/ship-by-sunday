"use client";

import type { HomePageContent } from "@/features/marketing/content/home";

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
				<p className="mt-2 max-w-[38ch] text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base">
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
					<div className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
						<h2
							aria-label={starterSystemSection.title}
							className="text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[0.95] tracking-tight text-foreground"
						>
							{starterSystemSection.titleLines.map((titleLine, index) => (
								<span
									key={titleLine}
									className={index === 0 ? "block" : "mt-2 block sm:mt-3"}
								>
									{titleLine}
								</span>
							))}
						</h2>
						<p className="max-w-[38ch] text-base leading-7 text-muted-foreground sm:text-lg">
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
