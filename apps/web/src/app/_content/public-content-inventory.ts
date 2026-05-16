import "server-only";

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cache } from "react";

import {
	createPublicContentHeadingId,
	createUniquePublicContentHeadingId,
	stripPublicContentHeadingFormatting,
} from "@/app/_content/public-content-heading-ids";
import blogNavigationMeta from "@/content/blog/_meta";

export type PublicContentHeading = {
	id: string;
	depth: 2 | 3 | 4;
	text: string;
};

export type BlogContentEntry = {
	kind: "blog";
	slug: string[];
	pathname: string;
	sourcePath: string;
	title: string;
	description: string;
	summary: string;
	publishedAt: string;
	authorName: string;
	authorRole: string;
	featured?: boolean;
	draft?: boolean;
	heroMediaKind: "image" | "video";
	heroMediaSrc: string;
	heroPosterSrc?: string;
	headings: PublicContentHeading[];
	lastModified?: Date;
};

type FrontmatterValue = boolean | string;
type Frontmatter = Record<string, FrontmatterValue>;

const webRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../..",
);
const blogContentRoot = path.join(webRoot, "content/blog");

const blogNavigationMetaOrder = new Map(
	Object.keys(blogNavigationMeta as Record<string, { title?: string }>).map(
		(key, index) => [key, index],
	),
);

function createBlogPathname(segments: string[]) {
	if (segments.length === 0) {
		return "/blog";
	}

	return `/blog/${segments.join("/")}`;
}

async function getLastModified(sourcePath: string) {
	try {
		const file = await stat(sourcePath);
		return file.mtime;
	} catch {
		return undefined;
	}
}

async function listMdxFiles(directory: string): Promise<string[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const entryPath = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				return await listMdxFiles(entryPath);
			}

			return entry.isFile() && entry.name.endsWith(".mdx") ? [entryPath] : [];
		}),
	);

	return files.flat().sort((left, right) => left.localeCompare(right));
}

function getContentSegments(contentRoot: string, sourcePath: string) {
	const relativePath = path.relative(contentRoot, sourcePath);
	const parsedPath = path.parse(relativePath);
	const routePath = path.join(parsedPath.dir, parsedPath.name);
	const segments = routePath.split(path.sep).filter(Boolean);

	if (segments.length === 1 && segments[0] === "index") {
		return [];
	}

	if (segments.at(-1) === "index") {
		return segments.slice(0, -1);
	}

	return segments;
}

function parseFrontmatterValue(
	sourcePath: string,
	key: string,
	rawValue: string,
) {
	const trimmed = rawValue.trim();
	if (trimmed === "true") {
		return true;
	}
	if (trimmed === "false") {
		return false;
	}
	if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
		throw new Error(
			`Unsupported frontmatter value for "${key}" in ${sourcePath}: only scalar strings and booleans are supported.`,
		);
	}
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		return trimmed.slice(1, -1);
	}

	return trimmed;
}

function parseFrontmatter(sourcePath: string, rawContent: string) {
	const match = rawContent.match(/^---\n([\s\S]*?)\n---\n?/);
	if (!match) {
		throw new Error(`Missing frontmatter block in ${sourcePath}.`);
	}

	const frontmatterSource = match[1] ?? "";
	const frontmatter: Frontmatter = {};
	for (const line of frontmatterSource.split("\n")) {
		if (line.trim() === "") {
			continue;
		}

		const separatorIndex = line.indexOf(":");
		if (separatorIndex < 0) {
			throw new Error(`Unsupported frontmatter line in ${sourcePath}: ${line}`);
		}

		const key = line.slice(0, separatorIndex).trim();
		if (!key) {
			throw new Error(`Empty frontmatter key in ${sourcePath}.`);
		}
		if (Object.hasOwn(frontmatter, key)) {
			throw new Error(`Duplicate frontmatter key "${key}" in ${sourcePath}.`);
		}

		frontmatter[key] = parseFrontmatterValue(
			sourcePath,
			key,
			line.slice(separatorIndex + 1),
		);
	}

	return {
		content: rawContent.slice(match[0].length),
		frontmatter,
	};
}

function requireFrontmatterString(
	frontmatter: Frontmatter,
	key: string,
	sourcePath: string,
) {
	const value = frontmatter[key];
	if (typeof value !== "string" || value.trim() === "") {
		throw new Error(
			`Invalid frontmatter for ${sourcePath}: "${key}" must be a non-empty string.`,
		);
	}

	return value;
}

function requireOptionalFrontmatterBoolean(
	frontmatter: Frontmatter,
	key: string,
	sourcePath: string,
) {
	const value = frontmatter[key];
	if (value === undefined) {
		return undefined;
	}
	if (typeof value !== "boolean") {
		throw new Error(
			`Invalid frontmatter for ${sourcePath}: "${key}" must be a boolean when present.`,
		);
	}

	return value;
}

