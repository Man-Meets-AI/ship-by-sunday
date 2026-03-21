import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import NotFound from "@/app/not-found";

describe("app not-found route", () => {
	it("renders the branded workspace 404", () => {
		const markup = renderToStaticMarkup(<NotFound />);

		expect(markup).toContain("Page not found");
		expect(markup).toContain("Open mission");
		expect(markup).toContain("Go home");
	});
});
