"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { EncryptedText } from "@/components/ui/encrypted-text";
import type { HomePageContent } from "@/features/marketing/content/home";
import type { GitHubActivity } from "@/features/marketing/lib/github";
import { GitHubActivityGraph } from "./github-activity-graph";
import { ScrollReveal } from "./scroll-reveal";

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
		<section className="border-t border-border/40 py-24 lg:py-40">
			<div className="grid gap-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
				<ScrollReveal>
					<div className="lg:sticky lg:top-24 lg:h-fit">
						<Image
							src="/landing-page/what-its-not.png"
							alt="What Ship by Sunday is not — a list of crossed-out anti-patterns with the tagline: system shaped by years of shipping products"
							width={960}
							height={960}
							className="w-full h-auto"
							sizes="(max-width: 1024px) 100vw, 40vw"
						/>
					</div>
				</ScrollReveal>

				<div className="flex flex-col">
					{/* Stats */}
					<div className="grid sm:grid-cols-2">
						{socialProofSection.stats.map((stat, i) => (
							<ScrollReveal key={stat.value} delay={0.1 * i}>
								<div className="border-t border-border/40 py-10">
									<EncryptedText
										text={stat.value}
										charset="SHIPBYUNDA"
										className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
									/>
									<p className="mt-3 text-sm font-medium text-foreground/70">
										{stat.label}
									</p>
									<p className="mt-1 text-base leading-7 text-muted-foreground">
										{stat.description}
									</p>
								</div>
							</ScrollReveal>
						))}
					</div>

					{/* Image */}
					<ScrollReveal delay={0.15}>
						<figure className="border-t border-border/40 pt-10">
							<div className="relative aspect-[16/9] overflow-hidden">
								<Image
									src={socialProofImage}
									alt={socialProofSection.imageAlt}
									fill
									className="object-cover"
									sizes="(max-width: 1024px) 100vw, 55vw"
								/>
							</div>
							<figcaption className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
								{socialProofSection.imageCaption}
							</figcaption>
						</figure>
					</ScrollReveal>

					{/* GitHub activity */}
					{githubActivity ? (
						<ScrollReveal delay={0.2}>
							<div className="border-t border-border/40 pt-10 mt-10">
								<div className="flex flex-wrap items-baseline justify-between gap-4">
									<div className="flex flex-wrap items-baseline gap-3">
										<span className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
											{githubActivity.totalContributions.toLocaleString()}+
										</span>
										<span className="text-sm font-medium text-muted-foreground">
											{socialProofSection.github.activityCaption}
										</span>
									</div>
									<Link
										href={socialProofSection.github.profileUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
									>
										@{socialProofSection.github.username}
										<ExternalLink className="size-3.5" />
									</Link>
								</div>
								<div className="mt-6 overflow-x-auto">
									<GitHubActivityGraph data={githubActivity.data} />
								</div>
							</div>
						</ScrollReveal>
					) : null}
				</div>
			</div>
		</section>
	);
}
