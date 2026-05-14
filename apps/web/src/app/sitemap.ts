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
		workerSealTeam6LastModified,
		blogIndexLastModified,
	] = await Promise.all([
		getPublishedBlogSitemapRoutes(),
		getPublicFileLastModified("app/(marketing)/page.tsx"),
		getPublicFileLastModified("app/(marketing)/starter/page.tsx"),
		getPublicFileLastModified("app/(marketing)/workers/page.tsx"),
		getPublicFileLastModified("app/(marketing)/worker-seal-team-6/page.tsx"),
		getPublicFileLastModified("app/(marketing)/blog/[[...slug]]/page.tsx"),
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
			url: new URL("/worker-seal-team-6", baseUrl).toString(),
			changeFrequency: "weekly",
			priority: 0.86,
			lastModified: workerSealTeam6LastModified,
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
