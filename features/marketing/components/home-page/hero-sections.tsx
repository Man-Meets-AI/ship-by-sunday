import Image from "next/image";
import { Check } from "lucide-react";

import { CheckoutButton } from "@/features/checkout/components/checkout-button";
import type { HomePageContent } from "@/features/marketing/content/home";

import { HomeHeroHeadline } from "./home-hero-headline";
import { HomeHeroTopBar } from "./home-hero-top-bar";

type Hero = HomePageContent["hero"];

export function HomeHeroSection({
	hero,
	heroPreviewImage,
}: {
	hero: Hero;
	heroPreviewImage: string;
}) {
	return (
		<section className="relative mx-auto flex w-full max-w-7xl flex-col items-center justify-center overflow-hidden rounded-[32px] bg-background">
			<HomeHeroTopBar hero={hero} />
			<div className="flex w-full flex-col items-start gap-8 px-4 py-10 text-left sm:py-16 lg:py-20">
				<div className="flex w-full max-w-3xl flex-col items-start gap-8">
					<HomeHeroHeadline hero={hero} />
					<p className="max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
						{hero.body}
					</p>
				</div>
				<div className="flex w-full max-w-3xl flex-col gap-3">
					<p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
						{hero.outcomesHeading}
					</p>
					<div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
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
				<div className="flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-start">
					<CheckoutButton
						label={hero.primaryCta}
						className="h-11 min-w-full px-8 sm:min-w-72"
					/>
				</div>
				<p className="max-w-2xl text-sm font-medium text-muted-foreground sm:text-base">
					{hero.eyebrow}
				</p>
				<div className="relative mt-4 w-full rounded-[28px] border border-border/80 bg-muted/40 p-3 shadow-sm sm:p-4">
					<div className="overflow-hidden rounded-[20px] border border-border/80 bg-background">
						<Image
							src={heroPreviewImage}
							alt={hero.previewImageAlt}
							width={1600}
							height={900}
							priority
							className="aspect-video h-auto w-full object-cover"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
