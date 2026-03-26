import type { HomePageContent } from "@/features/marketing/content/home";

import FAQAccordion from "../faq-accordion";
import {
	HomePageSectionOverline,
	homePageSectionClassName,
} from "./home-page-primitives";

type FAQSection = HomePageContent["faqSection"];

export function CommonQuestionsSection({
	faqSection,
}: {
	faqSection: FAQSection;
}) {
	return (
		<section
			className={`grid gap-8 ${homePageSectionClassName} lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-12`}
		>
			<div className="space-y-5">
				<HomePageSectionOverline>{faqSection.label}</HomePageSectionOverline>
				<div className="space-y-4">
					<h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
						{faqSection.titleLead}
						<span className="block">{faqSection.titleAccent}</span>
					</h2>
					{faqSection.lead ? (
						<p className="max-w-2xl text-muted-foreground sm:text-lg">
							{faqSection.lead}
						</p>
					) : null}
				</div>
				<p className="max-w-sm border-t border-border/60 pt-4 text-sm leading-relaxed text-muted-foreground">
					{faqSection.items.length} buyer objections to clear before the close.
				</p>
			</div>
			<FAQAccordion items={faqSection.items} />
		</section>
	);
}
