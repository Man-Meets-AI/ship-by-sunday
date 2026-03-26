"use client";

import { PointerHighlight } from "@/components/ui/pointer-highlight";
import type { HomePageContent } from "@/features/marketing/content/home";

import {
	HomePageSectionOverline,
	homePageQuietSurfaceClassName,
	homePageSectionClassName,
} from "./home-page-primitives";
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
			className={`grid items-start gap-10 ${homePageSectionClassName} lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-14`}
		>
			<div className="space-y-6">
				<HomePageSectionOverline>
					{sprintPathSection.label}
				</HomePageSectionOverline>
				<div className="space-y-4">
					<h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
						{sprintPathSection.titlePrefix}
						<PointerHighlight containerClassName="inline-block">
							{sprintPathSection.titleHighlight}
						</PointerHighlight>
					</h2>
					<p className="max-w-2xl text-pretty text-muted-foreground sm:text-lg">
						{sprintPathSection.intro}
					</p>
				</div>
				<div className="grid gap-0 border-t border-border/60">
					{sprintPathSection.supportingPoints.map((point, index) => (
						<div
							key={point}
							className="grid gap-3 border-b border-border/60 py-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-4"
						>
							<p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
								0{index + 1}
							</p>
							<p className="text-sm leading-relaxed text-foreground/90 sm:text-base">
								{point}
							</p>
						</div>
					))}
				</div>
				<p className="max-w-2xl text-sm font-medium text-foreground/75 sm:text-base">
					{sprintPathSection.valueFrame}
				</p>
			</div>
			<div
				className={`relative overflow-hidden p-5 sm:p-6 lg:justify-self-end ${homePageQuietSurfaceClassName}`}
			>
				<div className="mb-5 flex items-center justify-between gap-4 border-b border-border/60 pb-3">
					<p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
						Shared system
					</p>
					<p className="text-xs text-muted-foreground">
						Files, not stale chats
					</p>
				</div>
				<SystemLoopPreview className="mx-auto w-full max-w-[34rem]" />
			</div>
		</section>
	);
}
