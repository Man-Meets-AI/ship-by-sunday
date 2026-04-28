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
	const visiblePosts = featuredPost
		? [featuredPost, ...posts.filter((post) => post.href !== featuredPost.href)]
		: posts;

	return (
		<main className="min-h-screen bg-background text-foreground">
			<BlogSurfaceHeader activeHref={getBlogPagePath()} />
			<div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8">
				<section className="pt-12 sm:pt-20 lg:pt-24">
					<p className="text-sm font-medium text-foreground">
						{blogIndexContent.eyebrow}
					</p>
					<div className="mt-8">
						<h1 className="text-balance text-[clamp(4.5rem,10vw,9.75rem)] font-medium leading-[0.88] tracking-[-0.07em] text-foreground">
							{blogIndexContent.titleLead}
						</h1>
					</div>
					<nav
						aria-label="Blog categories"
						className="mt-10 flex gap-7 overflow-x-auto pb-8 text-sm text-foreground/60"
					>
						<span className="shrink-0">Company</span>
						<span className="shrink-0">Research</span>
						<span className="shrink-0">Product</span>
						<span className="shrink-0">Safety</span>
						<span className="shrink-0">Engineering</span>
						<span className="shrink-0">AI adoption</span>
						<a
							href={getBlogPagePath()}
							aria-current="page"
							className="shrink-0 text-foreground"
						>
							All
						</a>
					</nav>
				</section>
				<section className="border-t border-border py-4 sm:py-5">
					<div className="grid gap-4 text-sm text-foreground/70 sm:grid-cols-[1fr_auto_auto] sm:items-center">
						<h2 className="font-medium text-foreground">
							{blogIndexContent.archiveLabel}
						</h2>
						<p className="font-medium text-foreground">Sort</p>
						<p>Switch cards to show Media</p>
					</div>
					{featuredPost ? (
						<div className="mt-5 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
							{visiblePosts.map((post) => (
								<BlogPostCard
									key={post.href}
									post={post}
									emphasis={
										post.href === featuredPost.href ? "featured" : "standard"
									}
								/>
							))}
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
