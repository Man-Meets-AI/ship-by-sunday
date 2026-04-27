import { describe, expect, it } from "vitest";
import {
	getBlueprintStageDefinition,
	type BlueprintStageId,
} from "@shipbysunday/blueprint-compiler";
import { buildSavePayload } from "@/lib/blueprint-flow/blueprint-field-helpers";
import {
	classifyBlueprintStepSave,
	type BlueprintStepDraftValues,
} from "@/lib/blueprint-flow/blueprint-step-save-feedback";

function getStep(stageId: Exclude<BlueprintStageId, "review">, stepId: string) {
	const stage = getBlueprintStageDefinition(stageId);
	const step = stage.steps.find((candidate) => candidate.id === stepId);
	if (!step) {
		throw new Error(`Missing step ${stepId} in ${stageId}`);
	}

	return step;
}

function classifyStepSave(
	stageId: Exclude<BlueprintStageId, "review">,
	stepId: string,
	draftValues: BlueprintStepDraftValues,
	existingSavedValues: BlueprintStepDraftValues = {},
) {
	const step = getStep(stageId, stepId);
	const payload = buildSavePayload(step, draftValues);
	return classifyBlueprintStepSave(
		step,
		draftValues,
		existingSavedValues,
		payload,
	);
}

describe("classifyBlueprintStepSave", () => {
	it("treats an untouched blueprint section as blank and preserves required-field order", () => {
		const feedback = classifyStepSave("blueprint", "foundation", {
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

	it("treats a partially filled blueprint section as partial when required fields are still missing", () => {
		const feedback = classifyStepSave("blueprint", "foundation", {
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
		const feedback = classifyStepSave("blueprint", "design", {
			theme_preset: "",
			design_references: "",
		});

		expect(feedback.state).toBe("complete");
		expect(feedback.missingRequiredFieldKeys).toEqual([]);
		expect(feedback.firstMissingRequiredFieldKey).toBeNull();
	});

	it("treats clearing a previously complete required field as cleared_to_incomplete", () => {
		const existingSavedValues: BlueprintStepDraftValues = {
			pricing_model: "one_time",
			pricing: "99",
		};
		const feedback = classifyStepSave(
			"blueprint",
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
