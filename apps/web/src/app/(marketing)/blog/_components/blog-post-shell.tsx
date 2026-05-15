import type { ReactNode } from "react";

import Link from "next/link";

import { type HomePageCtaTarget } from "@/config/product";
import { BlogPostPromo } from "@/app/(marketing)/blog/_components/blog-post-promo";
import { BlogPostToc } from "@/app/(marketing)/blog/_components/blog-post-toc";
import { BlogRichText } from "@/app/(marketing)/blog/_components/blog-rich-text";
import { BlogPostShareRail } from "@/app/(marketing)/blog/_components/blog-post-share-rail";
import { BlogSurfaceHeader } from "@/app/(marketing)/blog/_components/blog-surface-header";
import { formatBlogDate } from "@/app/(marketing)/blog/_lib/blog-formatters";
import type { BlogTocEntry } from "@/app/(marketing)/blog/_lib/blog-toc";
import { getBlogPagePath } from "@/app/(marketing)/blog/_server/page-paths";
import type { BlogPostSummary } from "@/app/(marketing)/blog/_server/blog-posts";
import {
	PublicRouteContainer,
	PublicRouteDescription,
	PublicRouteEyebrow,
	PublicRouteHeader,
	PublicRoutePage,
	PublicRouteSection,
	PublicRouteTitle,
} from "@/components/layout/public-route-surface";

type BlogPostShellProps = {
	post: BlogPostSummary;
	toc: BlogTocEntry[];
	promoTarget: HomePageCtaTarget;
	children: ReactNode;
};

export function BlogPostShell({
	post,
	toc,
	promoTarget,
	children,
}: BlogPostShellProps) {
	return (
		<PublicRoutePage id="top">
			<BlogSurfaceHeader activeHref={getBlogPagePath()} />
			<article>
				<PublicRouteSection>
					<PublicRouteContainer className="py-12 sm:py-16 lg:py-20">
						<PublicRouteHeader className="max-w-6xl">
							<PublicRouteEyebrow>
								{formatBlogDate(post.publishedAt)} · Field notes
							</PublicRouteEyebrow>
							<PublicRouteTitle className="max-w-5xl">
								{post.title}
							</PublicRouteTitle>
							<PublicRouteDescription className="max-w-3xl">
								{post.summary}
							</PublicRouteDescription>
						</PublicRouteHeader>
					</PublicRouteContainer>
				</PublicRouteSection>
				<div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[10rem_minmax(0,52rem)_1fr] lg:px-8">
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
					<BlogPostToc items={toc} postPath={post.href} />
				</div>
				<div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
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
		</PublicRoutePage>
	);
}
