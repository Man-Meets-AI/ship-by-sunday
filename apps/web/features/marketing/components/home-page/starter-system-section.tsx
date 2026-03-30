"use client";

import type { HomePageContent } from "@/features/marketing/content/home";

import { ScrollReveal } from "./scroll-reveal";

type StarterSystemSection = HomePageContent["starterSystemSection"];
type StarterSystemCapability = StarterSystemSection["capabilities"][number];
type StarterSystemSupportSection = StarterSystemSection["supportSection"];

function StarterSystemCapabilityRow({
	capability,
	index,
}: {
	capability: StarterSystemCapability;
	index: number;
}) {
	return (
		<ScrollReveal delay={0.1 * index}>
			<article className="grid gap-4 border-t border-border/40 py-8 md:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] md:gap-10 lg:py-10">
				<h3 className="max-w-[14ch] text-[1.4rem] font-semibold leading-[1.05] tracking-tight text-foreground sm:text-[1.65rem]">
					{capability.title}
				</h3>
				<p className="max-w-[36ch] text-base leading-7 text-muted-foreground sm:text-lg">
					{capability.description}
				</p>
			</article>
		</ScrollReveal>
	);
}

function StarterSystemSupportBlock({
	supportSection,
}: {
	supportSection: StarterSystemSupportSection;
}) {
	return (
		<div className="grid gap-10 border-t border-border/40 pt-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24 lg:pt-16">
			<ScrollReveal>
				<div className="space-y-5">
					<h3 className="max-w-[16ch] text-balance text-[clamp(2.25rem,4vw,3.5rem)] font-semibold leading-[0.98] tracking-tight text-foreground">
						{supportSection.title}
					</h3>
					<p className="max-w-[38ch] text-base leading-7 text-muted-foreground sm:text-lg">
						{supportSection.intro}
					</p>
				</div>
			</ScrollReveal>
			<ScrollReveal delay={0.1}>
				<div className="space-y-8">
					<ul className="space-y-0">
						{supportSection.items.map((supportItem) => (
							<li
								key={supportItem}
								className="border-t border-border/30 py-4 text-lg font-medium leading-7 tracking-tight text-foreground/90 first:border-t-0 first:pt-0 sm:text-xl"
							>
								{supportItem}
							</li>
						))}
					</ul>
					<div className="space-y-3 border-t border-border/30 pt-6">
						<p className="text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
							{supportSection.bonus.title}
						</p>
						<p className="max-w-[38ch] text-base leading-7 text-muted-foreground">
							{supportSection.bonus.description}
						</p>
					</div>
				</div>
			</ScrollReveal>
		</div>
	);
}

export function StarterSystemSectionBlock({
	starterSystemSection,
}: {
	starterSystemSection: StarterSystemSection;
}) {
	return (
		<section className="py-24 lg:py-40">
			<div className="space-y-12 lg:space-y-16">
				<div className="grid gap-14 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-24">
					<ScrollReveal>
						<div className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
							<h2
								aria-label={starterSystemSection.title}
								className="text-[clamp(2.8rem,10vw,6.5rem)] font-semibold leading-[0.9] tracking-tight text-foreground"
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
							<p className="max-w-[42ch] text-base leading-7 text-muted-foreground sm:text-lg">
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
				<StarterSystemSupportBlock
					supportSection={starterSystemSection.supportSection}
				/>
			</div>
		</section>
	);
}
