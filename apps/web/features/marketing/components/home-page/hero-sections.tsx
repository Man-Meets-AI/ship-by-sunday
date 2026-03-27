"use client";

import { type HomePageCtaTarget } from "@/config/product";
import type { HomePageContent } from "@/features/marketing/content/home";

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
}: {
	hero: Hero;
	primaryCtaTarget: HomePageCtaTarget;
}) {
	return (
		<section className="relative flex w-full flex-col items-center pt-4 pb-16 text-center sm:pt-8 sm:pb-24 lg:pt-10 lg:pb-28">
			<HeroAtmosphere />
			<ScrollReveal direction="none" className="relative z-10">
				<HomeHeroTopBar hero={hero} />
			</ScrollReveal>
			<div className="relative z-10 mt-10 flex w-full max-w-4xl flex-col items-center gap-12 sm:mt-14 lg:mt-20">
				<ScrollReveal delay={0.15}>
					<div className="flex flex-col items-center gap-8">
						<HomeHeroHeadline hero={hero} />
						<p className="max-w-2xl text-balance text-lg leading-7 text-muted-foreground sm:text-xl lg:text-2xl">
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
								className="h-16 rounded-2xl px-12 text-lg font-bold shadow-2xl shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-primary/30 sm:min-w-80"
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
			<div className="absolute bottom-0 left-1/2 h-px w-3/5 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
		</section>
	);
}
