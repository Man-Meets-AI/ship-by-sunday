import type { ReactNode } from "react";

import Link from "next/link";

import { ProductBrand } from "@/components/product-brand";
import { type HomePageCtaTarget, routeConfig } from "@/config/product";
import { BlogPostMeta } from "@/features/blog/components/blog-post-meta";
import { BlogPostPromo } from "@/features/blog/components/blog-post-promo";
import { BlogRichText } from "@/features/blog/components/blog-rich-text";
import { BlogPostToc } from "@/features/blog/components/blog-post-toc";
import type { BlogTocEntry } from "@/features/blog/lib/blog-toc";
import { getBlogPagePath } from "@/features/blog/server/page-paths";
import type { BlogPostSummary } from "@/features/blog/server/blog-posts";

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
		<main
			id="top"
			className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(222,214,200,0.24),transparent_44%),linear-gradient(180deg,rgba(255,255,255,1),rgba(248,247,243,0.82))] dark:bg-[radial-gradient(circle_at_top,rgba(120,120,120,0.14),transparent_42%),linear-gradient(180deg,rgba(12,12,14,1),rgba(10,10,11,0.92))]"
		>
			<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between gap-4">
					<ProductBrand href={routeConfig.home} uppercase={false} />
					<Link
						href={getBlogPagePath()}
						className="inline-flex h-10 items-center rounded-full border border-border/60 px-4 text-sm font-medium text-foreground/80 transition-colors hover:border-foreground/20 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
					>
						Back to blog
					</Link>
				</div>
				<article className="pt-12 sm:pt-16">
					<header className="border-t border-border/60 pt-6 sm:pt-8">
						<div className="max-w-4xl space-y-6">
							<div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
								<span className="font-mono text-[0.72rem] uppercase tracking-[0.24em]">
									Journal
								</span>
								<span className="h-px w-12 bg-border/70" />
								<span className="text-sm">{post.authorRole}</span>
							</div>
							<h1 className="font-marketing-display tracking-marketing-section text-balance text-[clamp(4rem,10vw,7.2rem)] font-normal uppercase leading-[0.88] text-foreground">
								{post.title}
							</h1>
							<p className="max-w-3xl text-pretty text-xl leading-relaxed text-foreground/82 sm:text-2xl">
								{post.summary}
							</p>
						</div>
						<BlogPostMeta
							post={post}
							className="mt-7 border-t border-border/60 pt-5"
						/>
					</header>
					<div className="mt-10 sm:mt-12">
						<BlogPostPromo target={promoTarget} />
					</div>
					<div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_18rem] xl:gap-12">
						<div>
							<BlogRichText>{children}</BlogRichText>
						</div>
						<BlogPostToc items={toc} postPath={post.href} />
					</div>
					<footer className="mt-16 border-t border-border/60 pt-8">
						<Link
							href={getBlogPagePath()}
							className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
						>
							Return to the editorial index
						</Link>
					</footer>
				</article>
			</div>
		</main>
	);
}
