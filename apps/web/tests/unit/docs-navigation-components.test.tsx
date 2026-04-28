import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { DocsSidebar } from "@/app/docs/_components/docs-sidebar";
import { DocsTableOfContents } from "@/app/docs/_components/docs-table-of-contents";

vi.mock("next/navigation", () => ({
	usePathname: () => "/docs/local-setup",
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
});
