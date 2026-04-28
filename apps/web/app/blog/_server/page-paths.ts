import path from "node:path";
import { fileURLToPath } from "node:url";

const BLOG_ROOT_SEGMENT = "blog";
const BLOG_CONTENT_ROOT = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../../content/blog",
);

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
	const { getPublishedBlogContentEntries } =
		await import("@/app/_content/public-content-inventory");
	const entries = await getPublishedBlogContentEntries();

	return entries.map((entry) => ({
		slug: entry.slug,
	}));
}
