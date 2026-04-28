import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
	getDocsContentEntries,
	getPublishedBlogContentEntries,
} from "@/app/_content/public-content-inventory";

type PublicContentRoute = {
	pathname: string;
	sourcePath: string;
	lastModified?: Date;
};

const webRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../..",
);

async function getLastModified(sourcePath: string) {
	try {
		const file = await stat(sourcePath);
		return file.mtime;
	} catch {
		return undefined;
	}
}

function createPublicContentRoute(params: {
	lastModified?: Date;
	pathname: string;
	sourcePath: string;
}): PublicContentRoute {
	return {
		pathname: params.pathname,
		sourcePath: params.sourcePath,
		lastModified: params.lastModified,
	};
}

export async function getDocsSitemapRoutes() {
	const entries = await getDocsContentEntries();
	return entries.map(createPublicContentRoute);
}

export async function getPublishedBlogSitemapRoutes() {
	const entries = await getPublishedBlogContentEntries();
	return entries.map(createPublicContentRoute);
}

export async function getPublicFileLastModified(relativePath: string) {
	return await getLastModified(path.join(webRoot, relativePath));
}
