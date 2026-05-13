/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	createCompleteProjectDefinition,
	getCodebaseStageDefinition,
} from "@shipbysunday/codebase-compiler";

import { CodebaseStageStepField } from "@/app/(protected)/_components/codebase-flow/codebase-stage-step-field";

describe("CodebaseStageStepField", () => {
	it("renders field controls without field-level AI actions", () => {
		const stage = getCodebaseStageDefinition("codebase");
		const problemStep = stage.steps.find(
			(candidate) => candidate.id === "problem",
		);

		if (!problemStep) {
			throw new Error("Missing codebase problem step.");
		}

		const facts = createCompleteProjectDefinition().facts;

		render(
			<CodebaseStageStepField
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
