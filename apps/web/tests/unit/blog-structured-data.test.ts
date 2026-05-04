import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
	getBlogIndexStructuredData,
	getBlogPostStructuredData,
} from "@/app/blog/_lib/blog-structured-data";

const blogPostFixture = {
	title: "What Ship by Sunday does",
	description:
		"Ship by Sunday turns a rough product idea into product truth, agent-ready packs, and a starter path builders can keep using after the first weekend.",
	summary:
		"Ship by Sunday is a codebase-first shipping system: it captures the product truth, generates agent-ready packs, and gives builders a repo-shaped path for turning AI work into a real product.",
	publishedAt: "2026-04-27",
	authorName: "Parker Rex",
	authorRole: "Founder, Ship by Sunday",
	featured: true,
	heroMediaKind: "image" as const,
	heroMediaSrc: "/blog/editorial-surface.svg",
	href: "/blog/the-operating-system-beats-the-prompt",
	slug: ["the-operating-system-beats-the-prompt"],
	sourcePath:
		"/Users/parkerrex/Projects/ship-by-sunday/apps/web/content/blog/the-operating-system-beats-the-prompt.mdx",
	readingTimeText: "3 min read",
};

describe("blog structured data", () => {
	it("emits blog-level json-ld for the editorial index", () => {
		const structuredData = getBlogIndexStructuredData([blogPostFixture]);

		expect(structuredData).toContain('"@type":"Blog"');
		expect(structuredData).toContain('"@type":"BlogPosting"');
		expect(structuredData).toContain(
			"/blog/the-operating-system-beats-the-prompt",
		);
	});

	it("emits blog posting json-ld for an article", () => {
		const structuredData = getBlogPostStructuredData(blogPostFixture);

		expect(structuredData).toContain('"@type":"BlogPosting"');
		expect(structuredData).toContain('"@type":"BreadcrumbList"');
		expect(structuredData).toContain('"articleSection":"Journal"');
		expect(structuredData).toContain(
			"/blog/the-operating-system-beats-the-prompt",
		);
	});
});
