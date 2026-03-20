import Image from "next/image";

import type { HomePageContent } from "@/features/marketing/content/home";

import FAQAccordion from "../faq-accordion";
import {
	SectionGroupHeading,
	SectionLabel,
	SectionLead,
	SectionStack,
	SectionTitle,
} from "./section-shell";

type FAQSection = HomePageContent["faqSection"];
type ProofSection = HomePageContent["proofSection"];

export function ProofAndFaqSection({
	faqSection,
	proofImage,
	proofSection,
}: {
	faqSection: FAQSection;
	proofImage: HomePageContent["assets"]["proofImage"];
	proofSection: ProofSection;
}) {
	return (
		<SectionStack className="gap-10 border-t border-border/30 py-10 sm:gap-12 sm:py-12">
			<div className="space-y-4">
				<SectionLabel>{faqSection.label}</SectionLabel>
				<SectionTitle>
					{faqSection.titleLead}
					<span className="block">{faqSection.titleAccent}</span>
				</SectionTitle>
				<SectionLead className="max-w-2xl">{faqSection.lead}</SectionLead>
			</div>

			<div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-14">
				<div className="flex flex-col gap-6">
					<div className="space-y-4">
						<SectionGroupHeading>{proofSection.label}</SectionGroupHeading>
						<ul className="space-y-3">
							{proofSection.points.map((point) => (
								<li
									key={point}
									className="text-sm font-medium leading-relaxed sm:text-base"
								>
									{point}
								</li>
							))}
						</ul>
						<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
							{proofSection.intro}
						</p>
					</div>
					<div className="flex flex-col gap-3">
						<div className="relative min-h-64 overflow-hidden rounded-xl sm:min-h-80">
							<Image
								src={proofImage}
								alt={proofSection.imageAlt}
								fill
								className="object-cover"
								sizes="(max-width: 1024px) 100vw, 45vw"
							/>
						</div>
						<p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
							{proofSection.imageCaption}
						</p>
					</div>
				</div>

				<div>
					<FAQAccordion items={faqSection.items} />
				</div>
			</div>
		</SectionStack>
	);
}
