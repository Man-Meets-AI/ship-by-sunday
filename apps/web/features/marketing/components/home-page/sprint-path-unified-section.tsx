"use client";

import { ArrowRight } from "lucide-react";

import { PointerHighlight } from "@/components/ui/pointer-highlight";
import type { HomePageContent } from "@/features/marketing/content/home";
import { ScrollReveal } from "./scroll-reveal";

type SprintPathSection = HomePageContent["sprintPathSection"];
type MechanismSection = HomePageContent["mechanismSection"];

export function SprintPathUnifiedSection({
	sprintPathSection,
	mechanismSection,
}: {
	sprintPathSection: SprintPathSection;
	mechanismSection?: MechanismSection;
}) {
	return (
		<section id="system" className="py-20 lg:py-32">
			<div className="mx-auto flex max-w-4xl flex-col gap-10">
				<ScrollReveal>
					<div className="space-y-6">
						<h2 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
							{sprintPathSection.titlePrefix}
							<PointerHighlight containerClassName="text-primary/90">
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
								<div className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary/40 transition-transform group-hover:scale-125 group-hover:bg-primary" />
								<p className="text-base leading-7 text-foreground/80 sm:text-lg">
									{point}
								</p>
							</div>
						</ScrollReveal>
					))}
				</div>
				{mechanismSection ? (
					<ScrollReveal delay={0.4}>
						<div className="flex flex-col items-center gap-10 border-t border-border/40 pt-10">
							<ol className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-0">
								{mechanismSection.steps.map((step, i) => (
									<li key={step} className="flex items-center gap-4">
										<div className="flex items-center gap-3">
											<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
												{i + 1}
											</span>
											<span className="text-base font-medium leading-tight text-foreground sm:text-lg">
												{step}
											</span>
										</div>
										{i < mechanismSection.steps.length - 1 ? (
											<ArrowRight className="hidden size-4 shrink-0 text-muted-foreground/50 sm:block" />
										) : null}
									</li>
								))}
							</ol>
							<p className="text-base font-medium text-muted-foreground">
								{mechanismSection.tagline}
							</p>
						</div>
					</ScrollReveal>
				) : null}
			</div>
		</section>
	);
}
