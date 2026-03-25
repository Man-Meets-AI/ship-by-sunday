import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

globalThis.React = React;

import { MissionExtrasRow } from "@/features/course/mission/components/mission/mission-extras-row";

describe("MissionExtrasRow", () => {
	it("keeps the bonus playlist visible while hiding the legacy starter-repo card by default", () => {
		const markup = renderToStaticMarkup(<MissionExtrasRow />);

		expect(markup).toContain("Product Management for Beginners");
		expect(markup).not.toContain("Starter Repo");
		expect(markup).not.toContain("starter repo");
	});
});
