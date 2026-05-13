import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
		children: React.ReactNode;
		href: string;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

import { DocsModuleDisabledState } from "@/app/(marketing)/docs/_components/docs-module-disabled-state";

describe("DocsModuleDisabledState", () => {
	it("renders the docs disabled fallback with a home action", () => {
		const markup = renderToStaticMarkup(<DocsModuleDisabledState />);

		expect(markup).toContain("Docs module");
		expect(markup).toContain("Docs disabled");
		expect(markup).toContain("public docs module turned off");
		expect(markup).toContain('href="/"');
		expect(markup).toContain("Go home");
	});
});
