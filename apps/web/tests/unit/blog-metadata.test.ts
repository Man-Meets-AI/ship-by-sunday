import { describe, expect, it } from "vitest";

import {
	buildBlogIndexMetadata,
	buildBlogPostMetadata,
	getBlogMetadataDefaults,
} from "@/app/blog/_lib/blog-metadata";

describe("blog metadata helpers", () => {
	it("provides canonical and social defaults for the blog landing page", () => {
		const metadata = getBlogMetadataDefaults();
		const indexMetadata = buildBlogIndexMetadata();

		expect(metadata.alternates?.canonical).toBe("/blog");
		expect(indexMetadata.alternates?.canonical).toBe("/blog");
		expect(indexMetadata.openGraph?.url).toBe("/blog");
		expect(indexMetadata.openGraph?.type).toBe("website");
		expect(indexMetadata.twitter?.card).toBe("summary_large_image");
	});

	it("emits article metadata for the published blog post", () => {
		const post = {
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
		};
		const metadata = buildBlogPostMetadata(post);

		expect(metadata.alternates?.canonical).toBe(
			"/blog/the-operating-system-beats-the-prompt",
		);
		expect(metadata.openGraph?.type).toBe("article");
		expect(metadata.openGraph?.url).toBe(
			"/blog/the-operating-system-beats-the-prompt",
		);
		expect(metadata.openGraph?.title).toBe(
			"The operating system beats the prompt",
		);
		expect(metadata.twitter?.title).toBe(
			"The operating system beats the prompt",
		);
	});
});
