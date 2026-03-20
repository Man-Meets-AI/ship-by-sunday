import { Cover } from "@/components/ui/cover";
import type { HomePageContent } from "@/features/marketing/content/home";

type Hero = HomePageContent["hero"];

const headlineLineClass =
	"block text-balance text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl lg:text-7xl";

export function HomeHeroHeadline({ hero }: { hero: Hero }) {
	return (
		<div>
			<h1 className="space-y-0.5">
				<span className={headlineLineClass}>{hero.headlineLead}</span>
				<span className={headlineLineClass}>
					{hero.headlineTailPrefix}
					<Cover>{hero.headlineTailHover}</Cover>
				</span>
			</h1>
		</div>
	);
}
