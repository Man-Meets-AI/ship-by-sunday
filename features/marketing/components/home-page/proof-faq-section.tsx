import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import type { HomePageContent } from "@/features/marketing/content/home";

import FAQAccordion from "../faq-accordion";

type FAQSection = HomePageContent["faqSection"];
type ProofSection = HomePageContent["proofSection"];

export function FounderProofSection({
	proofImage,
	proofSection,
}: {
	proofImage: HomePageContent["assets"]["proofImage"];
	proofSection: ProofSection;
}) {
	return (
		<section className="grid gap-10 border-t py-10 sm:gap-12 sm:py-12">
			<div className="space-y-4">
				<Badge variant="outline">{proofSection.label}</Badge>
				<p className="max-w-2xl text-muted-foreground sm:text-lg">
					{proofSection.intro}
				</p>
			</div>

			<div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-14">
				<div className="space-y-4">
					<ul className="space-y-3">
						{proofSection.points.map((point) => (
							<li key={point} className="text-sm font-medium sm:text-base">
								{point}
							</li>
						))}
					</ul>
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
					<p className="text-xs text-muted-foreground sm:text-sm">
						{proofSection.imageCaption}
					</p>
				</div>
			</div>
		</section>
	);
}

export function CommonQuestionsSection({
	faqSection,
}: {
	faqSection: FAQSection;
}) {
	return (
		<section className="grid gap-10 border-t py-10 sm:gap-12 sm:py-12">
			<div className="space-y-4">
				<Badge variant="outline">{faqSection.label}</Badge>
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

			<FAQAccordion items={faqSection.items} />
		</section>
	);
}
