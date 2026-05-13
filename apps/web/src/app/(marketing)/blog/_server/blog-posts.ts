import "server-only";

import type { ComponentType } from "react";
import { cache } from "react";

import {
	getPublishedBlogContentEntries,
	type BlogContentEntry,
} from "@/app/_content/public-content-inventory";
import {
	normalizeBlogToc,
	type BlogTocEntry,
} from "@/app/(marketing)/blog/_lib/blog-toc";
import { getBlogPagePath } from "@/app/(marketing)/blog/_server/page-paths";
import { getBlogContentPage } from "@/app/(marketing)/blog/_server/blog-content";

export type BlogPostSummary = Pick<
	BlogContentEntry,
	| "title"
	| "description"
	| "summary"
	| "publishedAt"
	| "authorName"
	| "authorRole"
	| "featured"
	| "draft"
	| "heroMediaKind"
	| "heroMediaSrc"
	| "heroPosterSrc"
> & {
	slug: string[];
	href: string;
	sourcePath: string;
	readingTimeText?: string;
};

export type BlogPostRecord = BlogPostSummary & {
	toc: BlogTocEntry[];
	Content: ComponentType<{ params?: { slug?: string[] } }>;
};

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

function createBlogPostSummary(entry: BlogContentEntry): BlogPostSummary {
	return {
		title: entry.title,
		description: entry.description,
		summary: entry.summary,
		publishedAt: entry.publishedAt,
		authorName: entry.authorName,
		authorRole: entry.authorRole,
		featured: entry.featured,
		draft: entry.draft,
		heroMediaKind: entry.heroMediaKind,
		heroMediaSrc: entry.heroMediaSrc,
		heroPosterSrc: entry.heroPosterSrc,
		slug: entry.slug,
		href: getBlogPagePath(entry.slug),
		sourcePath: entry.sourcePath,
	};
}

const loadPublishedBlogPostSummaries = cache(async () => {
	const entries = await getPublishedBlogContentEntries();

	return sortBlogPosts(entries.map(createBlogPostSummary));
});

export async function getPublishedBlogPostSummaries() {
	return loadPublishedBlogPostSummaries();
}

const loadPublishedBlogPostBySlug = cache(async (slugKey: string) => {
	const slug = slugKey.split("/").filter(Boolean);
	const page = await getBlogContentPage(slug);

	if (!page || page.entry.draft) {
		return null;
	}

	return {
		...createBlogPostSummary(page.entry),
		toc: normalizeBlogToc(page.entry.headings),
		Content: page.Content,
	} satisfies BlogPostRecord;
});

export async function getPublishedBlogPostBySlug(slug: string[]) {
	return loadPublishedBlogPostBySlug(slug.join("/"));
}
