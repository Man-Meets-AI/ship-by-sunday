import { type HomePageCtaTarget } from "@/config/product";
import type { HomePageContent } from "@/features/marketing/content/home";

import { HomeHeroHeadline } from "./home-hero-headline";
import { HomeHeroTopBar } from "./home-hero-top-bar";
import { HomePagePrimaryCta } from "./home-page-primary-cta";
import { HomePageSecondaryLink } from "./home-page-primitives";

type Hero = HomePageContent["hero"];

export function HomeHeroSection({
	hero,
	primaryCtaTarget,
}: {
	hero: Hero;
	primaryCtaTarget: HomePageCtaTarget;
}) {
	return (
		<section className="relative flex w-full flex-col items-center py-16 text-center sm:py-24 lg:py-32">
			<HomeHeroTopBar hero={hero} />
			<div className="mt-16 flex w-full max-w-4xl flex-col items-center gap-12 sm:mt-24 lg:mt-32">
				<div className="flex flex-col items-center gap-8">
					<HomeHeroHeadline hero={hero} />
					<p className="max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl lg:text-2xl">
						{hero.body}
					</p>
				</div>
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
					<div className="max-w-lg">
						<p className="text-sm font-medium tracking-wide text-muted-foreground/80 uppercase">
							{hero.eyebrow}
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
