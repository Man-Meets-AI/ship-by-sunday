import { describe, expect, it, vi } from "vitest";

import { buildDocsMetadata } from "@/app/docs/_lib/docs-metadata";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

vi.mock("server-only", () => ({}));

describe("public metadata routes", () => {
	it("publishes crawl rules for public pages while blocking account and workspace routes", () => {
		const routeRules = robots();
		const sitemapUrl = routeRules.sitemap?.[0];
		const publicRules = routeRules.rules?.[0];

		expect(sitemapUrl).toContain("/sitemap.xml");
		expect(publicRules?.userAgent).toBe("*");
		expect(publicRules?.allow).toEqual(["/", "/starter", "/workers", "/blog"]);
		expect(publicRules?.disallow).toEqual(
			expect.arrayContaining([
				"/sign-in",
				"/sign-up",
				"/session-tasks",
				"/access-required",
				"/home",
				"/starter/home",
				"/starter/generate-codebase",
				"/starter/lessons",
				"/workers/setup",
				"/settings",
				"/workspace",
				"/checkout/",
				"/api/",
			]),
		);
		expect(publicRules?.disallow).not.toContain("/docs");
	});

	it("builds sitemap entries from lightweight public content metadata", async () => {
		const entries = await sitemap();
		const urls = entries.map((entry) => entry.url);
		const metadataBase = new URL(
			process.env.APP_BASE_URL?.trim() || "http://localhost:3000",
		).origin;

		expect(urls).toContain(`${metadataBase}/`);
		expect(urls).toContain(`${metadataBase}/starter`);
		expect(urls).toContain(`${metadataBase}/workers`);
		expect(urls).toContain(`${metadataBase}/blog`);
		expect(urls).not.toContain(`${metadataBase}/docs`);
		expect(urls).not.toContain(`${metadataBase}/docs/local-setup`);
		expect(urls).toContain(
			`${metadataBase}/blog/the-operating-system-beats-the-prompt`,
		);
		expect(urls).toContain(
			`${metadataBase}/blog/starter-and-workers-are-different-jobs`,
		);
	});

	it("marks direct-link docs metadata as unindexed support material", () => {
		const metadata = buildDocsMetadata({
			mdxPath: ["local-setup"],
			metadata: {
				title: "Local Setup",
				description: "Support docs for generated-codebase setup.",
			},
		});

		expect(metadata.alternates?.canonical).toBe("/docs/local-setup");
		expect(metadata.robots).toMatchObject({
			index: false,
			follow: false,
		});
	});
});
