import { describe, expect, it, vi } from "vitest";

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
		expect(publicRules?.allow).toEqual(["/", "/docs", "/blog"]);
		expect(publicRules?.disallow).toEqual(
			expect.arrayContaining([
				"/sign-in",
				"/sign-up",
				"/session-tasks",
				"/access-required",
				"/blueprint",
				"/review",
				"/settings",
				"/checkout/",
				"/sso-callback",
				"/api/",
			]),
		);
	});

	it("builds sitemap entries from lightweight public content metadata", async () => {
		const entries = await sitemap();
		const urls = entries.map((entry) => entry.url);

		expect(urls).toContain("http://localhost:3000/");
		expect(urls).toContain("http://localhost:3000/blog");
		expect(urls).toContain("http://localhost:3000/docs/local-setup");
		expect(urls).toContain(
			"http://localhost:3000/blog/the-operating-system-beats-the-prompt",
		);
		expect(
			entries.find(
				(entry) => entry.url === "http://localhost:3000/docs/local-setup",
			)?.lastModified,
		).toBeInstanceOf(Date);
	});
});
