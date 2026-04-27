import path from "node:path";
import { fileURLToPath } from "node:url";

import { generateStaticParamsFor } from "nextra/pages";

const BLOG_ROOT_SEGMENT = "blog";
const BLOG_CONTENT_ROOT = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../../content/blog",
);

const generateAllStaticParams = generateStaticParamsFor("slug");

export function normalizeBlogSlug(slug?: string[]) {
	return slug && slug.length > 0 ? slug : [];
}

export function getBlogPageSegments(slug?: string[]) {
	return [BLOG_ROOT_SEGMENT, ...normalizeBlogSlug(slug)];
}

export function getBlogPagePath(slug?: string[]) {
	const normalizedSlug = normalizeBlogSlug(slug);

	if (normalizedSlug.length === 0) {
		return `/${BLOG_ROOT_SEGMENT}`;
	}

	return `/${BLOG_ROOT_SEGMENT}/${normalizedSlug.join("/")}`;
}

export function getBlogSourcePath(slug: string[]) {
	return path.join(BLOG_CONTENT_ROOT, `${slug.join("/")}.mdx`);
}

export async function generateBlogStaticParams() {
	const params = await generateAllStaticParams();

	return params
		.map((entry) => {
			const rawSegments = entry.slug;
			const segments = Array.isArray(rawSegments)
				? rawSegments
				: rawSegments
					? [rawSegments]
					: [];

			if (segments[0] !== BLOG_ROOT_SEGMENT) {
				return null;
			}

			const slug = segments.slice(1);
			return slug.length > 0 ? { slug } : null;
		})
		.filter((value): value is { slug: string[] } => value !== null);
}
