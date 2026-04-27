/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BlueprintStageScaleField } from "@/app/(workspace)/_components/blueprint-flow/blueprint-stage-scale-field";

describe("BlueprintStageScaleField", () => {
	it("renders the severity scale and commits a numeric pain score", async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();

		render(
			<BlueprintStageScaleField
				fieldKey="problem_severity"
				facts={{}}
				stepId="problem"
				value=""
				onChange={handleChange}
			/>,
		);

		expect(screen.getByText("Minor annoyance")).toBeTruthy();
		expect(screen.getByText("Real friction")).toBeTruthy();
		expect(screen.getByText("Critical blocker")).toBeTruthy();

		await user.click(screen.getByRole("radio", { name: "Pain 7 out of 10" }));

		expect(handleChange).toHaveBeenCalledWith("problem_severity", "7");
	});

	it("renders the urgency scale and commits the normalized urgency label", async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();

		render(
			<BlueprintStageScaleField
				fieldKey="problem_urgency"
				facts={{}}
				stepId="problem"
				value=""
				onChange={handleChange}
			/>,
		);

		expect(screen.getByText("Can wait")).toBeTruthy();
		expect(screen.getByText("Needs planning")).toBeTruthy();
		expect(screen.getByText("Immediate")).toBeTruthy();

		await user.click(
			screen.getByRole("radio", {
				name: "Urgency needs attention soon",
			}),
		);

		expect(handleChange).toHaveBeenCalledWith(
			"problem_urgency",
			"Needs attention soon",
		);
	});
});
