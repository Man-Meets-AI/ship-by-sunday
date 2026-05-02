import type { HomePageContent } from "@/app/_content/home-page";

import { ScrollReveal } from "./scroll-reveal";

type ExecLoopSection = HomePageContent["execLoopSection"];
type ExecLoopStep = ExecLoopSection["steps"][number];

// Position classes per step. Wider margin from the central puck on the smallest
// viewports prevents label overlap inside the aspect-[16/10] frame at 360-390px;
// the original 13%/17%/83%/84% layout returns at the `sm:` breakpoint and up.
const stepPositionClassNames = [
	"top-[6%] left-1/2 sm:top-[13%]",
	"top-1/2 left-[88%] sm:left-[83%]",
	"top-[94%] left-1/2 sm:top-[84%]",
	"top-1/2 left-[12%] sm:left-[17%]",
] as const;

function ExecLoopVisual({
	steps,
}: {
	readonly steps: readonly ExecLoopStep[];
}) {
	return (
		<div
			className="relative flex size-full min-h-[18rem] items-center justify-center overflow-hidden bg-background text-foreground"
			aria-label="Animated exec loop showing decision, brief, run, and review stages"
		>
			<style>
				{`
					@keyframes exec-loop-orbit {
						from { transform: rotate(0deg); }
						to { transform: rotate(360deg); }
					}

					@keyframes exec-loop-pulse {
						0%, 100% { transform: translateX(-50%) scale(0.92); }
						45% { transform: translateX(-50%) scale(1.08); }
					}

					@media (prefers-reduced-motion: reduce) {
						.exec-loop-orbit,
						.exec-loop-pulse {
							animation: none !important;
						}
					}
				`}
			</style>
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08),transparent_52%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_52%)]" />
			<svg
				viewBox="0 0 100 100"
				className="absolute inset-[10%] size-[80%]"
				aria-hidden="true"
			>
				<circle
					cx="50"
					cy="50"
					r="35"
					fill="none"
					stroke="currentColor"
					strokeDasharray="2 7"
					strokeLinecap="round"
					strokeWidth="0.9"
					className="text-foreground/25"
				/>
				<circle
					cx="50"
					cy="50"
					r="35"
					fill="none"
					stroke="currentColor"
					strokeDasharray="68 152"
					strokeLinecap="round"
					strokeWidth="1.4"
					className="text-foreground/70"
					transform="rotate(-90 50 50)"
				/>
			</svg>
			<div
				className="exec-loop-orbit absolute inset-[15%]"
				style={{ animation: "exec-loop-orbit 8s linear infinite" }}
				aria-hidden="true"
			>
				<div
					className="exec-loop-pulse absolute top-0 left-1/2 z-20 size-5 rounded-full border border-background bg-foreground shadow-xl shadow-foreground/20"
					style={{ animation: "exec-loop-pulse 2s ease-in-out infinite" }}
				/>
			</div>
			<div className="relative z-10 flex size-32 flex-col items-center justify-center rounded-full border border-border/70 bg-background/90 p-4 text-center shadow-2xl shadow-foreground/5 sm:size-40 sm:p-5">
				<p className="text-lg font-semibold leading-tight sm:text-xl">
					Decide to review
				</p>
				<p className="mt-1.5 text-[0.7rem] leading-snug text-muted-foreground sm:text-xs sm:leading-5">
					Decision, brief, run, review.
				</p>
			</div>
			{steps.map((step, index) => (
				<div
					key={step.label}
					className={`absolute z-10 w-20 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-foreground/15 bg-background/95 p-3 shadow-sm sm:w-28 lg:w-36 ${
						stepPositionClassNames[index % stepPositionClassNames.length]
					}`}
				>
					<p className="text-xs font-semibold text-muted-foreground">
						{String(index + 1).padStart(2, "0")}
					</p>
					<p className="mt-1 text-sm font-semibold leading-tight sm:text-base">
						{step.label}
					</p>
				</div>
			))}
		</div>
	);
}

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
