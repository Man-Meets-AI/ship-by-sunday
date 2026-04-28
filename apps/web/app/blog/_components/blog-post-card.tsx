import Link from "next/link";

import { BlogMediaFrame } from "@/app/blog/_components/blog-media-frame";
import { BlogPostMeta } from "@/app/blog/_components/blog-post-meta";
import type { BlogPostSummary } from "@/app/blog/_server/blog-posts";

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
			className="group block focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
		>
			<div className="space-y-5">
				<BlogMediaFrame
					kind={post.heroMediaKind}
					src={post.heroMediaSrc}
					alt={post.title}
					posterSrc={post.heroPosterSrc}
					priority={emphasis === "featured"}
				/>
				<div className="space-y-3">
					<BlogPostMeta post={post} />
					<h2 className="text-balance text-2xl font-medium leading-tight tracking-[-0.035em] text-foreground transition-colors group-hover:text-foreground/70 sm:text-3xl">
						{post.title}
					</h2>
					<p className="max-w-2xl text-pretty text-base leading-7 text-foreground/70">
						{post.summary}
					</p>
				</div>
			</div>
		</Link>
	);
}
