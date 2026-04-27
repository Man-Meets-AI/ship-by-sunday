/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BlueprintStageSaveFeedback } from "@/app/(workspace)/_components/blueprint-flow/blueprint-stage-save-feedback";

describe("BlueprintStageSaveFeedback", () => {
	it("renders warning feedback as a compact status row with the warning icon", () => {
		render(
			<BlueprintStageSaveFeedback
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
