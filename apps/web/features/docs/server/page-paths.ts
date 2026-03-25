import path from "node:path";
import { fileURLToPath } from "node:url";

import { generateStaticParamsFor } from "nextra/pages";

const DOCS_ROOT_SEGMENT = "docs";
const DOCS_CONTENT_ROOT = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../../content/docs",
);

const generateAllStaticParams = generateStaticParamsFor("mdxPath");

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
	const params = await generateAllStaticParams();

	return params
		.map((entry) => {
			const rawSegments = entry.mdxPath;
			const segments = Array.isArray(rawSegments)
				? rawSegments
				: rawSegments
					? [rawSegments]
					: [];

			if (segments[0] !== DOCS_ROOT_SEGMENT) {
				return null;
			}

			const childSegments = segments.slice(1);
			return childSegments.length === 0
				? { mdxPath: [] }
				: { mdxPath: childSegments };
		})
		.filter((value): value is { mdxPath: string[] } => value !== null);
}
