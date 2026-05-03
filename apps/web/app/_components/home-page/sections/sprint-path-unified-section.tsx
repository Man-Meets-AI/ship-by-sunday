"use client";

import { ArrowRight } from "lucide-react";

import type { HomePageContent } from "@/app/_content/home-page";
import { ScrollReveal } from "./scroll-reveal";

type SprintPathSection = HomePageContent["sprintPathSection"];
type MechanismSection = HomePageContent["mechanismSection"];

export function SprintPathUnifiedSection({
	sprintPathSection,
	mechanismSection,
}: {
	sprintPathSection: SprintPathSection;
	mechanismSection?: MechanismSection;
}) {
	return (
		<section id="system" className="py-24 lg:py-40">
			<div className="mx-auto flex max-w-4xl flex-col gap-10">
				<ScrollReveal>
					<div className="space-y-3">
						<h2
							aria-label="Exec Loops: OpenAI's Weapon of choice"
							className="leading-none"
						>
							<span className="block font-heading-serif text-3xl font-normal italic leading-tight sm:text-4xl lg:text-5xl">
								Exec Loops:
							</span>
							<span className="font-home-inter mt-1 block text-sm font-normal uppercase tracking-[0.14em] text-foreground/60 sm:text-base lg:text-lg">
								OpenAI&apos;s
							</span>
							<span className="block font-heading-serif text-5xl font-normal uppercase leading-[0.85] sm:text-6xl lg:text-8xl">
								Weapon
							</span>
							<span className="font-home-inter mt-1 block text-2xl font-normal text-foreground/80 sm:text-3xl lg:mt-2 lg:text-4xl">
								of choice
							</span>
						</h2>
						<p className="max-w-xl text-pretty text-lg leading-snug text-muted-foreground sm:text-xl">
							{sprintPathSection.intro}
						</p>
					</div>
				</ScrollReveal>
				<div className="grid gap-6">
					{sprintPathSection.supportingPoints.map((point, i) => (
						<ScrollReveal key={point} delay={0.08 * (i + 1)}>
							<div className="group relative flex gap-4 motion-safe:transition-all motion-safe:duration-300">
								<div className="mt-2.5 size-1.5 shrink-0 rounded-full bg-foreground/40 group-hover:bg-foreground motion-safe:transition-transform motion-safe:group-hover:scale-125" />
								<p className="text-base leading-7 text-foreground/80 sm:text-lg">
									{point}
								</p>
							</div>
						</ScrollReveal>
					))}
				</div>
				{mechanismSection ? (
					<ScrollReveal delay={0.4}>
						<div className="flex flex-col items-center gap-6 border-t border-border/40 pt-8">
							<ol
								aria-label="Mechanism steps"
								className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-0"
							>
								{mechanismSection.steps.map((step, i) => (
									<li key={step} className="flex items-center gap-4">
										<div className="flex items-center gap-3">
											<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-sm font-semibold text-foreground">
												{i + 1}
											</span>
											<span className="text-base font-medium leading-tight text-foreground sm:text-lg">
												{step}
											</span>
										</div>
										{i < mechanismSection.steps.length - 1 ? (
											<ArrowRight
												aria-hidden="true"
												className="hidden size-4 shrink-0 text-muted-foreground/50 sm:block"
											/>
										) : null}
									</li>
								))}
							</ol>
							<p className="text-base font-medium text-muted-foreground">
								{mechanismSection.tagline}
							</p>
						</div>
					</ScrollReveal>
				) : null}
			</div>
		</section>
	);
}
