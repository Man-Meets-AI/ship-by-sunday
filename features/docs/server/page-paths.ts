import { generateStaticParamsFor } from "nextra/pages";

const DOCS_ROOT_SEGMENT = "docs";

const generateAllStaticParams = generateStaticParamsFor("mdxPath");

export function getDocsPageSegments(mdxPath?: string[]) {
	return [DOCS_ROOT_SEGMENT, ...(mdxPath ?? [])];
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
