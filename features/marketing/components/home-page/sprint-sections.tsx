import type { HomePageContent } from "@/features/marketing/content/home";
import {
	publicDividerGridClassName,
	PublicSurfaceCard,
} from "@/shared/ui/public-surface";

import { SectionFrame, SectionLabel } from "./section-shell";

type ProcessCallout = HomePageContent["processCallout"];
type SprintPathSection = HomePageContent["sprintPathSection"];

export function SprintOverviewSection({
	sprintPathSection,
}: {
	sprintPathSection: SprintPathSection;
}) {
	return (
		<SectionFrame id="system" className="relative overflow-hidden">
			<div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-product-border/20 lg:block" />
			<SectionLabel>{sprintPathSection.label}</SectionLabel>
			<div className="mt-3 max-w-4xl">
				<h2 className="font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
					{sprintPathSection.title}
				</h2>
				<p className="mt-3 max-w-3xl text-pretty text-base font-medium leading-relaxed text-product-muted sm:text-xl">
					{sprintPathSection.intro}
				</p>
			</div>
			<div className={`mt-8 ${publicDividerGridClassName} lg:grid-cols-4`}>
				{sprintPathSection.blocks.map((block) => (
					<article
						key={block.name}
						className="group flex min-h-[18rem] flex-col justify-between bg-product-surface p-5 transition-colors duration-200 lg:hover:bg-product-accent lg:hover:text-product-bg"
					>
						<div className="flex items-center justify-between gap-3">
							<span className="font-display text-[2rem] uppercase leading-none transition-colors duration-200 sm:text-3xl lg:group-hover:text-product-bg">
								{block.name}
							</span>
							<span className="text-sm font-light text-product-muted transition-colors duration-200 lg:group-hover:text-product-bg/70">
								{block.eyebrow}
							</span>
						</div>
						<div className="mt-6 space-y-2 border-t border-product-border/30 pt-4 transition-colors duration-200 lg:border-transparent lg:pt-8 lg:group-hover:border-product-bg/25">
							{block.hover.map((item) => (
								<p
									key={item}
									className="font-sans text-base font-medium text-product-text transition-all duration-200 lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-hover:text-product-bg"
								>
									{item}
								</p>
							))}
						</div>
						<p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-product-muted transition-colors duration-200 lg:group-hover:text-product-bg/60">
							{sprintPathSection.cardHint}
						</p>
					</article>
				))}
			</div>
		</SectionFrame>
	);
}

export function ProcessCalloutSection({
	processCallout,
}: {
	processCallout: ProcessCallout;
}) {
	return (
		<PublicSurfaceCard className="bg-product-accent px-6 py-10 text-center text-product-bg">
			<h2 className="font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
				{processCallout.titleLead}
				<span className="block">{processCallout.titleAccent}</span>
			</h2>
			<p className="mx-auto mt-4 max-w-3xl text-pretty text-base leading-relaxed text-product-bg/80 sm:text-xl">
				{processCallout.body}
			</p>
		</PublicSurfaceCard>
	);
}

export function SprintDeepDiveSection({
	sprintPathSection,
}: {
	sprintPathSection: SprintPathSection;
}) {
	return (
		<div className="grid gap-4 lg:grid-cols-[320px_1fr]">
			<SectionFrame className="lg:sticky lg:top-4 lg:self-start">
				<SectionLabel>{sprintPathSection.deepDiveLabel}</SectionLabel>
				<h2 className="mt-4 font-display text-[2.8rem] uppercase leading-[0.82] tracking-[-0.04em] sm:text-[3.6rem]">
					{sprintPathSection.deepDiveTitle}
				</h2>
				<p className="mt-4 text-base leading-relaxed text-product-muted">
					{sprintPathSection.deepDiveIntro}
				</p>
			</SectionFrame>
			<div className={publicDividerGridClassName}>
				{sprintPathSection.blocks.map((block) => (
					<SectionFrame
						key={block.name}
						className="bg-product-surface/78 shadow-none"
					>
						<div className="grid gap-6 lg:grid-cols-[180px_1fr]">
							<div className="border border-product-border/60 bg-product-surface/78 p-4">
								<p className="text-sm font-light text-product-muted">
									{block.eyebrow}
								</p>
								<h3 className="mt-2 font-display text-[2.8rem] uppercase leading-none tracking-[-0.04em]">
									{block.name}
								</h3>
							</div>
							<div>
								<p className="text-xl font-medium leading-tight text-product-text sm:text-4xl">
									{block.summary}
								</p>
								<p className="mt-4 max-w-3xl text-base leading-relaxed text-product-muted sm:text-lg">
									{block.description}
								</p>
								<div className="mt-6 border border-product-border/60">
									<div className="border-b border-product-border/60 bg-product-surface/78 px-4 py-3 text-xs font-bold uppercase tracking-[0.24em] text-product-muted">
										{sprintPathSection.outcomesLabel}
									</div>
									<div className="grid gap-[1px] bg-product-border/35 md:grid-cols-2">
										{block.artifact.map((item) => (
											<div
												key={item}
												className="bg-product-surface/78 px-4 py-5 text-sm font-black uppercase tracking-[0.06em] text-product-text sm:text-base"
											>
												{item}
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</SectionFrame>
				))}
			</div>
		</div>
	);
}
