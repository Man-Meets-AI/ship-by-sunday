import { type HomePageCtaTarget } from "@/config/product";
import type { HomePageContent } from "@/features/marketing/content/home";

import { HomeHeroHeadline } from "./home-hero-headline";
import { HomeHeroTopBar } from "./home-hero-top-bar";
import { HomePagePrimaryCta } from "./home-page-primary-cta";
import {
	HomePageSecondaryLink,
	HomePageSectionOverline,
	homePageQuietSurfaceClassName,
} from "./home-page-primitives";

type Hero = HomePageContent["hero"];

export function HomeHeroSection({
	hero,
	primaryCtaTarget,
}: {
	hero: Hero;
	primaryCtaTarget: HomePageCtaTarget;
}) {
	return (
		<section
			className={`relative mx-auto flex w-full max-w-7xl flex-col overflow-hidden rounded-[36px] border border-border/70 ${homePageQuietSurfaceClassName}`}
		>
			<HomeHeroTopBar hero={hero} />
			<div className="grid w-full gap-10 border-t border-border/60 px-4 py-10 text-left sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:gap-14 lg:px-8 lg:py-20">
				<div className="flex max-w-4xl flex-col gap-8">
					<HomePageSectionOverline className="max-w-md">
						Contract-first weekend sprint
					</HomePageSectionOverline>
					<div className="space-y-6">
						<HomeHeroHeadline hero={hero} />
						<p className="max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
							{hero.body}
						</p>
					</div>
					<div className="flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start">
						<HomePagePrimaryCta
							target={primaryCtaTarget}
							label={hero.primaryCta}
							className="h-11 min-w-full px-8 sm:min-w-72"
						/>
						<HomePageSecondaryLink
							href={hero.secondaryCta.href}
							label={hero.secondaryCta.label}
							className="min-w-full sm:min-w-fit"
						/>
					</div>
				</div>
				<div className="flex items-end">
					<div className="w-full border-t border-border/60 pt-4 lg:max-w-sm">
						<p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
							Access path
						</p>
						<p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">
							{hero.eyebrow}
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
