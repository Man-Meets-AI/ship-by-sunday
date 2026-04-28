import type { ReactNode } from "react";

import Link from "next/link";

import { type HomePageCtaTarget } from "@/config/product";
import { BlogPostPromo } from "@/app/blog/_components/blog-post-promo";
import { BlogRichText } from "@/app/blog/_components/blog-rich-text";
import { BlogPostShareRail } from "@/app/blog/_components/blog-post-share-rail";
import { BlogSurfaceHeader } from "@/app/blog/_components/blog-surface-header";
import { formatBlogDate } from "@/app/blog/_lib/blog-formatters";
import type { BlogTocEntry } from "@/app/blog/_lib/blog-toc";
import { getBlogPagePath } from "@/app/blog/_server/page-paths";
import type { BlogPostSummary } from "@/app/blog/_server/blog-posts";

type BlogPostShellProps = {
	post: BlogPostSummary;
	toc: BlogTocEntry[];
	promoTarget: HomePageCtaTarget;
	children: ReactNode;
};

export function BlogPostShell({
	post,
	promoTarget,
	children,
}: BlogPostShellProps) {
	return (
		<main id="top" className="min-h-screen bg-background text-foreground">
			<BlogSurfaceHeader activeHref={getBlogPagePath()} />
			<article>
				<header className="border-b border-border">
					<div className="mx-auto max-w-[1720px] px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
						<div className="max-w-6xl space-y-6">
							<div className="space-y-2 text-sm text-foreground/60">
								<p>{formatBlogDate(post.publishedAt)}</p>
								<p className="font-medium text-foreground">Field notes</p>
							</div>
							<h1 className="text-balance text-[clamp(3.4rem,8vw,8.25rem)] font-medium leading-[0.9] tracking-[-0.07em] text-foreground">
								{post.title}
							</h1>
							<p className="max-w-3xl text-pretty text-xl leading-8 text-foreground/70 sm:text-2xl sm:leading-9">
								{post.summary}
							</p>
						</div>
					</div>
				</header>
				<div className="mx-auto grid max-w-[1720px] gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[10rem_minmax(0,52rem)_1fr] lg:px-8">
					<BlogPostShareRail postPath={post.href} />
					<div className="min-w-0">
						<BlogRichText>{children}</BlogRichText>
						<section className="mt-16 border-t border-border pt-8">
							<h2 className="text-sm font-medium text-foreground">Author</h2>
							<p className="mt-4 text-lg font-medium text-foreground">
								{post.authorName}
							</p>
							<p className="text-base leading-7 text-foreground/70">
								{post.authorRole}
							</p>
						</section>
						<div className="mt-16">
							<BlogPostPromo target={promoTarget} />
						</div>
					</div>
				</div>
				<div className="mx-auto max-w-[1720px] px-4 pb-12 sm:px-6 lg:px-8">
					<footer className="border-t border-border pt-8">
						<Link
							href={getBlogPagePath()}
							className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
						>
							Back to all articles
						</Link>
					</footer>
				</div>
			</article>
		</main>
	);
}
