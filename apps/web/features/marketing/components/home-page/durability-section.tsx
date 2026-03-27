import type { HomePageContent } from "@/features/marketing/content/home";

type DurabilitySection = HomePageContent["durabilitySection"];

export function DurabilitySectionBlock({
	durabilitySection,
}: {
	durabilitySection: DurabilitySection;
}) {
	return (
		<section className="py-20 lg:py-32 border-t border-border/40">
			<div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-24">
				<div className="max-w-xl space-y-4">
					<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						{durabilitySection.title}
					</h2>
					<p className="text-lg leading-relaxed text-muted-foreground">
						{durabilitySection.intro}
					</p>
				</div>
				<div className="grid flex-1 gap-8 sm:grid-cols-3">
					{durabilitySection.items.map((item) => (
						<div key={item.title} className="space-y-2">
							<p className="text-sm font-bold uppercase tracking-widest text-primary/80">
								{item.title}
							</p>
							<p className="text-sm leading-relaxed text-muted-foreground">
								{item.description}
							</p>
						</div>
					))}
				</div>
			</div>
			<div className="mt-12 rounded-2xl border border-border/40 bg-muted/20 px-6 py-4">
				<p className="text-center text-sm font-medium tracking-wide text-foreground/70 uppercase italic">
					{durabilitySection.closing}
				</p>
			</div>
		</section>
	);
}
