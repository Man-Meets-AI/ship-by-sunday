import { notFound } from "next/navigation";

import {
	BlogIndexStructuredData,
	BlogPostStructuredData,
} from "@/features/blog/components/blog-structured-data";
import { BlogIndexPage } from "@/features/blog/components/blog-index-page";
import { BlogPostPage } from "@/features/blog/components/blog-post-page";
import {
	buildBlogIndexMetadata,
	buildBlogPostMetadata,
} from "@/features/blog/lib/blog-metadata";
import { normalizeBlogSlug } from "@/features/blog/server/page-paths";
import {
	getPublishedBlogPostBySlug,
	getPublishedBlogPostSummaries,
} from "@/features/blog/server/blog-posts";
import { blogDisplayConfig } from "@/config/starter-selectors";

export const dynamicParams = false;

type BlogRoutePageProps = {
	params: Promise<{ slug?: string[] }>;
};

export async function generateStaticParams() {
	const posts = await getPublishedBlogPostSummaries();

	return [{ slug: [] }, ...posts.map((post) => ({ slug: post.slug }))];
}

export async function generateMetadata({ params }: BlogRoutePageProps) {
	const { slug } = await params;
	const normalizedSlug = normalizeBlogSlug(slug);

	if (normalizedSlug.length === 0) {
		return buildBlogIndexMetadata();
	}

	const post = await getPublishedBlogPostBySlug(normalizedSlug);
	if (!post) {
		notFound();
	}

	return buildBlogPostMetadata(post);
}

export default async function BlogRoutePage({ params }: BlogRoutePageProps) {
	const { slug } = await params;
	const normalizedSlug = normalizeBlogSlug(slug);

	if (normalizedSlug.length === 0) {
		const posts = await getPublishedBlogPostSummaries();
		return (
			<>
				<BlogIndexStructuredData posts={posts} />
				<BlogIndexPage posts={posts} />
			</>
		);
	}

	const post = await getPublishedBlogPostBySlug(normalizedSlug);
	if (!post) {
		notFound();
	}

	const Content = post.Content;

	return (
		<>
			<BlogPostStructuredData post={post} />
			<BlogPostPage
				post={post}
				toc={post.toc}
				promoTarget={blogDisplayConfig.promoCtaTarget}
			>
				<Content params={{ slug: normalizedSlug }} />
			</BlogPostPage>
		</>
	);
}
