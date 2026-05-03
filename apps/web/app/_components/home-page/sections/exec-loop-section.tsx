import type { HomePageContent } from "@/app/_content/home-page";

import { ExecLoopVisual } from "./exec-loop/exec-loop-visual";
import { ScrollReveal } from "./scroll-reveal";

type ExecLoopSection = HomePageContent["execLoopSection"];

export function ExecLoopSectionBlock({
	execLoopSection,
}: {
	readonly execLoopSection: ExecLoopSection;
}) {
	return (
		<section className="py-24 lg:py-40">
			<div className="grid gap-14 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-center lg:gap-20">
				<ScrollReveal>
					<div className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
						<div className="space-y-3">
							<h2 className="text-balance text-4xl font-semibold leading-[0.92] sm:text-5xl lg:text-7xl">
								{execLoopSection.title}
							</h2>
							<p className="max-w-md text-pretty text-lg leading-snug text-muted-foreground">
								{execLoopSection.intro}
							</p>
						</div>
						<ol className="space-y-3">
							{execLoopSection.steps.map((step, index) => (
								<li
									key={step.label}
									className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-t border-border/40 pt-3"
								>
									<span className="text-sm font-semibold text-muted-foreground">
										{index + 1}
									</span>
									<span>
										<span className="block text-base font-semibold text-foreground">
											{step.label}
										</span>
										<span className="mt-1 block text-sm leading-6 text-muted-foreground">
											{step.description}
										</span>
									</span>
								</li>
							))}
						</ol>
					</div>
				</ScrollReveal>
				<ScrollReveal delay={0.12}>
					<div className="aspect-[16/10] overflow-hidden rounded-lg border border-border/60 bg-background shadow-2xl shadow-foreground/5">
						<ExecLoopVisual steps={execLoopSection.steps} />
					</div>
				</ScrollReveal>
			</div>
		</section>
	);
}
