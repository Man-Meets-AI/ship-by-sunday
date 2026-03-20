import { Badge } from "@/components/ui/badge";
import type { HomePageContent } from "@/features/marketing/content/home";

type SprintPathSection = HomePageContent["sprintPathSection"];

export function SprintPathUnifiedSection({
	sprintPathSection,
}: {
	sprintPathSection: SprintPathSection;
}) {
	return (
		<section id="system" className="grid gap-8 py-8 sm:py-10">
			<div className="space-y-4">
				<Badge variant="outline">{sprintPathSection.label}</Badge>
				<h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
					{sprintPathSection.title}
				</h2>
				<p className="max-w-3xl text-muted-foreground sm:text-lg">
					{sprintPathSection.intro}
				</p>
			</div>
			<img
				src="/4-block-system.svg"
				alt="The 4-Block System — CEO, Design, Build, Ship"
				className="w-1/2 dark:hidden"
			/>
			<img
				src="/4-block-dark-mode.svg"
				alt="The 4-Block System — CEO, Design, Build, Ship"
				className="hidden w-1/2 dark:block"
			/>
		</section>
	);
}
