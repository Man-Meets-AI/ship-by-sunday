import type { HomePageContent } from "@/app/_content/home-page";
import { ScrollReveal } from "./scroll-reveal";

type SocialProofSectionContent = HomePageContent["socialProofSection"];

export function SocialProofSection({
	socialProofSection,
}: {
	socialProofSection: SocialProofSectionContent;
}) {
	return (
		<section className="border-t border-border/40 py-24 lg:py-40">
			<div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(18rem,0.55fr)] lg:items-center">
				<ScrollReveal>
					<div className="max-w-3xl space-y-2">
						<h2 className="leading-none">
							<span className="block font-heading-serif text-xl font-normal italic text-foreground/60 sm:text-2xl lg:text-3xl">
								{socialProofSection.heading.eyebrow}
							</span>
							<span className="block font-home-inter text-4xl font-bold leading-[0.9] sm:text-5xl lg:text-7xl">
								{socialProofSection.heading.title}
							</span>
							<span className="block font-home-inter mt-1 text-xl font-normal text-foreground/70 sm:text-2xl lg:text-3xl">
								{socialProofSection.heading.tail}
							</span>
						</h2>
						<p className="max-w-2xl text-pretty text-lg leading-snug text-muted-foreground sm:text-xl">
							{socialProofSection.body}
						</p>
					</div>
				</ScrollReveal>
				<ScrollReveal>
					<DitheredFounderPortrait portrait={socialProofSection.portrait} />
				</ScrollReveal>
			</div>
		</section>
	);
}

function DitheredFounderPortrait({
	portrait,
}: {
	portrait: SocialProofSectionContent["portrait"];
}) {
	return (
		<figure className="group relative aspect-square w-full max-w-xs overflow-hidden rounded-2xl border border-border/50 bg-muted sm:max-w-sm lg:ml-auto">
			<img
				alt={portrait.alt}
				className="h-full w-full object-cover grayscale saturate-0 contrast-125 transition-[filter] duration-200 ease-out group-hover:grayscale-0 group-hover:saturate-100 group-hover:contrast-100"
				decoding="async"
				loading="lazy"
				src={portrait.src}
			/>
			{/* Dithering overlays */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 opacity-35 mix-blend-multiply"
				style={{
					backgroundImage:
						"radial-gradient(circle at center, rgba(0, 0, 0, 0.9) 0 0.7px, transparent 0.8px)",
					backgroundSize: "4px 4px",
				}}
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),rgba(0,0,0,0.24))] mix-blend-soft-light"
			/>
		</figure>
	);
}
