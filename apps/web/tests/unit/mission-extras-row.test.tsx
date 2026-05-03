import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock(
	"@/app/(workspace)/_components/starter-repo-access/starter-repo-access-card",
	() => ({
		StarterRepoAccessCard: () => <div>Starter repo access</div>,
	}),
);

globalThis.React = React;

import { MissionExtrasRow } from "@/app/(workspace)/_components/course/mission/components/mission/mission-extras-row";

describe("MissionExtrasRow", () => {
	it("keeps the FULL TURBO bonus visible with starter repo access", () => {
		const markup = renderToStaticMarkup(<MissionExtrasRow />);

		expect(markup).toContain("FULL TURBO");
		expect(markup).toContain("Starter repo access");
	});
});
