/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CodebaseStageSaveFeedback } from "@/app/(protected)/_components/codebase-flow/codebase-stage-save-feedback";

describe("CodebaseStageSaveFeedback", () => {
	it("renders warning feedback as a compact status row with the warning icon", () => {
		render(
			<CodebaseStageSaveFeedback
				feedback={{
					tone: "warning",
					title: "This page is incomplete.",
					description:
						"Complete When does this problem show up? to restore completion for this page.",
				}}
			/>,
		);

		const alert = screen.getByRole("status");

		expect(alert.textContent).toContain("This page is incomplete.");
		expect(alert.textContent).toContain(
			"Complete When does this problem show up? to restore completion for this page.",
		);
		expect(alert.querySelector("svg")).not.toBeNull();
	});
});
