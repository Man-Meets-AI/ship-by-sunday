"use client";

import { type HomePageCtaTarget } from "@/config/product";
import type { HomePageContent } from "@/features/marketing/content/home";

import { HeroAtmosphere } from "./hero-atmosphere";
import { HomeHeroHeadline } from "./home-hero-headline";
import { HomeHeroMedia } from "./home-hero-media";
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
		<section className="relative flex w-full flex-col items-center pt-2 pb-16 text-center sm:pt-6 sm:pb-24 lg:pt-8 lg:pb-28">
			<HeroAtmosphere />
			<ScrollReveal direction="none" className="relative z-10 w-full">
				<HomeHeroTopBar hero={hero} />
			</ScrollReveal>
			<div className="relative z-10 mt-6 flex w-full max-w-5xl flex-col items-center gap-5 sm:mt-8 sm:gap-6 lg:mt-10 lg:gap-8">
				<ScrollReveal delay={0.15}>
					<div className="flex max-w-3xl flex-col items-center gap-4">
						<HomeHeroHeadline hero={hero} />
					</div>
				</ScrollReveal>
				<ScrollReveal delay={0.25} className="w-full">
					<HomeHeroMedia media={hero.media} />
				</ScrollReveal>
				<ScrollReveal delay={0.3}>
					<div className="flex w-full max-w-md flex-col items-center gap-4">
						<HomePagePrimaryCta
							target={primaryCtaTarget}
							label={hero.primaryCta}
							className="h-16 w-full rounded-2xl px-12 text-lg font-bold shadow-2xl shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-primary/30"
						/>
						<HomePageSecondaryLink
							href={hero.secondaryCta.href}
							label={hero.secondaryCta.label}
							className="h-14 w-full px-8 text-base"
						/>
					</div>
				</ScrollReveal>
				<ScrollReveal delay={0.35}>
					<p className="max-w-2xl text-balance text-base leading-7 text-muted-foreground sm:text-lg lg:text-xl lg:leading-8">
						{hero.body}
					</p>
				</ScrollReveal>
			</div>
			<div className="absolute bottom-0 left-1/2 h-px w-3/5 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
		</section>
	);
}
