import { productConfig, routeConfig } from "@/config/product";
import { blogIndexContent } from "@/app/(marketing)/blog/_content/blog";
import type { BlogPostSummary } from "@/app/(marketing)/blog/_server/blog-posts";
import { getBlogPagePath } from "@/app/(marketing)/blog/_server/page-paths";
import { getMetadataBase } from "@/platform/next/metadata-base";

const metadataBase = getMetadataBase();

function getAbsoluteUrl(path: string) {
	return new URL(path, metadataBase).toString();
}

function escapeStructuredData(json: object) {
	return JSON.stringify(json).replaceAll("<", "\\u003c");
}

export function getBlogIndexStructuredData(posts: BlogPostSummary[]) {
	return escapeStructuredData({
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Organization",
				name: productConfig.name,
				url: getAbsoluteUrl(routeConfig.home),
				logo: getAbsoluteUrl("/android-chrome-512x512.png"),
				description: productConfig.metadataDescription,
			},
			{
				"@type": "Blog",
				name: blogIndexContent.siteName,
				description: blogIndexContent.description,
				url: getAbsoluteUrl(getBlogPagePath()),
				publisher: {
					"@type": "Organization",
					name: productConfig.name,
				},
				blogPost: posts.map((post) => ({
					"@type": "BlogPosting",
					headline: post.title,
					description: post.description,
					url: getAbsoluteUrl(post.href),
					datePublished: post.publishedAt,
					author: {
						"@type": "Person",
						name: post.authorName,
					},
				})),
			},
		],
	});
}

export function getBlogPostStructuredData(post: BlogPostSummary) {
	const imageUrl =
		post.heroMediaKind === "image"
			? getAbsoluteUrl(post.heroMediaSrc)
			: getAbsoluteUrl(post.heroPosterSrc ?? productConfig.images.founderProof);

	return escapeStructuredData({
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Organization",
				name: productConfig.name,
				url: getAbsoluteUrl(routeConfig.home),
				logo: getAbsoluteUrl("/android-chrome-512x512.png"),
			},
			{
				"@type": "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: productConfig.name,
						item: getAbsoluteUrl(routeConfig.home),
					},
					{
						"@type": "ListItem",
						position: 2,
						name: blogIndexContent.siteName,
						item: getAbsoluteUrl(getBlogPagePath()),
					},
					{
						"@type": "ListItem",
						position: 3,
						name: post.title,
						item: getAbsoluteUrl(post.href),
					},
				],
			},
			{
				"@type": "BlogPosting",
				headline: post.title,
				description: post.description,
				abstract: post.summary,
				url: getAbsoluteUrl(post.href),
				mainEntityOfPage: getAbsoluteUrl(post.href),
				datePublished: post.publishedAt,
				dateModified: post.publishedAt,
				image: imageUrl,
				articleSection: "Journal",
				author: {
					"@type": "Person",
					name: post.authorName,
					jobTitle: post.authorRole,
				},
				publisher: {
					"@type": "Organization",
					name: productConfig.name,
					logo: {
						"@type": "ImageObject",
						url: getAbsoluteUrl("/android-chrome-512x512.png"),
					},
				},
			},
		],
	});
}
