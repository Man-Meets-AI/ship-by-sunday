import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/features/checkout/components/checkout-button";
import type { HomePageContent } from "@/features/marketing/content/home";

import { HomeHeroHeadline } from "./home-hero-headline";
import { HomeHeroTopBar } from "./home-hero-top-bar";
import { SectionLabel, SectionStack } from "./section-shell";

type Hero = HomePageContent["hero"];
type Outcomes = HomePageContent["outcomesSection"];
type WhyBuildersGetStuck = HomePageContent["whyBuildersGetStuck"];

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

export function OutcomesSection({
	outcomesSection,
}: {
	outcomesSection: Outcomes;
}) {
	return (
		<SectionStack
			withTopRule
			className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:gap-8"
		>
			<div className="space-y-3">
				<SectionLabel>{outcomesSection.label}</SectionLabel>
				<h2 className="font-marketing-display text-balance text-3xl uppercase tracking-marketing-section sm:text-5xl">
					{outcomesSection.title}
				</h2>
			</div>
			<div className="flex items-end">
				<p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
					{outcomesSection.intro}
				</p>
			</div>
			<div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4">
				{outcomesSection.items.map((item) => (
					<div
						key={item}
						className="flex min-h-40 flex-col justify-end rounded-lg bg-muted/15 px-4 py-5"
					>
						<p className="text-lg font-medium leading-tight">{item}</p>
					</div>
				))}
			</div>
		</SectionStack>
	);
}

export function WhyBuildersGetStuckSection({
	whyBuildersGetStuck,
}: {
	whyBuildersGetStuck: WhyBuildersGetStuck;
}) {
	return (
		<SectionStack className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
			<div className="space-y-3">
				<SectionLabel>{whyBuildersGetStuck.label}</SectionLabel>
				<h2 className="font-marketing-display max-w-4xl text-balance text-3xl uppercase tracking-marketing-section sm:text-5xl">
					{whyBuildersGetStuck.title}
				</h2>
			</div>
			<div className="flex items-end">
				<p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
					{whyBuildersGetStuck.intro}
				</p>
			</div>
			<div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4">
				{whyBuildersGetStuck.cards.map((card) => (
					<div
						key={card.title}
						className="flex flex-col gap-4 rounded-lg bg-muted/15 px-4 py-5"
					>
						<p className="text-2xl font-medium sm:text-[1.9rem]">{card.title}</p>
						<p className="text-base leading-relaxed text-muted-foreground">
							{card.description}
						</p>
					</div>
				))}
			</div>
		</SectionStack>
	);
}
