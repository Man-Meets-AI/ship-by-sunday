"use client";

import { type HomePageCtaTarget } from "@/config/product";
import type { HomePageContent } from "@/app/_content/home-page";

import { HeroAtmosphere } from "./hero-atmosphere";
import { HomeHeroHeadline } from "./home-hero-headline";
import { HomeHeroTopBar } from "./home-hero-top-bar";
import { HomePagePrimaryCta } from "./home-page-primary-cta";
import { HomePageSecondaryLink } from "./home-page-primitives";
import { ScrollReveal } from "./scroll-reveal";

type Hero = HomePageContent["hero"];

export function HomeHeroSection({
	hero,
	primaryCtaTarget,
	variant = "lead",
}: {
	hero: Hero;
	primaryCtaTarget: HomePageCtaTarget;
	variant?: "lead" | "supporting";
}) {
	const isLead = variant === "lead";

	return (
		<section className="relative flex w-full flex-col items-center border-t border-border/60 py-20 text-center sm:py-24 lg:py-32">
			{isLead ? <HeroAtmosphere /> : null}
			{isLead ? (
				<ScrollReveal direction="none" className="relative z-10 w-full">
					<HomeHeroTopBar hero={hero} />
				</ScrollReveal>
			) : null}
			<div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-12">
				<ScrollReveal delay={0.15}>
					<div className="flex flex-col items-center gap-5">
						<HomeHeroHeadline hero={hero} headingLevel={isLead ? "h1" : "h2"} />
						<p className="max-w-2xl text-balance text-lg leading-snug text-muted-foreground sm:text-xl lg:text-2xl">
							{hero.body}
						</p>
					</div>
				</ScrollReveal>
				<ScrollReveal delay={0.3}>
					<div className="flex w-full flex-col items-center gap-6">
						<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
							<HomePagePrimaryCta
								target={primaryCtaTarget}
								label={hero.primaryCta}
								className="h-16 rounded-2xl px-12 text-lg font-bold shadow-2xl shadow-foreground/15 motion-safe:transition-all motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-foreground/25 sm:min-w-80"
							/>
							<HomePageSecondaryLink
								href={hero.secondaryCta.href}
								label={hero.secondaryCta.label}
								className="h-16 px-8 text-base"
							/>
						</div>
					</div>
				</ScrollReveal>
			</div>
			<div className="absolute bottom-0 left-1/2 h-px w-3/5 -translate-x-1/2 bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
		</section>
	);
}
