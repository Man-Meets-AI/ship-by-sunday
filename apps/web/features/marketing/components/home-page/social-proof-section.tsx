import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { EncryptedText } from "@/components/ui/encrypted-text";
import type { HomePageContent } from "@/features/marketing/content/home";
import type { GitHubActivity } from "@/features/marketing/lib/github";

import {
	HomePageSectionOverline,
	homePageQuietSurfaceClassName,
	homePageSectionClassName,
} from "./home-page-primitives";
import { GitHubActivityGraph } from "./github-activity-graph";

type SocialProofSectionContent = HomePageContent["socialProofSection"];

export function SocialProofSection({
	socialProofImage,
	socialProofSection,
	githubActivity,
}: {
	socialProofImage: HomePageContent["assets"]["socialProofImage"];
	socialProofSection: SocialProofSectionContent;
	githubActivity: GitHubActivity | null;
}) {
	return (
		<section
			className={`grid gap-10 ${homePageSectionClassName} lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-12`}
		>
			<div className="space-y-6">
				<HomePageSectionOverline>Proof</HomePageSectionOverline>
				<div className="space-y-4">
					<h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
						{socialProofSection.label}
					</h2>
					<p className="max-w-2xl text-pretty text-muted-foreground sm:text-lg">
						{socialProofSection.intro}
					</p>
				</div>
				<figure className="space-y-3">
					<div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-border/70 bg-muted/20 sm:aspect-[5/4]">
						<Image
							src={socialProofImage}
							alt={socialProofSection.imageAlt}
							fill
							className="object-cover"
							sizes="(max-width: 1024px) 100vw, 42vw"
						/>
					</div>
					<figcaption className="max-w-xl text-sm leading-relaxed text-muted-foreground">
						{socialProofSection.imageCaption}
					</figcaption>
				</figure>
			</div>
			<div className="grid gap-6">
				<div className="grid gap-0 border-t border-border/60 sm:grid-cols-2 sm:gap-6">
					{socialProofSection.stats.map((stat) => (
						<article
							key={stat.value}
							className="space-y-2 border-b border-border/60 py-4 sm:py-5"
						>
							<EncryptedText
								text={stat.value}
								charset="SHIPBYUNDA"
								className="text-4xl font-semibold tracking-tight sm:text-5xl"
							/>
							<p className="text-sm font-medium text-foreground/90 sm:text-base">
								{stat.label}
							</p>
							<p className="text-sm leading-relaxed text-muted-foreground">
								{stat.description}
							</p>
						</article>
					))}
				</div>
				{githubActivity ? (
					<div
						className={`space-y-4 p-5 sm:p-6 ${homePageQuietSurfaceClassName}`}
					>
						<div className="flex flex-wrap items-baseline justify-between gap-3">
							<div className="space-y-1">
								<p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
									GitHub activity
								</p>
								<div className="flex flex-wrap items-baseline gap-2">
									<span className="text-4xl font-semibold tracking-tight sm:text-5xl">
										{githubActivity.totalContributions.toLocaleString()}+
									</span>
									<span className="text-sm text-muted-foreground">
										{socialProofSection.github.activityCaption}
									</span>
								</div>
							</div>
							<Link
								href={socialProofSection.github.profileUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
							>
								@{socialProofSection.github.username}
								<ExternalLink className="size-3.5" />
							</Link>
						</div>
						<div className="overflow-x-auto">
							<GitHubActivityGraph data={githubActivity.data} />
						</div>
					</div>
				) : null}
			</div>
		</section>
	);
}
