import Link from "next/link";

import { BlogMediaFrame } from "@/app/(marketing)/blog/_components/blog-media-frame";
import { BlogPostMeta } from "@/app/(marketing)/blog/_components/blog-post-meta";
import type { BlogPostSummary } from "@/app/(marketing)/blog/_server/blog-posts";

type BlogPostCardProps = {
	post: BlogPostSummary;
	emphasis?: "featured" | "standard";
};

export function BlogPostCard({
	post,
	emphasis = "standard",
}: BlogPostCardProps) {
	const isFeatured = emphasis === "featured";

	return (
		<Link
			href={post.href}
			className="group block focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
		>
			<div
				className={
					isFeatured
						? "grid gap-7 md:grid-cols-[minmax(0,0.95fr)_minmax(22rem,1.05fr)] md:items-center"
						: "space-y-5"
				}
			>
				<BlogMediaFrame
					kind={post.heroMediaKind}
					src={post.heroMediaSrc}
					alt={post.title}
					posterSrc={post.heroPosterSrc}
					priority={isFeatured}
					aspectClassName={isFeatured ? "aspect-[4/3]" : undefined}
				/>
				<div className={isFeatured ? "space-y-4" : "space-y-3"}>
					<BlogPostMeta post={post} />
					<h2
						className={
							isFeatured
								? "max-w-3xl text-balance text-3xl font-medium leading-tight tracking-normal text-foreground transition-colors group-hover:text-foreground/70 sm:text-4xl md:text-5xl lg:text-6xl"
								: "text-balance text-2xl font-medium leading-tight tracking-normal text-foreground transition-colors group-hover:text-foreground/70 sm:text-3xl"
						}
					>
						{post.title}
					</h2>
					<p
						className={
							isFeatured
								? "max-w-2xl text-pretty text-lg leading-8 text-foreground/70"
								: "max-w-2xl text-pretty text-base leading-7 text-foreground/70"
						}
					>
						{post.summary}
					</p>
				</div>
			</div>
		</Link>
	);
}
