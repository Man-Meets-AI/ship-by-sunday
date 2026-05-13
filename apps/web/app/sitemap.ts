import { MetadataRoute } from "next";

import {
	getPublicFileLastModified,
	getPublishedBlogSitemapRoutes,
} from "./_metadata/content-route-index";
import { getMetadataBase } from "@/platform/next/metadata-base";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = getMetadataBase();

	const [
		blogRoutes,
		homeLastModified,
		starterLastModified,
		workersLastModified,
		blogIndexLastModified,
	] = await Promise.all([
		getPublishedBlogSitemapRoutes(),
		getPublicFileLastModified("app/page.tsx"),
		getPublicFileLastModified("app/starter/page.tsx"),
		getPublicFileLastModified("app/workers/page.tsx"),
		getPublicFileLastModified("app/blog/[[...slug]]/page.tsx"),
	]);
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
			url: new URL("/starter", baseUrl).toString(),
			changeFrequency: "weekly",
			priority: 0.9,
			lastModified: starterLastModified,
		},
		{
			url: new URL("/workers", baseUrl).toString(),
			changeFrequency: "weekly",
			priority: 0.9,
			lastModified: workersLastModified,
		},
		{
			url: new URL("/blog", baseUrl).toString(),
			changeFrequency: "weekly",
			priority: 0.8,
			lastModified: blogIndexLastModified,
		},
		...blogEntries,
	];
}
