import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/features/checkout/components/checkout-button";
import type { HomePageContent } from "@/features/marketing/content/home";

import { HomeHeroHeadline } from "./home-hero-headline";
import { HomeHeroTopBar } from "./home-hero-top-bar";

type Hero = HomePageContent["hero"];

export function HomeHeroSection({ hero }: { hero: Hero }) {
	return (
		<div className="flex flex-col gap-6 rounded-2xl bg-muted/25 px-6 py-8 sm:gap-8 sm:px-8 sm:py-10">
			<HomeHeroTopBar hero={hero} />
			<div className="flex flex-col items-center gap-6 text-center sm:gap-8">
				<HomeHeroHeadline hero={hero} />
				<div className="flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
					<CheckoutButton
						label={hero.primaryCta}
						className="h-11 min-w-full px-8 sm:min-w-72"
					/>
					<Button
						variant="secondary"
						size="lg"
						className="h-11 w-full border border-foreground/20 bg-secondary hover:bg-muted/80 sm:w-72"
						asChild
					>
						<a href="#system">{hero.secondaryCta}</a>
					</Button>
				</div>
				<p className="text-sm font-medium text-muted-foreground sm:text-base">
					{hero.eyebrow}
				</p>
			</div>
		</div>
	);
}