function validateHeroMediaKind(value: string, sourcePath: string) {
	if (value === "image" || value === "video") {
		return value;
	}

	throw new Error(
		`Invalid frontmatter for ${sourcePath}: "heroMediaKind" must be "image" or "video".`,
	);
}

function extractHeadings(rawContent: string) {
	const headings: PublicContentHeading[] = [];
	const headingCountsById = new Map<string, number>();
	let insideFence = false;

	for (const line of rawContent.split("\n")) {
		if (line.trimStart().startsWith("```")) {
			insideFence = !insideFence;
			continue;
		}
		if (insideFence) {
			continue;
		}

		const headingMatch = line.match(/^(#{2,4})\s+(.+?)\s*#*\s*$/);
		if (!headingMatch) {
			continue;
		}

		const text = stripPublicContentHeadingFormatting(headingMatch[2] ?? "");
		if (!text) {
			continue;
		}

		const baseId = createPublicContentHeadingId(text);
		if (!baseId) {
			continue;
		}

		headings.push({
			id: createUniquePublicContentHeadingId({
				baseId,
				headingCountsById,
			}),
			depth: headingMatch[1]?.length as 2 | 3 | 4,
			text,
		});
	}

	return headings;
}

async function createBlogContentEntry(
	sourcePath: string,
): Promise<BlogContentEntry> {
	const rawContent = await readFile(sourcePath, "utf8");
	const { content, frontmatter } = parseFrontmatter(sourcePath, rawContent);
	const slug = getContentSegments(blogContentRoot, sourcePath);
	const heroMediaKind = validateHeroMediaKind(
		requireFrontmatterString(frontmatter, "heroMediaKind", sourcePath),
		sourcePath,
	);
	const heroPosterSrc = frontmatter.heroPosterSrc;

	if (heroPosterSrc !== undefined && typeof heroPosterSrc !== "string") {
		throw new Error(
			`Invalid frontmatter for ${sourcePath}: "heroPosterSrc" must be a string when present.`,
		);
	}
	if (heroMediaKind === "video" && !heroPosterSrc) {
		throw new Error(
			`Invalid frontmatter for ${sourcePath}: "heroPosterSrc" is required when "heroMediaKind" is "video".`,
		);
	}

	const publishedAt = requireFrontmatterString(
		frontmatter,
		"publishedAt",
		sourcePath,
	);
	if (Number.isNaN(Date.parse(publishedAt))) {
		throw new Error(
			`Invalid frontmatter for ${sourcePath}: "publishedAt" must be a valid date string.`,
		);
	}

	return {
		kind: "blog",
		slug,
		pathname: createBlogPathname(slug),
		sourcePath,
		title: requireFrontmatterString(frontmatter, "title", sourcePath),
		description: requireFrontmatterString(
			frontmatter,
			"description",
			sourcePath,
		),
		summary: requireFrontmatterString(frontmatter, "summary", sourcePath),
		publishedAt,
		authorName: requireFrontmatterString(frontmatter, "authorName", sourcePath),
		authorRole: requireFrontmatterString(frontmatter, "authorRole", sourcePath),
		featured: requireOptionalFrontmatterBoolean(
			frontmatter,
			"featured",
			sourcePath,
		),
		draft: requireOptionalFrontmatterBoolean(frontmatter, "draft", sourcePath),
		heroMediaKind,
		heroMediaSrc: requireFrontmatterString(
			frontmatter,
			"heroMediaSrc",
			sourcePath,
		),
		heroPosterSrc,
		headings: extractHeadings(content),
		lastModified: await getLastModified(sourcePath),
	};
}

function sortBlogEntriesByPublishState(entries: BlogContentEntry[]) {
	return [...entries].sort((leftEntry, rightEntry) => {
		if (Boolean(leftEntry.featured) !== Boolean(rightEntry.featured)) {
			return leftEntry.featured ? -1 : 1;
		}

		return (
			new Date(rightEntry.publishedAt).getTime() -
			new Date(leftEntry.publishedAt).getTime()
		);
	});
}

const loadAllBlogContentEntries = cache(async () => {
	const sourcePaths = await listMdxFiles(blogContentRoot);
	const entries = await Promise.all(sourcePaths.map(createBlogContentEntry));

	return entries.sort((leftEntry, rightEntry) => {
		const leftMetaIndex = blogNavigationMetaOrder.get(leftEntry.slug.join("/"));
		const rightMetaIndex = blogNavigationMetaOrder.get(
			rightEntry.slug.join("/"),
		);
		if (leftMetaIndex !== rightMetaIndex) {
			if (leftMetaIndex === undefined) {
				return 1;
			}
			if (rightMetaIndex === undefined) {
				return -1;
			}

			return leftMetaIndex - rightMetaIndex;
		}

		return leftEntry.pathname.localeCompare(rightEntry.pathname);
	});
});

export async function getAllBlogContentEntries() {
	return await loadAllBlogContentEntries();
}

export async function getPublishedBlogContentEntries() {
	return sortBlogEntriesByPublishState(
		(await getAllBlogContentEntries()).filter((entry) => !entry.draft),
	);
}
