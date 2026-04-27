import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
	getBlogIndexStructuredData,
	getBlogPostStructuredData,
} from "@/app/blog/_lib/blog-structured-data";

const blogPostFixture = {
	title: "The operating system beats the prompt",
	description:
		"Why the fastest weekend builds start with durable product truth instead of another blank AI chat.",
	summary:
		"Strong prompts help. Durable product truth helps more. This first editorial lays out why Ship by Sunday starts with file-shaped context before it asks AI tools to execute.",
	publishedAt: "2026-03-26",
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
