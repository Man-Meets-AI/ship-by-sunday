import { cn } from "@/lib/utils";
import { Cover } from "@/components/ui/cover";
import type { HomePageContent } from "@/features/marketing/content/home";

type Hero = HomePageContent["hero"];

const headlineLineClass =
	"font-marketing-display tracking-marketing-section block text-balance text-[clamp(3.5rem,10vw,8.5rem)] font-normal uppercase leading-[0.95] text-foreground transition-all duration-500 hover:tracking-tighter";

export function HomeHeroHeadline({ hero }: { hero: Hero }) {
	return (
		<div className="w-full">
			<h1 className="flex flex-col items-center">
				<span className={headlineLineClass}>{hero.headlineLead}</span>
				<span className={cn(headlineLineClass, "text-primary/90")}>
					{hero.headlineTailPrefix}
					<Cover className="bg-transparent px-0 py-0 dark:bg-transparent">{hero.headlineTailHover}</Cover>
				</span>
			</h1>
		</div>
	);
}
