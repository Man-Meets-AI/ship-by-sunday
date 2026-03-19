import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import type { HomePageContent } from "@/features/marketing/content/home";

import { SectionLabel, SectionStack } from "./section-shell";

type OfferSection = HomePageContent["offerSection"];

export function OfferStackSection({
	missionImage,
	offerSection,
}: {
	missionImage: HomePageContent["assets"]["missionImage"];
	offerSection: OfferSection;
}) {
	return (
		<SectionStack className="gap-10 lg:gap-12">
			<div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
				<div className="flex flex-col gap-6">
					<div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-4">
						<div className="space-y-3">
							<SectionLabel>{offerSection.stackLabel}</SectionLabel>
							<h2 className="font-marketing-display text-balance text-3xl uppercase tracking-marketing-section sm:text-5xl">
								{offerSection.stackTitle}
							</h2>
						</div>
						<Badge variant="secondary" className="shrink-0">
							{offerSection.items.length}
						</Badge>
					</div>
					<div className="divide-y divide-border/60">
						{offerSection.items.map((item) => (
							<div key={item.name} className="space-y-3 py-6 first:pt-0 last:pb-0">
								<p className="text-2xl font-medium tracking-marketing-section sm:text-[2rem]">
									{item.name}
								</p>
								<p className="max-w-xl text-base leading-relaxed text-muted-foreground">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</div>
				<div className="flex flex-col gap-8">
					<div className="space-y-4">
						<SectionLabel>{offerSection.insideLabel}</SectionLabel>
						<h2 className="font-marketing-display text-balance text-3xl uppercase tracking-marketing-section sm:text-5xl">
							{offerSection.insideTitle}
						</h2>
						<p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
							{offerSection.insideIntro}
						</p>
					</div>
					<div className="relative min-h-72 overflow-hidden rounded-xl">
						<Image
							src={missionImage}
							alt={offerSection.missionAlt}
							fill
							className="object-cover"
							sizes="(max-width: 1024px) 100vw, 42vw"
						/>
					</div>
					<div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
						{offerSection.workspacePreviews.map((preview) => (
							<div key={preview.name} className="overflow-hidden rounded-xl">
								<div className="relative min-h-32 border-b border-border/60">
									<Image
										src={preview.src}
										alt={`${preview.name} workspace preview`}
										fill
										className="object-cover"
										sizes="(max-width: 640px) 100vw, 20vw"
									/>
								</div>
								<div className="space-y-3 px-1 py-4">
									<p className="text-lg font-medium">{preview.name}</p>
									<p className="text-sm leading-relaxed text-muted-foreground">
										{preview.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</SectionStack>
	);
}
