import type { HomePageContent } from "@/features/marketing/content/home";

import FAQAccordion from "../faq-accordion";

type FAQSection = HomePageContent["faqSection"];

export function CommonQuestionsSection({
	faqSection,
}: {
	faqSection: FAQSection;
}) {
	return (
		<section className="py-24 lg:py-40 border-t border-border/40">
			<div className="grid gap-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
				<div className="space-y-8">
					<p className="text-sm font-bold tracking-[0.2em] text-primary/80 uppercase">
						{faqSection.label}
					</p>
					<h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
						{faqSection.titleLead}
						<span className="block text-primary/90">{faqSection.titleAccent}</span>
					</h2>
					{faqSection.lead ? (
						<p className="max-w-xl text-pretty text-xl leading-relaxed text-muted-foreground">
							{faqSection.lead}
						</p>
					) : null}
				</div>
				<div className="divide-y divide-border/40 border-y border-border/40">
					<FAQAccordion items={faqSection.items} />
				</div>
			</div>
		</section>
	);
}
