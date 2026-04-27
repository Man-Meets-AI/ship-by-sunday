import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import { BlogMediaFrame } from "@/app/blog/_components/blog-media-frame";
import { BlogPostMeta } from "@/app/blog/_components/blog-post-meta";
import type { BlogPostSummary } from "@/app/blog/_server/blog-posts";
import { cn } from "@/lib/utils";

type BlogPostCardProps = {
	post: BlogPostSummary;
	emphasis?: "featured" | "standard";
};

export function BlogPostCard({
	post,
	emphasis = "standard",
}: BlogPostCardProps) {
	return (
		<Link
			href={post.href}
			className={cn(
				"group block rounded-[36px] border border-border/70 bg-background/80 p-4 transition-transform duration-200 ease-out hover:-translate-y-1 sm:p-5",
				emphasis === "featured" && "lg:p-6",
			)}
		>
			<div
				className={cn(
					"grid gap-5",
					emphasis === "featured" &&
						"lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-end lg:gap-8",
				)}
			>
				<BlogMediaFrame
					kind={post.heroMediaKind}
					src={post.heroMediaSrc}
					alt={post.title}
					posterSrc={post.heroPosterSrc}
					priority={emphasis === "featured"}
				/>
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<span className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
							{post.featured ? "Featured essay" : "Essay"}
						</span>
						<span className="h-px flex-1 bg-border/70" />
					</div>
					<div className="space-y-3">
						<h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-foreground/90 sm:text-3xl">
							{post.title}
						</h2>
						<p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
							{post.summary}
						</p>
					</div>
					<BlogPostMeta post={post} />
					<div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
						<span>Read essay</span>
						<ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
					</div>
				</div>
			</div>
		</Link>
	);
}
