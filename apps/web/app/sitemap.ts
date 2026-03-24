import { stat } from "node:fs/promises";

import { MetadataRoute } from "next";

import { getMetadataBase } from "@/platform/next/metadata-base";
import {
	generateDocsStaticParams,
	getDocsPagePath,
	getDocsSourcePath,
} from "@/features/docs/server/page-paths";

async function getLastModified(pathname: string | URL) {
	try {
		const file = await stat(pathname);
		return file.mtime;
	} catch {
		return undefined;
	}
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = getMetadataBase();

	const docsPages = await generateDocsStaticParams();
	const homeLastModified = await getLastModified(
		new URL("../app/page.tsx", import.meta.url),
	);
	const docsEntries = await Promise.all(
		docsPages.map(async ({ mdxPath }) => ({
			url: new URL(getDocsPagePath(mdxPath), baseUrl).toString(),
			changeFrequency: "weekly" as const,
			priority: 0.7,
			lastModified: await getLastModified(getDocsSourcePath(mdxPath)),
		})),
	);

	return [
		{
			url: new URL("/", baseUrl).toString(),
			changeFrequency: "daily",
			priority: 1,
			lastModified: homeLastModified,
		},
		...docsEntries,
	];
}
