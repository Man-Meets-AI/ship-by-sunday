import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
	getAllBlogContentEntries,
	getDocsContentEntries,
	getDocsNavigationEntries,
	getPublishedBlogContentEntries,
} from "@/app/_content/public-content-inventory";

function getNavigationEntryByKey(
	entries: Awaited<ReturnType<typeof getDocsNavigationEntries>>,
	key: string,
) {
	return entries.find((entry) => entry.key === key);
}

describe("public content inventory", () => {
	it("discovers docs pages with frontmatter, route paths, source paths, and headings", async () => {
		const entries = await getDocsContentEntries();
		const docsPaths = entries.map((entry) => entry.pathname);

		expect(entries).toHaveLength(33);
		expect(docsPaths).toContain("/docs");
		expect(docsPaths).toContain("/docs/local-setup");
		expect(docsPaths).toContain("/docs/troubleshooting/access");
		expect(docsPaths).not.toContain("/docs/troubleshooting");

		const localSetup = entries.find(
			(entry) => entry.pathname === "/docs/local-setup",
		);
		expect(localSetup).toMatchObject({
			kind: "docs",
			segments: ["local-setup"],
			title: "Local Setup",
			description:
				"Boot the starter locally in the right order so auth, payments, and protected access do not drift out of sync.",
		});
		expect(localSetup?.sourcePath).toContain("content/docs/local-setup.mdx");
		expect(localSetup?.lastModified).toBeInstanceOf(Date);
		expect(localSetup?.headings).toContainEqual({
			id: "before-you-start",
			depth: 2,
			text: "Before you start",
		});
	});

	it("models docs _meta ordering without treating separators as pages", async () => {
		const navigationEntries = await getDocsNavigationEntries();

		expect(navigationEntries[0]).toMatchObject({
			kind: "page",
			key: "index",
			title: "Start Here",
			pathname: "/docs",
		});
		expect(navigationEntries[1]).toMatchObject({
			kind: "separator",
			key: "getRunning",
			title: "Get Running",
		});

		const troubleshooting = getNavigationEntryByKey(
			navigationEntries,
			"troubleshooting",
		);
		expect(troubleshooting).toMatchObject({
			kind: "section",
			key: "troubleshooting",
			title: "Troubleshooting",
			segments: ["troubleshooting"],
		});
		expect(
			troubleshooting?.kind === "section"
				? troubleshooting.children[0]
				: undefined,
		).toMatchObject({
			kind: "page",
			key: "access",
			title: "Access Issues",
			pathname: "/docs/troubleshooting/access",
		});
	});

	it("discovers blog content with frontmatter, draft filtering, and headings", async () => {
		const allEntries = await getAllBlogContentEntries();
		const publishedEntries = await getPublishedBlogContentEntries();

		expect(allEntries).toHaveLength(1);
		expect(publishedEntries).toHaveLength(1);
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
	});
});
