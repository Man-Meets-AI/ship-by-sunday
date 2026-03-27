import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { EncryptedText } from "@/components/ui/encrypted-text";
import type { HomePageContent } from "@/features/marketing/content/home";
import type { GitHubActivity } from "@/features/marketing/lib/github";
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
		<section className="py-24 lg:py-40 border-t border-border/40">
			<div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-24">
				<div className="space-y-12 lg:sticky lg:top-24 lg:h-fit">
					<div className="space-y-8">
						<p className="text-sm font-bold tracking-[0.2em] text-primary/80 uppercase">
							{socialProofSection.label}
						</p>
						<p className="max-w-2xl text-pretty text-2xl leading-relaxed text-foreground/90 sm:text-3xl lg:text-4xl">
							{socialProofSection.intro}
						</p>
					</div>
					<figure className="group space-y-6">
						<div className="relative aspect-[4/5] overflow-hidden rounded-[48px] border border-border/50 bg-muted/20 shadow-2xl transition-all duration-700 hover:scale-[1.02] sm:aspect-[5/4]">
							<Image
								src={socialProofImage}
								alt={socialProofSection.imageAlt}
								fill
								className="object-cover transition-transform duration-700 group-hover:scale-105"
								sizes="(max-width: 1024px) 100vw, 42vw"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
						</div>
						<figcaption className="max-w-xl text-base leading-relaxed text-muted-foreground italic">
							{socialProofSection.imageCaption}
						</figcaption>
					</figure>
				</div>
				<div className="flex flex-col gap-16">
					<div className="grid gap-8 border-t border-border/40 sm:grid-cols-2">
						{socialProofSection.stats.map((stat) => (
							<article
								key={stat.value}
								className="space-y-4 py-10"
							>
								<EncryptedText
									text={stat.value}
									charset="SHIPBYUNDA"
									className="text-6xl font-black tracking-tighter text-primary sm:text-7xl lg:text-8xl"
								/>
								<div className="space-y-1">
									<p className="text-lg font-bold tracking-tight text-foreground/90 uppercase">
										{stat.label}
									</p>
									<p className="text-sm leading-relaxed text-muted-foreground lg:text-base">
										{stat.description}
									</p>
								</div>
							</article>
						))}
					</div>
					{githubActivity ? (
						<div className="space-y-8 rounded-[48px] border border-border/40 bg-muted/20 p-8 shadow-sm transition-all hover:bg-muted/30 lg:p-12">
							<div className="flex flex-wrap items-baseline justify-between gap-6">
								<div className="space-y-2">
									<div className="flex flex-wrap items-baseline gap-3">
										<span className="text-5xl font-black tracking-tighter text-foreground sm:text-6xl">
											{githubActivity.totalContributions.toLocaleString()}+
										</span>
										<span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
											{socialProofSection.github.activityCaption}
										</span>
									</div>
								</div>
								<Link
									href={socialProofSection.github.profileUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background px-4 py-2 text-sm font-bold text-foreground/70 transition-all hover:border-foreground/30 hover:text-foreground hover:shadow-sm"
								>
									<span className="text-primary">@</span>{socialProofSection.github.username}
									<ExternalLink className="size-3.5" />
								</Link>
							</div>
							<div className="overflow-x-auto rounded-2xl border border-border/40 bg-background/50 p-6">
								<GitHubActivityGraph data={githubActivity.data} />
							</div>
						</div>
					) : null}
				</div>
			</div>
		</section>
	);
}
