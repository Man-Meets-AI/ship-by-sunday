import { cn } from "@/lib/utils";
import { Cover } from "@/components/ui/cover";
import type { HomePageContent } from "@/app/_content/home-page";

type Hero = HomePageContent["hero"];

const headlineLineClass =
	"font-marketing-display tracking-marketing-section block text-balance text-[clamp(3.5rem,10vw,8.5rem)] font-normal uppercase leading-[0.88] text-foreground motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:tracking-tighter";

export function HomeHeroHeadline({
	hero,
	headingLevel = "h1",
}: {
	hero: Hero;
	headingLevel?: "h1" | "h2";
}) {
	const headlineText = [
		hero.headlineLead,
		`${hero.headlineTailPrefix}${hero.headlineTailHover}`,
	]
		.filter(Boolean)
		.join(" ");
	const Heading = headingLevel;

	return (
		<div className="w-full">
			<Heading
				aria-label={headlineText}
				className="flex flex-col items-center gap-1"
			>
				<span className={headlineLineClass}>{hero.headlineLead}</span>
				<span className={cn(headlineLineClass, "text-foreground/90")}>
					{hero.headlineTailPrefix}
					<Cover className="bg-transparent px-0 py-0 dark:bg-transparent">
						{hero.headlineTailHover}
					</Cover>
				</span>
			</Heading>
		</div>
	);
}
