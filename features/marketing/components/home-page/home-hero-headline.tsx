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
						<span className="inline-block h-[0.72em] min-h-6 w-[7.5ch] min-w-26 align-baseline sm:min-w-29 lg:min-w-32">
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
