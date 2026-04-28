import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
	generateDocsStaticParams,
	getDocsPagePath,
	getDocsPageSegments,
	getDocsSourcePath,
} from "@/app/docs/_lib/page-paths";

describe("docs page paths", () => {
	it("builds public route segments and source paths for docs pages", () => {
		const mdxPath = ["troubleshooting", "access"];

		expect(getDocsPageSegments()).toEqual(["docs"]);
		expect(getDocsPageSegments(mdxPath)).toEqual([
			"docs",
			"troubleshooting",
			"access",
		]);
		expect(getDocsPagePath()).toBe("/docs");
		expect(getDocsPagePath(mdxPath)).toBe("/docs/troubleshooting/access");
		expect(getDocsSourcePath()).toContain("content/docs/index.mdx");
		expect(getDocsSourcePath(mdxPath)).toContain(
			"content/docs/troubleshooting/access.mdx",
		);
	});

	it("discovers docs content paths from the app-owned content inventory", async () => {
		const params = await generateDocsStaticParams();

		expect(params).toContainEqual({ mdxPath: [] });
		expect(params).toContainEqual({ mdxPath: ["local-setup"] });
		expect(params).toContainEqual({
			mdxPath: ["troubleshooting", "access"],
		});
	});

	it("does not create static params for docs navigation separators or non-page sections", async () => {
		const params = await generateDocsStaticParams();

		expect(params).not.toContainEqual({ mdxPath: ["getRunning"] });
		expect(params).not.toContainEqual({ mdxPath: ["buildYourProduct"] });
		expect(params).not.toContainEqual({ mdxPath: ["troubleshooting"] });
	});
});
