import { describe, expect, it, vi } from "vitest";

vi.mock("nextra/pages", () => ({
	generateStaticParamsFor: () => async () => [
		{ slug: ["blog", "the-operating-system-beats-the-prompt"] },
		{ slug: ["docs", "local-setup"] },
		{ slug: ["blog"] },
	],
}));

import {
	generateBlogStaticParams,
	getBlogPagePath,
	getBlogPageSegments,
	getBlogSourcePath,
	normalizeBlogSlug,
} from "@/features/blog/server/page-paths";

describe("blog page paths", () => {
	it("builds the public route segments and source path for a post", () => {
		const slug = ["the-operating-system-beats-the-prompt"];

		expect(normalizeBlogSlug(undefined)).toEqual([]);
		expect(getBlogPageSegments(slug)).toEqual([
			"blog",
			"the-operating-system-beats-the-prompt",
		]);
		expect(getBlogPagePath()).toBe("/blog");
		expect(getBlogPagePath(slug)).toBe(
			"/blog/the-operating-system-beats-the-prompt",
		);
		expect(getBlogSourcePath(slug)).toContain(
			"content/blog/the-operating-system-beats-the-prompt.mdx",
		);
	});

	it("discovers blog content paths from the Nextra-managed content tree", async () => {
		await expect(generateBlogStaticParams()).resolves.toEqual([
			{
				slug: ["the-operating-system-beats-the-prompt"],
			},
		]);
	});

	it("filters non-blog routes and the programmatic index route", async () => {
		const params = await generateBlogStaticParams();

		expect(params).toContainEqual({
			slug: ["the-operating-system-beats-the-prompt"],
		});
		expect(params).not.toContainEqual({ slug: [] });
	});
});
