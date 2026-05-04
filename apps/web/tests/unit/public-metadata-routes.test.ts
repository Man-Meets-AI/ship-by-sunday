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
				"/codebase",
				"/review",
				"/settings",
				"/workspace",
				"/checkout/",
				"/sso-callback",
				"/api/",
			]),
		);
	});

	it("builds sitemap entries from lightweight public content metadata", async () => {
		const entries = await sitemap();
		const urls = entries.map((entry) => entry.url);
		const metadataBase = new URL(
			process.env.APP_BASE_URL?.trim() || "http://localhost:3000",
		).origin;

		expect(urls).toContain(`${metadataBase}/`);
		expect(urls).toContain(`${metadataBase}/blog`);
		expect(urls).toContain(`${metadataBase}/docs/local-setup`);
		expect(urls).toContain(
			`${metadataBase}/blog/the-operating-system-beats-the-prompt`,
		);
		expect(
			entries.find((entry) => entry.url === `${metadataBase}/docs/local-setup`)
				?.lastModified,
		).toBeInstanceOf(Date);
	});
});
