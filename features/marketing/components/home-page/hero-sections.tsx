import { Check } from "lucide-react";

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
				<p className="max-w-2xl text-muted-foreground sm:text-lg">
					{hero.body}
				</p>
				<div className="w-full max-w-md space-y-3">
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{hero.outcomesHeading}
					</p>
					<div className="mx-auto grid gap-x-6 gap-y-2 text-left sm:grid-cols-2">
						{hero.outcomes.map((outcome) => (
							<div key={outcome} className="flex items-start gap-2.5">
								<Check className="mt-0.5 size-4 shrink-0 text-primary" />
								<span className="text-sm font-medium sm:text-base">
									{outcome}
								</span>
							</div>
						))}
					</div>
				</div>
				<div className="flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
					<CheckoutButton
						label={hero.primaryCta}
						className="h-11 min-w-full px-8 sm:min-w-72"
					/>
					<Button
						variant="secondary"
						size="lg"
						className="h-11 w-full sm:w-72"
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
