import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import type { HomePageContent } from "@/features/marketing/content/home";

type Hero = HomePageContent["hero"];

const headlineLineClass =
	"block text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.05]";

export function HomeHeroHeadline({ hero }: { hero: Hero }) {
	return (
		<div className="space-y-5">
			<h1 className="space-y-3">
				<span className={headlineLineClass}>{hero.headlineLead}</span>
				<span className={`${headlineLineClass} mt-0`}>
					{hero.headlineTailPrefix}
					<span className="inline-block align-baseline">
						<span className="sr-only">{hero.headlineTailHover}</span>
						{/* Match viewBox 300×100 (~3:1): tall enough for text-7xl inside SVG (demo uses a large box; em-sized boxes crush strokes). */}
						<span className="relative inline-block aspect-[3/1] h-[2.65rem] w-auto min-w-[9.5rem] align-baseline sm:h-[3.15rem] sm:min-w-[11rem] lg:h-[3.85rem] lg:min-w-[12.5rem]">
							<TextHoverEffect text={hero.headlineTailHover} duration={0.2} />
						</span>
					</span>
				</span>
			</h1>
			<p className="mx-auto max-w-3xl text-pretty text-lg text-muted-foreground sm:text-xl">
				{hero.body}
			</p>
		</div>
	);
}
