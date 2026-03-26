import { Cover } from "@/components/ui/cover";
import type { HomePageContent } from "@/features/marketing/content/home";

type Hero = HomePageContent["hero"];

const headlineLineClass =
	"font-marketing-display tracking-marketing-section block text-balance text-[clamp(4rem,10vw,8rem)] font-normal uppercase leading-[0.88] text-foreground";

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
