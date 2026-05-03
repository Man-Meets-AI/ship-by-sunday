import { blogIndexContent } from "@/app/blog/_content/blog";
import { BlogPostCard } from "@/app/blog/_components/blog-post-card";
import { BlogSurfaceHeader } from "@/app/blog/_components/blog-surface-header";
import { getBlogPagePath } from "@/app/blog/_server/page-paths";
import type { BlogPostSummary } from "@/app/blog/_server/blog-posts";

type BlogIndexPageProps = {
	posts: BlogPostSummary[];
};

export function BlogIndexPage({ posts }: BlogIndexPageProps) {
	const featuredPost = posts.find((post) => post.featured) ?? posts[0];
	const remainingPosts = featuredPost
		? posts.filter((post) => post.href !== featuredPost.href)
		: [];

	return (
		<main className="min-h-screen bg-background text-foreground">
			<BlogSurfaceHeader activeHref={getBlogPagePath()} />
			<div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8">
				<section className="pt-8 sm:pt-14 lg:pt-16">
					<div className="grid gap-6 xl:grid-cols-[minmax(0,0.68fr)_minmax(24rem,0.32fr)] xl:items-end">
						<div>
							<p className="text-sm font-medium text-foreground">
								{blogIndexContent.eyebrow}
							</p>
							<h1 className="font-heading-serif mt-5 max-w-5xl text-balance text-5xl font-normal leading-[0.92] text-foreground sm:mt-6 sm:text-7xl md:text-8xl lg:text-9xl">
								{blogIndexContent.titleLead}
							</h1>
						</div>
						<div className="space-y-5">
							<p className="max-w-2xl text-pretty text-base leading-7 text-foreground/65 sm:text-lg sm:leading-8">
								{blogIndexContent.intro}
							</p>
							<p className="text-sm font-medium text-muted-foreground">
								{posts.length} {posts.length === 1 ? "article" : "articles"} ·
								newest first
							</p>
						</div>
					</div>
				</section>
				<section className="mt-10 border-t border-border py-5 sm:mt-12 sm:py-6">
					<div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
						<h2 className="font-medium text-foreground">
							{blogIndexContent.archiveLabel}
						</h2>
					</div>
					{featuredPost ? (
						<div className="mt-6 space-y-12">
							<BlogPostCard post={featuredPost} emphasis="featured" />
							{remainingPosts.length ? (
								<div className="grid gap-x-5 gap-y-12 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-4">
									{remainingPosts.map((post) => (
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
