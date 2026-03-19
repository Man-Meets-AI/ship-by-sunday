import Image from "next/image";

import type { HomePageContent } from "@/features/marketing/content/home";

import FAQAccordion from "../faq-accordion";
import { SectionLabel, SectionStack } from "./section-shell";

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
		<>
			<div className="grid gap-10 py-10 sm:gap-12 sm:py-12 lg:grid-cols-[1.1fr_1fr]">
				<div className="flex flex-col gap-6">
					<SectionLabel>{proofSection.label}</SectionLabel>
					<ul className="space-y-4">
						{proofSection.points.map((point) => (
							<li
								key={point}
								className="text-base font-medium leading-relaxed sm:text-lg"
							>
								{point}
							</li>
						))}
					</ul>
					<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
						{proofSection.intro}
					</p>
				</div>
				<div className="flex flex-col gap-4">
					<div className="relative min-h-96 overflow-hidden rounded-xl">
						<Image
							src={proofImage}
							alt={proofSection.imageAlt}
							fill
							className="object-cover"
							sizes="(max-width: 1024px) 100vw, 40vw"
						/>
					</div>
					<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
						{proofSection.imageCaption}
					</p>
				</div>
			</div>
			<div className="grid gap-10 border-t border-border/30 py-10 sm:gap-12 sm:py-12 lg:grid-cols-[1.1fr_1fr]">
				<div className="max-w-2xl lg:max-w-none">
					<FAQAccordion items={faqSection.items} />
				</div>
				<SectionStack className="flex flex-col items-center justify-center py-0 text-center sm:py-0">
					<div>
						<SectionLabel>{faqSection.label}</SectionLabel>
						<h2 className="mt-3 font-marketing-display text-balance text-3xl uppercase tracking-marketing-section sm:text-5xl">
							{faqSection.titleLead}
							<span className="block">{faqSection.titleAccent}</span>
						</h2>
					</div>
				</SectionStack>
			</div>
		</>
	);
}
