import type { HomePageContent } from "@/features/marketing/content/home";

type Hero = HomePageContent["hero"];

export function HomeHeroHeadline({ hero }: { hero: Hero }) {
	return (
		<div className="space-y-5">
			<h1 className="font-marketing-display text-4xl leading-[0.95] uppercase sm:text-6xl lg:text-7xl">
				<span className="block text-balance">{hero.headlineLead}</span>
				<span className="mt-3 block text-balance text-2xl leading-tight text-muted-foreground sm:text-3xl lg:text-4xl">
					{hero.headlineAccent}
				</span>
			</h1>
			<p className="mx-auto max-w-3xl text-pretty text-lg text-muted-foreground sm:text-xl">
				{hero.body}
			</p>
		</div>
	);
}
