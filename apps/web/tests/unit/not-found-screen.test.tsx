import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import NotFound from "@/app/not-found";

describe("app not-found route", () => {
	it("renders the T3 edge-surface 404", () => {
		const markup = renderToStaticMarkup(<NotFound />);

		expect(markup).toContain('data-slot="edge-route-page"');
		expect(markup).toContain('data-slot="edge-route-panel"');
		expect(markup).toContain("Page not found");
		expect(markup).toContain("Open home");
		expect(markup).toContain("Exit to safety");
		expect(markup).not.toContain("font-heading-serif");
		expect(markup).not.toContain("bg-ink");
	});
});
