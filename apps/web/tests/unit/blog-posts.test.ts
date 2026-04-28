import { describe, expect, it, vi } from "vitest";

import { getPublishedBlogContentEntries } from "@/app/_content/public-content-inventory";
import {
	getBlogContentLoaderKeys,
	getBlogContentEntry,
} from "@/app/blog/_server/blog-content";
import { normalizeBlogToc } from "@/app/blog/_lib/blog-toc";
import { getPublishedBlogPostSummaries } from "@/app/blog/_server/blog-posts";

vi.mock("server-only", () => ({}));

function createSlugKey(slug: string[]) {
	return slug.join("/");
}

describe("blog post loading", () => {
	it("has a direct MDX loader for every blog inventory entry", async () => {
		const entries = await getPublishedBlogContentEntries();

		expect(getBlogContentLoaderKeys()).toEqual(
			entries.map((entry) => createSlugKey(entry.slug)).sort(),
		);
	});

	it("builds published summaries from the app-owned inventory", async () => {
		const summaries = await getPublishedBlogPostSummaries();

		expect(summaries).toHaveLength(1);
		expect(summaries[0]).toMatchObject({
			title: "What Ship by Sunday does",
			href: "/blog/the-operating-system-beats-the-prompt",
			heroMediaKind: "image",
			heroMediaSrc: "/blog/editorial-surface.svg",
		});
		expect(summaries[0]?.readingTimeText).toBeUndefined();
	});

	it("normalizes blog TOC entries from inventory headings", async () => {
		const entry = await getBlogContentEntry([
			"the-operating-system-beats-the-prompt",
		]);

		expect(normalizeBlogToc(entry?.headings ?? [])).toEqual([
			{
				id: "it-starts-by-locking-the-product-truth",
				depth: 2,
				label: "It starts by locking the product truth",
			},
			{
				id: "it-turns-that-truth-into-agent-ready-packs",
				depth: 2,
				label: "It turns that truth into agent-ready packs",
			},
			{
				id: "it-gives-the-build-a-repo-shaped-path",
				depth: 2,
				label: "It gives the build a repo-shaped path",
			},
			{
				id: "the-goal-is-to-keep-shipping-after-the-weekend",
				depth: 2,
				label: "The goal is to keep shipping after the weekend",
			},
		]);
	});
});
