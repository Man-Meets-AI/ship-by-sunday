import type { Metadata } from "next";

import { productConfig } from "@/config/product";
import { blogIndexContent } from "@/features/blog/content/blog";
import { getBlogPagePath } from "@/features/blog/server/page-paths";
import type { BlogPostSummary } from "@/features/blog/server/blog-posts";

function getBlogSocialImage(post?: BlogPostSummary) {
	if (!post) {
		return productConfig.images.founderProof;
	}

	if (post.heroMediaKind === "image") {
		return post.heroMediaSrc;
	}

	return post.heroPosterSrc ?? productConfig.images.founderProof;
}

export function getBlogMetadataDefaults(): Metadata {
	return {
		title: {
			default: blogIndexContent.siteName,
			template: `%s | ${blogIndexContent.siteName}`,
		},
		description: blogIndexContent.description,
		alternates: {
			canonical: getBlogPagePath(),
		},
		openGraph: {
			type: "website",
			url: getBlogPagePath(),
			siteName: blogIndexContent.siteName,
			title: blogIndexContent.siteName,
			description: blogIndexContent.description,
			images: [
				{
					url: getBlogSocialImage(),
					alt: `${blogIndexContent.siteName} preview`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: blogIndexContent.siteName,
			description: blogIndexContent.description,
			images: [getBlogSocialImage()],
		},
	};
}

export function buildBlogIndexMetadata(): Metadata {
	return {
		alternates: {
			canonical: getBlogPagePath(),
		},
		openGraph: {
			type: "website",
			url: getBlogPagePath(),
			siteName: blogIndexContent.siteName,
			title: blogIndexContent.siteName,
			description: blogIndexContent.description,
			images: [
				{
					url: getBlogSocialImage(),
					alt: `${blogIndexContent.siteName} preview`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: blogIndexContent.siteName,
			description: blogIndexContent.description,
			images: [getBlogSocialImage()],
		},
	};
}

export function buildBlogPostMetadata(post: BlogPostSummary): Metadata {
	const canonicalPath = getBlogPagePath(post.slug);
	const socialImage = getBlogSocialImage(post);

	return {
		title: post.title,
		description: post.description,
		alternates: {
			canonical: canonicalPath,
		},
		openGraph: {
			type: "article",
			url: canonicalPath,
			siteName: blogIndexContent.siteName,
			title: post.title,
			description: post.description,
			publishedTime: post.publishedAt,
			authors: [post.authorName],
			images: [
				{
					url: socialImage,
					alt: `${post.title} preview`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: post.title,
			description: post.description,
			images: [socialImage],
		},
	};
}
