import "server-only";

import type { ComponentType } from "react";

import {
	getAllBlogContentEntries,
	type BlogContentEntry,
} from "@/app/_content/public-content-inventory";

type BlogMdxModule = {
	default: ComponentType<{ params?: { slug?: string[] } }>;
};

type BlogMdxModuleLoader = () => Promise<BlogMdxModule>;

export type BlogContentPageModel = {
	entry: BlogContentEntry;
	Content: ComponentType<{ params?: { slug?: string[] } }>;
};

const blogMdxModuleLoaders: Record<string, BlogMdxModuleLoader> = {
	"the-operating-system-beats-the-prompt": () =>
		import("@/content/blog/the-operating-system-beats-the-prompt.mdx") as Promise<BlogMdxModule>,
};

function createBlogSlugKey(slug: string[] = []) {
	return slug.join("/");
}

export async function getBlogContentEntry(slug: string[]) {
	const slugKey = createBlogSlugKey(slug);
	const entries = await getAllBlogContentEntries();

	return entries.find((entry) => createBlogSlugKey(entry.slug) === slugKey);
}

export async function getBlogContentPage(
	slug: string[],
): Promise<BlogContentPageModel | null> {
	const slugKey = createBlogSlugKey(slug);
	const loader = blogMdxModuleLoaders[slugKey];
	const entry = await getBlogContentEntry(slug);

	if (!loader || !entry) {
		return null;
	}

	const mdxModule = await loader();

	return {
		entry,
		Content: mdxModule.default,
	};
}

export function getBlogContentLoaderKeys() {
	return Object.keys(blogMdxModuleLoaders).sort();
}
