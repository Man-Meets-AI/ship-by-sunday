import type { HomePageContent } from "@/features/marketing/content/home";

import {
	HomePageSectionOverline,
	homePageSectionClassName,
} from "./home-page-primitives";

type DurabilitySection = HomePageContent["durabilitySection"];

export function DurabilitySectionBlock({
	durabilitySection,
}: {
	durabilitySection: DurabilitySection;
}) {
	return (
		<section className={`grid gap-8 ${homePageSectionClassName} sm:gap-10`}>
			<div className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-8">
				<div className="space-y-4">
					<HomePageSectionOverline>
						{durabilitySection.label}
					</HomePageSectionOverline>
					<h2 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
						{durabilitySection.title}
					</h2>
				</div>
				<p className="max-w-2xl text-pretty text-muted-foreground sm:text-lg">
					{durabilitySection.intro}
				</p>
			</div>
			<div className="grid gap-0 border-t border-border/60 md:grid-cols-3 md:gap-6">
				{durabilitySection.items.map((item) => (
					<article
						key={item.title}
						className="space-y-3 border-b border-border/60 py-5"
					>
						<h3 className="text-lg font-semibold tracking-tight">
							{item.title}
						</h3>
						<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
							{item.description}
						</p>
					</article>
				))}
			</div>
			<p className="max-w-3xl border-t border-border/60 pt-4 text-sm leading-relaxed text-foreground/82 sm:text-base">
				{durabilitySection.closing}
			</p>
		</section>
	);
}
