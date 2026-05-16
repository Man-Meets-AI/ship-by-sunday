import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

vi.mock("server-only", () => ({}));

describe("public metadata routes", () => {
	it("does not ship a public docs route tree", () => {
		expect(
			existsSync(path.join(process.cwd(), "src/app/(marketing)/docs")),
		).toBe(false);
	});

	it("publishes crawl rules for public pages while blocking account and workspace routes", () => {
		const routeRules = robots();
		const sitemapUrl = routeRules.sitemap?.[0];
		const publicRules = routeRules.rules?.[0];

		expect(sitemapUrl).toContain("/sitemap.xml");
		expect(publicRules?.userAgent).toBe("*");
		expect(publicRules?.allow).toEqual([
			"/",
			"/starter",
			"/workers",
			"/worker-seal-team-6",
			"/blog",
		]);
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
		expect(publicRules?.allow).not.toContain("/docs");
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
		expect(urls).toContain(`${metadataBase}/worker-seal-team-6`);
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
});
