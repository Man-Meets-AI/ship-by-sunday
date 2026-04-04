"use client";

import { ArrowRight } from "lucide-react";

import type { HomePageContent } from "@/features/marketing/content/home";
import { ScrollReveal } from "./scroll-reveal";

type MechanismSection = HomePageContent["mechanismSection"];

export function MechanismStripSection({
	mechanismSection,
}: {
	mechanismSection: MechanismSection;
}) {
	return (
		<section className="border-t border-border/40 py-16 lg:py-24">
			<ScrollReveal>
				<div className="mx-auto flex max-w-4xl flex-col items-center gap-10">
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
		</section>
	);
}
