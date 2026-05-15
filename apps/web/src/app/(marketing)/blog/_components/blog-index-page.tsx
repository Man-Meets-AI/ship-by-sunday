import { blogIndexContent } from "@/app/(marketing)/blog/_content/blog";
import { BlogPostCard } from "@/app/(marketing)/blog/_components/blog-post-card";
import { BlogSurfaceHeader } from "@/app/(marketing)/blog/_components/blog-surface-header";
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

type BlogIndexPageProps = {
	posts: BlogPostSummary[];
};

export function BlogIndexPage({ posts }: BlogIndexPageProps) {
	const featuredPost = posts.find((post) => post.featured) ?? posts[0];
	const remainingPosts = featuredPost
		? posts.filter((post) => post.href !== featuredPost.href)
		: [];

	return (
		<PublicRoutePage>
			<BlogSurfaceHeader activeHref={getBlogPagePath()} />
			<PublicRouteSection className="border-b-0">
				<PublicRouteContainer className="py-10 sm:py-14">
					<div className="grid gap-6 border-b border-border/60 pb-8 xl:grid-cols-[minmax(0,0.68fr)_minmax(24rem,0.32fr)] xl:items-end">
						<PublicRouteHeader className="max-w-5xl">
							<PublicRouteEyebrow>
								{blogIndexContent.eyebrow}
							</PublicRouteEyebrow>
							<PublicRouteTitle>{blogIndexContent.titleLead}</PublicRouteTitle>
						</PublicRouteHeader>
						<div className="space-y-5">
							<PublicRouteDescription className="mt-0">
								{blogIndexContent.intro}
							</PublicRouteDescription>
							<p className="text-sm font-medium text-muted-foreground">
								{posts.length} {posts.length === 1 ? "article" : "articles"} ·
								newest first
							</p>
						</div>
					</div>
				</PublicRouteContainer>
				<PublicRouteContainer className="pb-14">
					<section className="py-5 sm:py-6">
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
				</PublicRouteContainer>
			</PublicRouteSection>
		</PublicRoutePage>
	);
}
