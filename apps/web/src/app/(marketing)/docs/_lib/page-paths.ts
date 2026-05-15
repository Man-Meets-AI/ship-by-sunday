import path from "node:path";
import { fileURLToPath } from "node:url";

const DOCS_ROOT_SEGMENT = "docs";
const DOCS_CONTENT_ROOT = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../../../content/docs",
);

export function getDocsPageSegments(mdxPath?: string[]) {
	return [DOCS_ROOT_SEGMENT, ...(mdxPath ?? [])];
}

export function getDocsPagePath(mdxPath?: string[]) {
	if (!mdxPath || mdxPath.length === 0) {
		return `/${DOCS_ROOT_SEGMENT}`;
	}

	return `/${DOCS_ROOT_SEGMENT}/${mdxPath.join("/")}`;
}

export function getDocsSourcePath(mdxPath?: string[]) {
	const sourceFile =
		!mdxPath || mdxPath.length === 0 ? "index.mdx" : `${mdxPath.join("/")}.mdx`;

	return path.join(DOCS_CONTENT_ROOT, sourceFile);
}

export async function generateDocsStaticParams() {
	const { getDocsContentEntries } =
		await import("@/app/_content/public-content-inventory");
	const entries = await getDocsContentEntries();

	return entries.map((entry) => ({
		mdxPath: entry.segments,
	}));
}
