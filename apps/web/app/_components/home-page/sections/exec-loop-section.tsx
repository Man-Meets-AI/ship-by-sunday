"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { HomePageContent } from "@/app/_content/home-page";

import { ExecLoopVisual } from "./exec-loop/exec-loop-visual";
import { ScrollReveal } from "./scroll-reveal";

type ExecLoopSection = HomePageContent["execLoopSection"];

const workerMascots = [
	"/landing-page/mascot-blue.png",
	"/landing-page/mascot-orange.png",
	"/landing-page/mascot-purple.png",
	"/landing-page/mascot-teal.png",
] as const;

export function ExecLoopSectionBlock({
	execLoopSection,
}: {
	readonly execLoopSection: ExecLoopSection;
}) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const selectedStep = execLoopSection.steps[selectedIndex];

	return (
		<section className="py-24 lg:py-40">
			<div className="grid gap-14 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-center lg:gap-20">
				<ScrollReveal>
					<div className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
						<h2
							aria-label={execLoopSection.title}
							className="text-balance text-4xl leading-[0.92] tracking-tight sm:text-5xl lg:text-7xl"
						>
							<span className="font-heading-serif font-normal italic">
								How{" "}
							</span>
							<span className="font-sans font-semibold uppercase tracking-tight">
								Workers
							</span>
							<span className="font-heading-serif font-normal italic">
								{" "}
								Work.
							</span>
						</h2>
						<div className="overflow-hidden rounded-2xl border border-foreground/15 bg-foreground/5">
							{execLoopSection.steps.map((step, index) => {
								const isSelected = index === selectedIndex;
								const mascot = workerMascots[index];
								return (
									<button
										key={step.label}
										type="button"
										onClick={() => setSelectedIndex(index)}
										className={cn(
											"flex w-full items-center gap-4 px-4 py-4 text-left transition-colors",
											index > 0 && "border-t border-foreground/10",
											isSelected
												? "bg-foreground/[0.07]"
												: "hover:bg-foreground/[0.04]",
										)}
									>
										{mascot ? (
											<div className="shrink-0 overflow-hidden rounded-xl bg-foreground/[0.06] p-1 dark:bg-black/60">
												<Image
													src={mascot}
													alt={step.label}
													width={56}
													height={56}
													className="rounded-lg"
												/>
											</div>
										) : null}
										<div className="min-w-0 flex-1">
											<p className="text-base font-semibold text-foreground">
												{step.label}
											</p>
											<p className="text-sm text-muted-foreground">
												{step.description}
											</p>
										</div>
										{isSelected ? (
											<span className="shrink-0 text-sm text-muted-foreground">
												Selected
											</span>
										) : (
											<span className="shrink-0 rounded-lg border border-foreground/20 px-4 py-1.5 text-sm font-medium text-foreground">
												Select
											</span>
										)}
									</button>
								);
							})}
						</div>
					</div>
				</ScrollReveal>
				<ScrollReveal delay={0.12}>
					<div className="relative">
						<div className="aspect-[16/10] overflow-hidden rounded-lg border border-border/60 bg-background shadow-2xl shadow-foreground/5">
							<ExecLoopVisual
								steps={execLoopSection.steps}
								selectedIndex={selectedIndex}
							/>
						</div>
						{workerMascots[selectedIndex] ? (
							<Image
								src={workerMascots[selectedIndex]}
								alt={selectedStep?.label ?? ""}
								width={52}
								height={52}
								className="absolute right-0 bottom-full translate-y-2 drop-shadow-md"
							/>
						) : null}
					</div>
				</ScrollReveal>
			</div>
		</section>
	);
}
