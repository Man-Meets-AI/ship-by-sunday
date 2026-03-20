import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { HomePageContent } from "@/features/marketing/content/home";

type OfferSection = HomePageContent["offerSection"];

export function OfferStackSection({
	missionImage,
	offerSection,
}: {
	missionImage: HomePageContent["assets"]["missionImage"];
	offerSection: OfferSection;
}) {
	return (
		<section className="grid gap-10 py-8 sm:py-10 lg:gap-12">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="space-y-4">
					<Badge variant="outline">{offerSection.stackLabel}</Badge>
					<h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
						{offerSection.sectionTitle}
					</h2>
					<p className="max-w-3xl text-muted-foreground sm:text-lg">
						{offerSection.insideIntro}
					</p>
				</div>
				<Badge variant="secondary" className="shrink-0">
					{offerSection.items.length}
				</Badge>
			</div>

			<div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
				<div className="flex flex-col gap-6">
					<h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
						{offerSection.stackTitle}
					</h3>
					<div className="divide-y">
						{offerSection.items.map((item) => (
							<div
								key={item.name}
								className="space-y-2 py-5 first:pt-0 last:pb-0"
							>
								<p className="text-lg font-semibold tracking-tight sm:text-xl">
									{item.name}
								</p>
								<p className="max-w-xl text-sm text-muted-foreground sm:text-base">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</div>

				<div className="flex flex-col gap-8">
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
							<Card key={preview.name}>
								<div className="relative min-h-32 border-b">
									<Image
										src={preview.src}
										alt={`${preview.name} workspace preview`}
										fill
										className="object-cover"
										sizes="(max-width: 640px) 100vw, 20vw"
									/>
								</div>
								<CardContent className="space-y-1">
									<p className="text-base font-semibold">{preview.name}</p>
									<p className="text-sm text-muted-foreground">
										{preview.description}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
