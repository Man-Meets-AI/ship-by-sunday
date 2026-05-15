import { formatBlogDate } from "@/app/(marketing)/blog/_lib/blog-formatters";
import type { BlogPostSummary } from "@/app/(marketing)/blog/_server/blog-posts";
import { cn } from "@/lib/utils";

type BlogPostMetaProps = {
	post: Pick<
		BlogPostSummary,
		"authorName" | "authorRole" | "publishedAt" | "readingTimeText"
	>;
	className?: string;
	showAuthor?: boolean;
};

export function BlogPostMeta({
	post,
	className,
	showAuthor = false,
}: BlogPostMetaProps) {
	return (
		<div
			className={cn(
				"flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-6 text-foreground/60",
				className,
			)}
		>
			<span>Field notes</span>
			<span aria-hidden="true">·</span>
			<time dateTime={post.publishedAt}>
				{formatBlogDate(post.publishedAt)}
			</time>
			{post.readingTimeText ? (
				<>
					<span aria-hidden="true">·</span>
					<span>{post.readingTimeText}</span>
				</>
			) : null}
			{showAuthor ? (
				<>
					<span aria-hidden="true">·</span>
					<span>
						{post.authorName}, {post.authorRole}
					</span>
				</>
			) : null}
		</div>
	);
}
