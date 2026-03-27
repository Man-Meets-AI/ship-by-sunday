"use client";

import { PointerHighlight } from "@/components/ui/pointer-highlight";
import type { HomePageContent } from "@/features/marketing/content/home";

type StarterSystemSection = HomePageContent["starterSystemSection"];
type StarterSystemCard = StarterSystemSection["cards"][number];

const starterSystemHighlightStyle = {
	rectangle:
		"border-neutral-300 bg-neutral-200 leading-loose dark:border-neutral-600 dark:bg-neutral-700",
	pointer: "h-3 w-3 text-sky-500",
} as const;

function StarterSystemFeatureRow({ card }: { card: StarterSystemCard }) {
	return (
		<article className="group space-y-4 border-t border-border/40 py-10 transition-colors hover:bg-muted/10">
			<p className="text-sm font-bold tracking-wider text-primary/70 uppercase">
				{card.eyebrow}
			</p>
			<h3 className="text-2xl font-bold tracking-tight text-foreground/90 transition-transform duration-300 group-hover:translate-x-1">
				{card.title}
			</h3>
			<p className="max-w-2xl text-balance text-lg leading-snug text-foreground/80 sm:text-2xl">
				{card.highlightBefore}
				<PointerHighlight
					rectangleClassName={starterSystemHighlightStyle.rectangle}
					pointerClassName={starterSystemHighlightStyle.pointer}
					containerClassName="inline-block"
				>
					<span className="relative z-10 px-1 font-semibold text-foreground underline decoration-primary/30 decoration-4 underline-offset-4">
						{card.highlight}
					</span>
				</PointerHighlight>
				{card.highlightAfter}
			</p>
			<p className="max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
				{card.description}
			</p>
		</article>
	);
}

export function StarterSystemSectionBlock({
	starterSystemSection,
}: {
	starterSystemSection: StarterSystemSection;
}) {
	return (
		<section className="py-24 lg:py-40">
			<div className="grid gap-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
				<div className="space-y-12 lg:sticky lg:top-24 lg:h-fit">
					<div className="space-y-8">
						<p className="text-sm font-bold tracking-[0.2em] text-primary/80 uppercase">
							{starterSystemSection.label}
						</p>
						<h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
							{starterSystemSection.title}
						</h2>
						<p className="max-w-xl text-pretty text-xl leading-relaxed text-muted-foreground">
							{starterSystemSection.intro}
						</p>
					</div>

					<div className="space-y-8">
						<div className="space-y-4">
							<p className="text-sm font-semibold uppercase tracking-widest text-foreground/40">
								{starterSystemSection.supportLanesLabel}
							</p>
							<ul className="flex flex-wrap gap-3">
								{starterSystemSection.supportLanes.map((supportLane) => (
									<li
										key={supportLane}
										className="rounded-full border border-border/60 bg-muted/30 px-4 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:border-primary/30 hover:bg-primary/5"
									>
										{supportLane}
									</li>
								))}
							</ul>
						</div>

						<p className="max-w-sm text-sm leading-relaxed text-muted-foreground italic">
							{starterSystemSection.supportingProof}
						</p>

						<div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-8 shadow-sm">
							<div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-3xl" />
							<div className="relative z-10 space-y-4">
								<div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
									{starterSystemSection.bonus.label}
								</div>
								<p className="text-2xl font-bold tracking-tight text-foreground">
									{starterSystemSection.bonus.title}
								</p>
								<p className="text-sm leading-relaxed text-muted-foreground">
									{starterSystemSection.bonus.description}
								</p>
							</div>
						</div>
					</div>
				</div>
				<div className="flex flex-col border-b border-border/40">
					{starterSystemSection.cards.map((card) => (
						<StarterSystemFeatureRow key={card.title} card={card} />
					))}
				</div>
			</div>
		</section>
	);
}
