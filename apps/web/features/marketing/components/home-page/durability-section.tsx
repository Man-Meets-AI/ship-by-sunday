import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { HomePageContent } from "@/features/marketing/content/home";

type DurabilitySection = HomePageContent["durabilitySection"];

export function DurabilitySectionBlock({
	durabilitySection,
}: {
	durabilitySection: DurabilitySection;
}) {
	return (
		<section className="grid gap-8 border-t py-10 sm:gap-10 sm:py-12">
			<div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-8">
				<div className="space-y-4">
					<Badge variant="outline">{durabilitySection.label}</Badge>
					<h2 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
						{durabilitySection.title}
					</h2>
					<p className="max-w-2xl text-pretty text-muted-foreground sm:text-lg">
						{durabilitySection.intro}
					</p>
				</div>
				<div className="rounded-[28px] border border-border/80 bg-muted/40 p-5 shadow-sm sm:p-6">
					<p className="text-sm leading-relaxed text-foreground/90 sm:text-base">
						{durabilitySection.closing}
					</p>
				</div>
			</div>
			<div className="grid gap-4 lg:grid-cols-3">
				{durabilitySection.items.map((item) => (
					<Card
						key={item.title}
						className="h-full rounded-[24px] border-border/80 bg-background/90 p-5 sm:p-6"
					>
						<div className="space-y-3">
							<h3 className="text-lg font-semibold tracking-tight">
								{item.title}
							</h3>
							<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
								{item.description}
							</p>
						</div>
					</Card>
				))}
			</div>
		</section>
	);
}
