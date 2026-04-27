import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type PublicContentRoute = {
	pathname: string;
	sourcePath: string;
	lastModified?: Date;
};

const webRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../..",
);
const docsContentRoot = path.join(webRoot, "content/docs");
const blogContentRoot = path.join(webRoot, "content/blog");

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

function getMdxSegments(contentRoot: string, sourcePath: string) {
	const relativePath = path.relative(contentRoot, sourcePath);
	const parsedPath = path.parse(relativePath);
	const routePath = path.join(parsedPath.dir, parsedPath.name);
	if (routePath === "index") {
		return [];
	}

	return routePath.split(path.sep).filter(Boolean);
}

function parseFrontmatterValue(value: string) {
	const trimmed = value.trim();
	if (trimmed === "true") {
		return true;
	}
	if (trimmed === "false") {
		return false;
	}

	return trimmed.replace(/^["']|["']$/g, "");
}

function parseFrontmatter(rawContent: string) {
	if (!rawContent.startsWith("---\n")) {
		return {};
	}

	const endIndex = rawContent.indexOf("\n---", 4);
	if (endIndex < 0) {
		return {};
	}

	return rawContent
		.slice(4, endIndex)
		.split("\n")
		.reduce<Record<string, unknown>>((frontmatter, line) => {
			const separatorIndex = line.indexOf(":");
			if (separatorIndex < 0) {
				return frontmatter;
			}

			const key = line.slice(0, separatorIndex).trim();
			if (!key) {
				return frontmatter;
			}

			frontmatter[key] = parseFrontmatterValue(line.slice(separatorIndex + 1));
			return frontmatter;
		}, {});
}

function createPathname(rootSegment: string, segments: string[]) {
	if (segments.length === 0) {
		return `/${rootSegment}`;
	}

	return `/${rootSegment}/${segments.join("/")}`;
}

async function createPublicContentRoute(
	rootSegment: string,
	contentRoot: string,
	sourcePath: string,
): Promise<PublicContentRoute> {
	return {
		pathname: createPathname(
			rootSegment,
			getMdxSegments(contentRoot, sourcePath),
		),
		sourcePath,
		lastModified: await getLastModified(sourcePath),
	};
}

export async function getDocsSitemapRoutes() {
	const sourcePaths = await listMdxFiles(docsContentRoot);
	return await Promise.all(
		sourcePaths.map((sourcePath) =>
			createPublicContentRoute("docs", docsContentRoot, sourcePath),
		),
	);
}

export async function getPublishedBlogSitemapRoutes() {
	const sourcePaths = await listMdxFiles(blogContentRoot);
	const routes = await Promise.all(
		sourcePaths.map(async (sourcePath) => {
			const content = await readFile(sourcePath, "utf8");
			const frontmatter = parseFrontmatter(content);
			if (frontmatter.draft === true) {
				return null;
			}

			return await createPublicContentRoute(
				"blog",
				blogContentRoot,
				sourcePath,
			);
		}),
	);

	return routes.filter((route): route is PublicContentRoute => route !== null);
}

export async function getPublicFileLastModified(relativePath: string) {
	return await getLastModified(path.join(webRoot, relativePath));
}
