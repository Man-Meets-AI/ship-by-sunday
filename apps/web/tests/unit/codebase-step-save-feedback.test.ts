import { describe, expect, it } from "vitest";
import {
	getCodebaseStageDefinition,
	type CodebaseStageId,
} from "@shipbysunday/codebase-compiler";
import { buildSavePayload } from "@/lib/codebase-flow/codebase-field-helpers";
import {
	classifyCodebaseStepSave,
	type CodebaseStepDraftValues,
} from "@/lib/codebase-flow/codebase-step-save-feedback";

function getStep(stageId: Exclude<CodebaseStageId, "review">, stepId: string) {
	const stage = getCodebaseStageDefinition(stageId);
	const step = stage.steps.find((candidate) => candidate.id === stepId);
	if (!step) {
		throw new Error(`Missing step ${stepId} in ${stageId}`);
	}

	return step;
}

function classifyStepSave(
	stageId: Exclude<CodebaseStageId, "review">,
	stepId: string,
	draftValues: CodebaseStepDraftValues,
	existingSavedValues: CodebaseStepDraftValues = {},
) {
	const step = getStep(stageId, stepId);
	const payload = buildSavePayload(step, draftValues);
	return classifyCodebaseStepSave(
		step,
		draftValues,
		existingSavedValues,
		payload,
	);
}

describe("classifyCodebaseStepSave", () => {
	it("treats an untouched codebase section as blank and preserves required-field order", () => {
		const feedback = classifyStepSave("codebase", "foundation", {
			product_name: "   ",
			product_summary: "",
			primary_user: "\n",
		});

		expect(feedback.state).toBe("blank");
		expect(feedback.missingRequiredFieldKeys).toEqual([
			"product_name",
			"product_summary",
			"primary_user",
		]);
		expect(feedback.firstMissingRequiredFieldKey).toBe("product_name");
	});

	it("treats a partially filled codebase section as partial when required fields are still missing", () => {
		const feedback = classifyStepSave("codebase", "foundation", {
			product_name: "Ship by Sunday",
			product_summary: "",
			primary_user: "",
		});

		expect(feedback.state).toBe("partial");
		expect(feedback.missingRequiredFieldKeys).toEqual([
			"product_summary",
			"primary_user",
		]);
		expect(feedback.firstMissingRequiredFieldKey).toBe("product_summary");
	});

	it("treats a step as complete when its required fields are present and optional fields stay blank", () => {
		const feedback = classifyStepSave("codebase", "design", {
			theme_preset: "",
			design_references: "",
		});

		expect(feedback.state).toBe("complete");
		expect(feedback.missingRequiredFieldKeys).toEqual([]);
		expect(feedback.firstMissingRequiredFieldKey).toBeNull();
	});

	it("treats clearing a previously complete required field as cleared_to_incomplete", () => {
		const existingSavedValues: CodebaseStepDraftValues = {
			pricing_model: "one_time",
			pricing: "99",
		};
		const feedback = classifyStepSave(
			"codebase",
			"pricing",
			{
				...existingSavedValues,
				pricing: "",
			},
			existingSavedValues,
		);

		expect(feedback.state).toBe("cleared_to_incomplete");
		expect(feedback.clearedSavedFieldKeys).toEqual(["pricing"]);
		expect(feedback.missingRequiredFieldKeys).toEqual(["pricing"]);
		expect(feedback.firstMissingRequiredFieldKey).toBe("pricing");
	});
});
