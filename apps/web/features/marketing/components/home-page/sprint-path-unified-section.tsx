"use client";

import { Check } from "lucide-react";
import Image from "next/image";

import { PointerHighlight } from "@/components/ui/pointer-highlight";
import type { HomePageContent } from "@/features/marketing/content/home";

type SprintPathSection = HomePageContent["sprintPathSection"];

export function SprintPathUnifiedSection({
	sprintPathSection,
}: {
	sprintPathSection: SprintPathSection;
}) {
	return (
		<section
			id="system"
			className="grid items-center gap-10 py-8 sm:py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12"
		>
			<div className="space-y-6">
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
				<div className="grid gap-3">
					{sprintPathSection.supportingPoints.map((point) => (
						<div key={point} className="flex items-start gap-3">
							<Check className="mt-1 size-4 shrink-0 text-primary" />
							<p className="text-sm text-foreground/90 sm:text-base">{point}</p>
						</div>
					))}
				</div>
				<p className="max-w-2xl text-sm font-medium text-muted-foreground sm:text-base">
					{sprintPathSection.valueFrame}
				</p>
			</div>
			<div className="relative lg:justify-self-end">
				<Image
					src="/4-block-system.svg"
					alt="The 4-Block System — CEO, Design, Build, Ship"
					width={604}
					height={682}
					sizes="(min-width: 1024px) 28rem, 100vw"
					className="mx-auto block w-full max-w-md dark:hidden"
				/>
				<Image
					src="/4-block-dark-mode.svg"
					alt="The 4-Block System — CEO, Design, Build, Ship"
					width={604}
					height={682}
					sizes="(min-width: 1024px) 28rem, 100vw"
					className="mx-auto hidden w-full max-w-md dark:block"
				/>
			</div>
		</section>
	);
}
