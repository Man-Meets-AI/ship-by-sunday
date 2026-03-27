"use client";

import { PointerHighlight } from "@/components/ui/pointer-highlight";
import { cn } from "@/lib/utils";
import type { HomePageContent } from "@/features/marketing/content/home";
import { SystemLoopPreview } from "./system-loop-preview";

type SprintPathSection = HomePageContent["sprintPathSection"];

export function SprintPathUnifiedSection({
	sprintPathSection,
}: {
	sprintPathSection: SprintPathSection;
}) {
	return (
		<section
			id="system"
			className="grid items-start gap-12 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20 lg:py-32"
		>
			<div className="flex flex-col gap-10">
				<div className="space-y-6">
					<h2 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
						{sprintPathSection.titlePrefix}
						<PointerHighlight containerClassName="inline-block text-primary/90">
							{sprintPathSection.titleHighlight}
						</PointerHighlight>
					</h2>
					<p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
						{sprintPathSection.intro}
					</p>
				</div>
				<div className="grid gap-6">
					{sprintPathSection.supportingPoints.map((point) => (
						<div
							key={point}
							className="group relative flex gap-4 transition-all duration-300"
						>
							<div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/40 group-hover:bg-primary group-hover:scale-125 transition-transform" />
							<p className="text-base leading-relaxed text-foreground/80 sm:text-lg">
								{point}
							</p>
						</div>
					))}
				</div>
				<div className="inline-flex items-center gap-3 rounded-2xl border border-primary/10 bg-primary/5 px-6 py-4">
					<div className="size-2 rounded-full bg-primary animate-pulse" />
					<p className="text-sm font-semibold tracking-wide text-primary uppercase italic">
						{sprintPathSection.valueFrame}
					</p>
				</div>
			</div>
			<div
				className={cn(
					"relative overflow-hidden rounded-[32px] border border-border/40 bg-muted/20 p-8 shadow-xl transition-all duration-700 hover:border-primary/20 lg:justify-self-end lg:p-12"
				)}
			>
				<SystemLoopPreview className="relative z-10 mx-auto w-full max-w-[38rem]" />
			</div>
		</section>
	);
}
