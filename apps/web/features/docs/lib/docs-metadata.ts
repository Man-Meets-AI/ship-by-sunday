import type { Metadata } from "next";

import { getDocsPagePath } from "@/features/docs/server/page-paths";
import { docsDisplayConfig } from "@/config/starter-selectors";

const docsSiteName = docsDisplayConfig.siteName;
const docsDescription = docsDisplayConfig.description;

function resolveMetadataTitle(title: Metadata["title"], fallback: string) {
	if (typeof title === "string") {
		return title;
	}

	if (!title || typeof title !== "object") {
		return fallback;
	}

	if ("absolute" in title && typeof title.absolute === "string") {
		return title.absolute;
	}

	if ("default" in title && typeof title.default === "string") {
		return title.default;
	}

	return fallback;
}

function resolveMetadataDescription(description: Metadata["description"]) {
	return typeof description === "string" ? description : docsDescription;
}

export function buildDocsMetadata({
	mdxPath,
	metadata,
}: {
	mdxPath?: string[];
	metadata?: Metadata;
}): Metadata {
	const canonicalPath = getDocsPagePath(mdxPath);
	const description = resolveMetadataDescription(metadata?.description);
	const title = resolveMetadataTitle(
		metadata?.title,
		mdxPath?.length ? docsSiteName : "Start Here",
	);

	return {
		...metadata,
		description,
		alternates: {
			...metadata?.alternates,
			canonical: canonicalPath,
		},
		openGraph: {
			...metadata?.openGraph,
			type: "article",
			url: canonicalPath,
			siteName: docsSiteName,
			title,
			description,
			images: metadata?.openGraph?.images ?? [
				{
					url: "/opengraph-image",
					alt: `${docsSiteName} preview`,
				},
			],
		},
		twitter: {
			...metadata?.twitter,
			card: "summary_large_image",
			title,
			description,
			images: metadata?.twitter?.images ?? ["/twitter-image"],
		},
	};
}

export function getDocsMetadataDefaults(): Metadata {
	return buildDocsMetadata({
		metadata: {
			title: {
				default: docsSiteName,
				template: `%s | ${docsSiteName}`,
			},
			description: docsDescription,
		},
	});
}
