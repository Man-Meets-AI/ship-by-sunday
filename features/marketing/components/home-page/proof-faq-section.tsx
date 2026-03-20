import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EncryptedText } from "@/components/ui/encrypted-text";
import type { HomePageContent } from "@/features/marketing/content/home";
import type { GitHubActivity } from "@/features/marketing/lib/github";

import FAQAccordion from "../faq-accordion";
import { GitHubActivityGraph } from "./github-activity-graph";
import { GlobeCard } from "./global-reach-section";

type FAQSection = HomePageContent["faqSection"];
type ProofSection = HomePageContent["proofSection"];

export function FounderProofSection({
	proofImage,
	proofSection,
	githubActivity,
}: {
	proofImage: HomePageContent["assets"]["proofImage"];
	proofSection: ProofSection;
	githubActivity: GitHubActivity | null;
}) {
	return (
		<section className="grid gap-10 border-t py-10 sm:gap-12 sm:py-12">
			<div className="space-y-4">
				<h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
					{proofSection.label}
				</h2>
				<p className="max-w-2xl text-pretty text-muted-foreground sm:text-lg">
					{proofSection.intro}
				</p>
			</div>

			<div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
				<Card className="gap-0 py-0">
					<div className="relative aspect-4/3 w-full">
						<Image
							src={proofImage}
							alt={proofSection.imageAlt}
							fill
							className="rounded-t-xl object-cover"
							sizes="(max-width: 1024px) 100vw, 55vw"
						/>
					</div>
					<p className="px-4 py-3 text-xs text-muted-foreground sm:text-sm">
						{proofSection.imageCaption}
					</p>
				</Card>

				<div className="grid grid-cols-2 gap-4">
					{proofSection.stats.map((stat) => (
						<Card key={stat.value} className="justify-center">
							<CardContent className="flex flex-col gap-1">
								<EncryptedText
									text={stat.value}
									charset="SHIPBYUNDA"
									className="text-3xl font-semibold tracking-tight sm:text-4xl"
								/>
								<EncryptedText
									text={stat.label}
									charset="SHIPBYUNDA"
									className="text-sm font-medium"
								/>
								<span className="text-xs text-muted-foreground">
									{stat.description}
								</span>
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			{githubActivity ? (
				<Card>
					<CardContent className="flex flex-col gap-4">
						<div className="flex flex-wrap items-baseline justify-between gap-2">
							<div className="flex items-baseline gap-2">
								<span className="text-3xl font-semibold tracking-tight sm:text-4xl">
									{githubActivity.totalContributions.toLocaleString()}+
								</span>
								<span className="text-sm text-muted-foreground">
									{proofSection.github.activityCaption}
								</span>
							</div>
							<Link
								href={proofSection.github.profileUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
							>
								@{proofSection.github.username}
								<ExternalLink className="size-3.5" />
							</Link>
						</div>
						<div className="overflow-x-auto">
							<GitHubActivityGraph data={githubActivity.data} />
						</div>
					</CardContent>
				</Card>
			) : null}

			<div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
					{proofSection.reachStats.map((stat) => (
						<Card key={stat.value} className="justify-center">
							<CardContent className="flex flex-col gap-1">
								<span className="text-3xl font-semibold tracking-tight sm:text-4xl">
									{stat.value}
								</span>
								<span className="text-sm font-medium">{stat.label}</span>
								<span className="text-xs text-muted-foreground">
									{stat.description}
								</span>
							</CardContent>
						</Card>
					))}
				</div>

				<GlobeCard />
			</div>
		</section>
	);
}

export function CommonQuestionsSection({
	faqSection,
}: {
	faqSection: FAQSection;
}) {
	return (
		<section className="grid gap-10 border-t py-10 sm:gap-12 sm:py-12">
			<div className="space-y-4">
				<Badge variant="outline">{faqSection.label}</Badge>
				<h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
					{faqSection.titleLead}
					<span className="block">{faqSection.titleAccent}</span>
				</h2>
				{faqSection.lead ? (
					<p className="max-w-2xl text-muted-foreground sm:text-lg">
						{faqSection.lead}
					</p>
				) : null}
			</div>

			<FAQAccordion items={faqSection.items} />
		</section>
	);
}
