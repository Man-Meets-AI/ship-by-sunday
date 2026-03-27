import { formatBlogDate } from "@/features/blog/lib/blog-formatters";
import type { BlogPostSummary } from "@/features/blog/server/blog-posts";
import { cn } from "@/lib/utils";

type BlogPostMetaProps = {
	post: Pick<
		BlogPostSummary,
		"authorName" | "authorRole" | "publishedAt" | "readingTimeText"
	>;
	className?: string;
};

export function BlogPostMeta({ post, className }: BlogPostMetaProps) {
	return (
		<div
			className={cn(
				"flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground",
				className,
			)}
		>
			<div>
				<p className="font-mono text-[0.7rem] uppercase tracking-[0.22em]">
					Published
				</p>
				<p className="mt-1 text-sm text-foreground">
					{formatBlogDate(post.publishedAt)}
				</p>
			</div>
			<div>
				<p className="font-mono text-[0.7rem] uppercase tracking-[0.22em]">
					By
				</p>
				<p className="mt-1 text-sm text-foreground">
					{post.authorName}
					<span className="text-muted-foreground"> · {post.authorRole}</span>
				</p>
			</div>
			{post.readingTimeText ? (
				<div>
					<p className="font-mono text-[0.7rem] uppercase tracking-[0.22em]">
						Read time
					</p>
					<p className="mt-1 text-sm text-foreground">{post.readingTimeText}</p>
				</div>
			) : null}
		</div>
	);
}
