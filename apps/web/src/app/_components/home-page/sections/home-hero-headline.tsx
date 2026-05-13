import { cn } from "@/lib/utils";
import { Cover } from "@/components/ui/cover";
import type { HomePageContent } from "@/app/_content/home-page";

type Hero = HomePageContent["hero"];

const headlineLineClass =
	"font-heading-serif block text-balance text-[clamp(3.5rem,10vw,8.5rem)] font-normal leading-[0.9] text-foreground";

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
				className="font-heading-serif flex flex-col items-center gap-1"
			>
				<span className={headlineLineClass}>{hero.headlineLead}</span>
				<span className={cn(headlineLineClass, "italic text-foreground/90")}>
					{hero.headlineTailPrefix}
					<Cover>{hero.headlineTailHover}</Cover>
				</span>
			</Heading>
		</div>
	);
}
