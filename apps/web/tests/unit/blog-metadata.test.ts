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
			title: "What Ship by Sunday does",
			description:
				"Ship by Sunday turns a rough product idea into product truth, an agent-ready Codebase, and a build path builders can keep using after the first weekend.",
			summary:
				"Ship by Sunday is a codebase-first shipping system: it captures product truth, generates an agent-ready Codebase, and gives builders a durable path for turning AI work into a real product.",
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
		};
		const metadata = buildBlogPostMetadata(post);

		expect(metadata.alternates?.canonical).toBe(
			"/blog/the-operating-system-beats-the-prompt",
		);
		expect(metadata.openGraph?.type).toBe("article");
		expect(metadata.openGraph?.url).toBe(
			"/blog/the-operating-system-beats-the-prompt",
		);
		expect(metadata.openGraph?.title).toBe("What Ship by Sunday does");
		expect(metadata.twitter?.title).toBe("What Ship by Sunday does");
	});
});
