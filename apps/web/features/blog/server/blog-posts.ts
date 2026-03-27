import "server-only";

import type { ComponentType } from "react";
import { cache } from "react";

import { importPage } from "nextra/pages";
import { z } from "zod";

import {
	normalizeBlogToc,
	type BlogTocEntry,
} from "@/features/blog/lib/blog-toc";
import {
	generateBlogStaticParams,
	getBlogPagePath,
	getBlogPageSegments,
	getBlogSourcePath,
} from "@/features/blog/server/page-paths";

const blogPostFrontmatterSchema = z
	.object({
		title: z.string().min(1),
		description: z.string().min(1),
		summary: z.string().min(1),
		publishedAt: z
			.string()
			.min(1)
			.refine((value) => !Number.isNaN(Date.parse(value)), {
				message: "publishedAt must be a valid ISO date string",
			}),
		authorName: z.string().min(1),
		authorRole: z.string().min(1),
		featured: z.boolean().optional(),
		draft: z.boolean().optional(),
		heroMediaKind: z.enum(["image", "video"]),
		heroMediaSrc: z.string().min(1),
		heroPosterSrc: z.string().min(1).optional(),
	})
	.superRefine((value, context) => {
		if (value.heroMediaKind === "video" && !value.heroPosterSrc) {
			context.addIssue({
				code: "custom",
				message: "heroPosterSrc is required when heroMediaKind is video",
				path: ["heroPosterSrc"],
			});
		}
	});

export type BlogPostSummary = z.infer<typeof blogPostFrontmatterSchema> & {
	slug: string[];
	href: string;
	sourcePath: string;
	readingTimeText?: string;
};

export type BlogPostRecord = BlogPostSummary & {
	toc: BlogTocEntry[];
	Content: ComponentType<{ params?: { slug?: string[] } }>;
};

function parseBlogPostFrontmatter(rawMetadata: unknown, slug: string[]) {
	try {
		return blogPostFrontmatterSchema.parse(rawMetadata);
	} catch (error) {
		throw new Error(
			`Invalid frontmatter for blog post "${slug.join("/")}": ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

function sortBlogPosts(posts: BlogPostSummary[]) {
	return [...posts].sort((leftPost, rightPost) => {
		if (Boolean(leftPost.featured) !== Boolean(rightPost.featured)) {
			return leftPost.featured ? -1 : 1;
		}

		return (
			new Date(rightPost.publishedAt).getTime() -
			new Date(leftPost.publishedAt).getTime()
		);
	});
}

const loadPublishedBlogPostSummaries = cache(async () => {
	const params = await generateBlogStaticParams();
	const posts: Array<BlogPostSummary | null> = await Promise.all(
		params.map(async ({ slug }) => {
			const { metadata } = await importPage(getBlogPageSegments(slug));
			const parsedMetadata = parseBlogPostFrontmatter(metadata, slug);

			if (parsedMetadata.draft) {
				return null;
			}

			return {
				...parsedMetadata,
				slug,
				href: getBlogPagePath(slug),
				sourcePath: getBlogSourcePath(slug),
				readingTimeText: metadata.readingTime?.text,
			} satisfies BlogPostSummary;
		}),
	);

	const publishedPosts = posts.filter(
		(post): post is BlogPostSummary => post !== null,
	);

	return sortBlogPosts(publishedPosts);
});

export async function getPublishedBlogPostSummaries() {
	return loadPublishedBlogPostSummaries();
}

const loadPublishedBlogPostBySlug = cache(async (slugKey: string) => {
	const slug = slugKey.split("/").filter(Boolean);

	try {
		const importedPage = await importPage(getBlogPageSegments(slug));
		const parsedMetadata = parseBlogPostFrontmatter(
			importedPage.metadata,
			slug,
		);

		if (parsedMetadata.draft) {
			return null;
		}

		return {
			...parsedMetadata,
			slug,
			href: getBlogPagePath(slug),
			sourcePath: getBlogSourcePath(slug),
			readingTimeText: importedPage.metadata.readingTime?.text,
			toc: normalizeBlogToc(importedPage.toc),
			Content: importedPage.default as ComponentType<{
				params?: { slug?: string[] };
			}>,
		} satisfies BlogPostRecord;
	} catch {
		return null;
	}
});

export async function getPublishedBlogPostBySlug(slug: string[]) {
	return loadPublishedBlogPostBySlug(slug.join("/"));
}
