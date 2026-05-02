"use client";

import type { HomePageContent } from "@/app/_content/home-page";
import { ScrollReveal } from "./scroll-reveal";

import FAQAccordion from "../faq-accordion";

type FAQSection = HomePageContent["faqSection"];

export function CommonQuestionsSection({
	faqSection,
}: {
	faqSection: FAQSection;
}) {
	return (
		<section className="border-t border-border/40 py-24 lg:py-40">
			<div className="grid gap-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
				<ScrollReveal>
					<div className="flex flex-col gap-3">
						<h2 className="flex flex-col gap-1 text-balance text-4xl font-semibold leading-[0.92] tracking-tight sm:text-5xl lg:text-7xl">
							<span>{faqSection.titleLead}</span>
							<span className="text-primary/90">{faqSection.titleAccent}</span>
						</h2>
						{faqSection.lead ? (
							<p className="max-w-xl text-pretty text-lg leading-snug text-muted-foreground sm:text-xl">
								{faqSection.lead}
							</p>
						) : null}
					</div>
				</ScrollReveal>
				<ScrollReveal delay={0.1}>
					<div className="divide-y divide-border/40 border-y border-border/40">
						<FAQAccordion items={faqSection.items} />
					</div>
				</ScrollReveal>
			</div>
		</section>
	);
}
