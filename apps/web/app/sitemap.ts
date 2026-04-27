import { MetadataRoute } from "next";

import {
	getDocsSitemapRoutes,
	getPublicFileLastModified,
	getPublishedBlogSitemapRoutes,
} from "./_metadata/content-route-index";
import { getMetadataBase } from "@/platform/next/metadata-base";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = getMetadataBase();

	const [docsRoutes, blogRoutes, homeLastModified, blogIndexLastModified] =
		await Promise.all([
			getDocsSitemapRoutes(),
			getPublishedBlogSitemapRoutes(),
			getPublicFileLastModified("app/page.tsx"),
			getPublicFileLastModified("app/blog/[[...slug]]/page.tsx"),
		]);
	const docsEntries = docsRoutes.map((route) => ({
		url: new URL(route.pathname, baseUrl).toString(),
		changeFrequency: "weekly" as const,
		priority: 0.7,
		lastModified: route.lastModified,
	}));
	const blogEntries = blogRoutes.map((route) => ({
		url: new URL(route.pathname, baseUrl).toString(),
		changeFrequency: "monthly" as const,
		priority: 0.72,
		lastModified: route.lastModified,
	}));

	return [
		{
			url: new URL("/", baseUrl).toString(),
			changeFrequency: "daily",
			priority: 1,
			lastModified: homeLastModified,
		},
		{
			url: new URL("/blog", baseUrl).toString(),
			changeFrequency: "weekly",
			priority: 0.8,
			lastModified: blogIndexLastModified,
		},
		...blogEntries,
		...docsEntries,
	];
}
