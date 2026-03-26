"use client";

import { PointerHighlight } from "@/components/ui/pointer-highlight";
import type { HomePageContent } from "@/features/marketing/content/home";

import {
	HomePageSectionOverline,
	homePageQuietSurfaceClassName,
	homePageSectionClassName,
} from "./home-page-primitives";

type StarterSystemSection = HomePageContent["starterSystemSection"];
type StarterSystemCard = StarterSystemSection["cards"][number];

const starterSystemHighlightStyle = {
	rectangle:
		"border-neutral-300 bg-neutral-200 leading-loose dark:border-neutral-600 dark:bg-neutral-700",
	pointer: "h-3 w-3 text-sky-500",
} as const;

function StarterSystemFeatureRow({
	card,
	index,
}: {
	card: StarterSystemCard;
	index: number;
}) {
	return (
		<article className="grid gap-4 border-t border-border/60 py-5 sm:grid-cols-[minmax(0,0.28fr)_minmax(0,0.72fr)] sm:gap-6">
			<div className="space-y-3">
				<p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
					0{index + 1}
				</p>
				<p className="text-sm font-medium text-foreground/80">{card.eyebrow}</p>
			</div>
			<div className="space-y-3">
				<h3 className="text-xl font-semibold tracking-tight">{card.title}</h3>
				<p className="text-sm leading-relaxed text-foreground/90 sm:text-base">
					{card.highlightBefore}
					<PointerHighlight
						rectangleClassName={starterSystemHighlightStyle.rectangle}
						pointerClassName={starterSystemHighlightStyle.pointer}
						containerClassName="inline-block"
					>
						<span className="relative z-10">{card.highlight}</span>
					</PointerHighlight>
					{card.highlightAfter}
				</p>
				<p className="text-sm leading-relaxed text-muted-foreground">
					{card.description}
				</p>
			</div>
		</article>
	);
}

export function StarterSystemSectionBlock({
	starterSystemSection,
}: {
	starterSystemSection: StarterSystemSection;
}) {
	return (
		<section className={`grid gap-8 ${homePageSectionClassName} sm:gap-10`}>
			<div className="grid gap-10 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:gap-12">
				<div className="space-y-6">
					<HomePageSectionOverline>
						{starterSystemSection.label}
					</HomePageSectionOverline>
					<div className="space-y-4">
						<h2 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
							{starterSystemSection.title}
						</h2>
						<p className="max-w-3xl text-pretty text-muted-foreground sm:text-lg">
							{starterSystemSection.intro}
						</p>
					</div>
					<div
						className={`space-y-4 p-5 sm:p-6 ${homePageQuietSurfaceClassName}`}
					>
						<div className="space-y-3">
							<p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
								{starterSystemSection.supportLanesLabel}
							</p>
							<p className="text-sm leading-relaxed text-foreground/90 sm:text-base">
								{starterSystemSection.supportLanesIntro}
							</p>
						</div>
						<ul className="flex flex-wrap gap-x-5 gap-y-3 border-t border-border/60 pt-4">
							{starterSystemSection.supportLanes.map((supportLane) => (
								<li
									key={supportLane}
									className="flex items-center gap-2 text-sm font-medium text-foreground/82"
								>
									<span className="size-1.5 rounded-full bg-foreground/50" />
									<span>{supportLane}</span>
								</li>
							))}
						</ul>
						<p className="border-t border-border/60 pt-4 text-sm leading-relaxed text-muted-foreground">
							{starterSystemSection.supportingProof}
						</p>
						<div className="border-t border-border/60 pt-4">
							<p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
								{starterSystemSection.bonus.label}
							</p>
							<p className="mt-2 text-base font-semibold text-foreground">
								{starterSystemSection.bonus.title}
							</p>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								{starterSystemSection.bonus.description}
							</p>
						</div>
					</div>
				</div>
				<div className="grid gap-0">
					{starterSystemSection.cards.map((card, index) => (
						<StarterSystemFeatureRow
							key={card.title}
							card={card}
							index={index}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
