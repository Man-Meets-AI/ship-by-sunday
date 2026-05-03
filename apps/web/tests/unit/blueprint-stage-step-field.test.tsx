/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	createCompleteProjectDefinition,
	getBlueprintStageDefinition,
} from "@shipbysunday/blueprint-compiler";

import { BlueprintStageStepField } from "@/app/(workspace)/_components/blueprint-flow/blueprint-stage-step-field";

describe("BlueprintStageStepField", () => {
	it("renders field controls without field-level AI actions", () => {
		const stage = getBlueprintStageDefinition("blueprint");
		const problemStep = stage.steps.find(
			(candidate) => candidate.id === "problem",
		);

		if (!problemStep) {
			throw new Error("Missing blueprint problem step.");
		}

		const facts = createCompleteProjectDefinition().facts;

		render(
			<BlueprintStageStepField
				fieldKey="problem_statement"
				facts={facts}
				draftValues={{
					problem_statement: "I keep restarting the launch plan.",
				}}
				step={problemStep}
				value="I keep restarting the launch plan."
				onChange={vi.fn()}
			/>,
		);

		expect(
			screen.getByLabelText(/What does Ship by Sunday OS solve/),
		).toBeTruthy();
		expect(screen.queryByRole("button", { name: /Draft/i })).toBeNull();
	});
});
