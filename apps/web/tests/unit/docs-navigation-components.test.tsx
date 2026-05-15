import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

import { DocsArticle } from "@/app/(marketing)/docs/_components/docs-article";
import { DocsFooter } from "@/app/(marketing)/docs/_components/docs-footer";
import { DocsNavbar } from "@/app/(marketing)/docs/_components/docs-navbar";
import { DocsSidebar } from "@/app/(marketing)/docs/_components/docs-sidebar";
import { DocsTableOfContents } from "@/app/(marketing)/docs/_components/docs-table-of-contents";

vi.mock("next/navigation", () => ({
	usePathname: () => "/docs/local-setup",
}));

vi.mock("@/app/(marketing)/docs/_components/docs-theme-toggle", () => ({
	DocsThemeToggle: () => <button type="button">Theme</button>,
}));

describe("docs navigation components", () => {
	it("marks the active sidebar page without leaking source paths", () => {
		const markup = renderToStaticMarkup(
			<DocsSidebar
				entries={[
					{
						kind: "page",
						key: "index",
						title: "Start Here",
						pathname: "/docs",
					},
					{
						kind: "page",
						key: "local-setup",
						title: "Local setup",
						pathname: "/docs/local-setup",
					},
				]}
			/>,
		);

		expect(markup).toContain('aria-current="page"');
		expect(markup).toContain("/docs/local-setup");
		expect(markup).not.toContain("content/docs");
	});

	it("renders inventory headings as table-of-contents anchors", () => {
		const markup = renderToStaticMarkup(
			<DocsTableOfContents
				headings={[
					{
						id: "install-tools",
						depth: 2,
						text: "Install tools",
					},
					{
						id: "run-the-app",
						depth: 3,
						text: "Run the app",
					},
				]}
			/>,
		);

		expect(markup).toContain('href="#install-tools"');
		expect(markup).toContain("sbs-docs-toc-depth-3");
	});

	it("uses the public sans chrome instead of old wordmark and serif docs rules", () => {
		const navMarkup = renderToStaticMarkup(<DocsNavbar />);
		const footerMarkup = renderToStaticMarkup(<DocsFooter />);
		const articleMarkup = renderToStaticMarkup(
			<DocsArticle
				entry={{
					kind: "docs",
					segments: [],
					pathname: "/docs",
					title: "Start Here",
					description: "Docs index.",
					sourcePath: "content/docs/index.mdx",
					lastModified: new Date("2026-05-15T00:00:00.000Z"),
					headings: [],
				}}
			>
				<h1>Start Here</h1>
			</DocsArticle>,
		);
		const docsThemeCss = readFileSync(
			new URL(
				"../../src/app/(marketing)/docs/_styles/docs-theme.css",
				import.meta.url,
			),
			"utf8",
		);

		expect(navMarkup).toContain("Man Meets AI");
		expect(footerMarkup).not.toContain("font-product-wordmark");
		expect(articleMarkup).toContain("sbs-docs-article");
		expect(docsThemeCss).not.toContain("font-instrument-serif");
		expect(docsThemeCss).not.toContain("Times New Roman");
		expect(docsThemeCss).toContain("var(--font-sans)");
	});
});
