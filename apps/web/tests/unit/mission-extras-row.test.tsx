import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

globalThis.React = React;

import { MissionExtrasRow } from "@/app/(app)/_components/course/mission/components/mission/mission-extras-row";

describe("MissionExtrasRow", () => {
	it("keeps the FULL TURBO bonus visible without repository access prompts", () => {
		const markup = renderToStaticMarkup(<MissionExtrasRow />);

		expect(markup).toContain("FULL TURBO");
		expect(markup).not.toContain("Starter repo access");
	});
});
