import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

globalThis.React = React;

import { MissionExtrasRow } from "@/app/(workspace)/_components/course/mission/components/mission/mission-extras-row";

describe("MissionExtrasRow", () => {
	it("keeps the FULL TURBO bonus visible while hiding the legacy starter-repo card by default", () => {
		const markup = renderToStaticMarkup(<MissionExtrasRow />);

		expect(markup).toContain("FULL TURBO");
		expect(markup).not.toContain("Starter Repo");
		expect(markup).not.toContain("starter repo");
	});
});
