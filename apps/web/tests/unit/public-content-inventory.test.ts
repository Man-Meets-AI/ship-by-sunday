import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
	getAllBlogContentEntries,
	getPublishedBlogContentEntries,
} from "@/app/_content/public-content-inventory";

describe("public content inventory", () => {
	it("discovers blog content with frontmatter, draft filtering, and headings", async () => {
		const allEntries = await getAllBlogContentEntries();
		const publishedEntries = await getPublishedBlogContentEntries();

		expect(allEntries).toHaveLength(2);
		expect(publishedEntries).toHaveLength(2);
		expect(publishedEntries[0]).toMatchObject({
			kind: "blog",
			slug: ["the-operating-system-beats-the-prompt"],
			pathname: "/blog/the-operating-system-beats-the-prompt",
			title: "What Ship by Sunday does",
			publishedAt: "2026-04-27",
			authorName: "Parker Rex",
			featured: true,
			heroMediaKind: "image",
			heroMediaSrc: "/blog/editorial-surface.svg",
		});
		expect(publishedEntries[0]?.sourcePath).toContain(
			"content/blog/the-operating-system-beats-the-prompt.mdx",
		);
		expect(publishedEntries[0]?.lastModified).toBeInstanceOf(Date);
		expect(publishedEntries[0]?.headings).toContainEqual({
			id: "it-starts-by-locking-the-product-truth",
			depth: 2,
			text: "It starts by locking the product truth",
		});
		expect(publishedEntries[1]).toMatchObject({
			kind: "blog",
			slug: ["starter-and-workers-are-different-jobs"],
			pathname: "/blog/starter-and-workers-are-different-jobs",
			title: "Starter and Workers are different jobs",
			publishedAt: "2026-05-13",
			authorName: "Parker Rex",
			featured: false,
			heroMediaKind: "image",
			heroMediaSrc: "/blog/editorial-surface.svg",
		});
		expect(publishedEntries[1]?.headings).toContainEqual({
			id: "starter-starts-before-the-repo-is-real",
			depth: 2,
			text: "Starter starts before the repo is real",
		});
	});
});
