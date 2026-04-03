/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	createCompleteProjectDefinition,
	getBlueprintStageDefinition,
} from "@blueprint-compiler";

import { BlueprintStageStepField } from "@/features/blueprint-flow/components/blueprint-stage-step-field";

describe("BlueprintStageStepField", () => {
	it("shows the optimizer button only for the problem statement field", () => {
		const stage = getBlueprintStageDefinition("product");
		const problemStep = stage.steps.find(
			(candidate) => candidate.id === "problem",
		);
		const foundationStep = stage.steps.find(
			(candidate) => candidate.id === "foundation",
		);

		if (!problemStep || !foundationStep) {
			throw new Error("Missing blueprint product steps.");
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

		expect(screen.getByRole("button", { name: "Optimize" })).toBeTruthy();

		render(
			<BlueprintStageStepField
				fieldKey="product_name"
				facts={facts}
				draftValues={{ product_name: "Ship by Sunday" }}
				step={foundationStep}
				value="Ship by Sunday"
				onChange={vi.fn()}
			/>,
		);

		expect(screen.queryAllByRole("button", { name: "Optimize" })).toHaveLength(
			1,
		);
	});
});
