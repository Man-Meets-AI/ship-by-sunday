"use client";

import { useRef, useState } from "react";
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
	const figureRef = useRef<HTMLElement>(null);
	const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

	function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
		const rect = figureRef.current?.getBoundingClientRect();
		if (!rect) return;
		setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
	}

	const revealMask = cursor
		? `radial-gradient(circle 80px at ${cursor.x}px ${cursor.y}px, black 30%, transparent 75%)`
		: undefined;

	return (
		<figure
			ref={figureRef}
			className="relative aspect-square w-full max-w-xs cursor-crosshair overflow-hidden rounded-2xl border border-border/50 bg-muted sm:max-w-sm lg:ml-auto"
			onMouseMove={handleMouseMove}
			onMouseLeave={() => setCursor(null)}
		>
			{/* Grayscale base */}
			<img
				alt={portrait.alt}
				className="h-full w-full object-cover grayscale contrast-125 saturate-0"
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
			{/* Color reveal — spotlight masked to cursor position */}
			<img
				alt=""
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-150"
				style={
					revealMask
						? { maskImage: revealMask, WebkitMaskImage: revealMask, opacity: 1 }
						: { opacity: 0 }
				}
				decoding="async"
				src={portrait.src}
			/>
		</figure>
	);
}
