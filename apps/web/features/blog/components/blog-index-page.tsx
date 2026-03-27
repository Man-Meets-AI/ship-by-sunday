import Link from "next/link";

import { ProductBrand } from "@/components/product-brand";
import { routeConfig } from "@/config/product";
import { blogIndexContent } from "@/features/blog/content/blog";
import { BlogPostCard } from "@/features/blog/components/blog-post-card";
import type { BlogPostSummary } from "@/features/blog/server/blog-posts";

type BlogIndexPageProps = {
	posts: BlogPostSummary[];
};

export function BlogIndexPage({ posts }: BlogIndexPageProps) {
	const featuredPost = posts.find((post) => post.featured) ?? posts[0];
	const archivePosts = posts.filter((post) => post.href !== featuredPost?.href);

	return (
		<main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(222,214,200,0.32),transparent_46%),linear-gradient(180deg,rgba(255,255,255,1),rgba(246,244,239,0.82))] dark:bg-[radial-gradient(circle_at_top,rgba(120,120,120,0.16),transparent_44%),linear-gradient(180deg,rgba(12,12,14,1),rgba(10,10,11,0.94))]">
			<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between gap-4">
					<ProductBrand href={routeConfig.home} uppercase={false} />
					<Link
						href={routeConfig.home}
						className="inline-flex h-10 items-center rounded-full border border-border/60 px-4 text-sm font-medium text-foreground/80 transition-colors hover:border-foreground/20 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
					>
						Return home
					</Link>
				</div>
				<section className="pb-12 pt-16 sm:pb-16 sm:pt-20">
					<div className="flex items-center gap-3">
						<span className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
							{blogIndexContent.eyebrow}
						</span>
						<span className="h-px flex-1 bg-border/70" />
					</div>
					<div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-end">
						<h1 className="font-marketing-display tracking-marketing-section text-balance text-[clamp(3.8rem,10vw,7rem)] font-normal uppercase leading-[0.88] text-foreground">
							{blogIndexContent.titleLead}
							<span className="block">{blogIndexContent.titleAccent}</span>
						</h1>
						<p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
							{blogIndexContent.intro}
						</p>
					</div>
				</section>
				<section className="border-t border-border/60 py-10 sm:py-12">
					<div className="flex items-center gap-3">
						<span className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
							{blogIndexContent.archiveLabel}
						</span>
						<span className="h-px flex-1 bg-border/70" />
					</div>
					{featuredPost ? (
						<div className="mt-8 space-y-6">
							<BlogPostCard post={featuredPost} emphasis="featured" />
							{archivePosts.length > 0 ? (
								<div className="grid gap-6 lg:grid-cols-2">
									{archivePosts.map((post) => (
										<BlogPostCard key={post.href} post={post} />
									))}
								</div>
							) : null}
						</div>
					) : (
						<p className="mt-8 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
							{blogIndexContent.emptyState}
						</p>
					)}
				</section>
			</div>
		</main>
	);
}
