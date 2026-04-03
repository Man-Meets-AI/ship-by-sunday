import { describe, expect, it } from "vitest";
import {
	getBlueprintStageDefinition,
	type BlueprintStageId,
} from "@blueprint-compiler";
import { buildSavePayload } from "@/features/blueprint-flow/lib/blueprint-field-helpers";
import {
	classifyBlueprintStepSave,
	type BlueprintStepDraftValues,
} from "@/features/blueprint-flow/lib/blueprint-step-save-feedback";

function getStep(
	stageId: Exclude<BlueprintStageId, "start" | "review">,
	stepId: string,
) {
	const stage = getBlueprintStageDefinition(stageId);
	const step = stage.steps.find((candidate) => candidate.id === stepId);
	if (!step) {
		throw new Error(`Missing step ${stepId} in ${stageId}`);
	}

	return step;
}

function classifyStepSave(
	stageId: Exclude<BlueprintStageId, "start" | "review">,
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
	it("treats an untouched product step as blank and preserves required-field order", () => {
		const feedback = classifyStepSave("product", "scope", {
			scope_in: "   ",
			scope_out: "",
			non_goals: "\n",
			v1_rationale: "",
		});

		expect(feedback.state).toBe("blank");
		expect(feedback.missingRequiredFieldKeys).toEqual([
			"scope_in",
			"scope_out",
			"non_goals",
			"v1_rationale",
		]);
		expect(feedback.firstMissingRequiredFieldKey).toBe("scope_in");
	});

	it("treats a partially filled product step as partial when required fields are still missing", () => {
		const feedback = classifyStepSave("product", "scope", {
			scope_in: "Keep the first checkout flow only",
			scope_out: "",
			non_goals: "",
			v1_rationale: "Ship the smallest buyer path first.",
		});

		expect(feedback.state).toBe("partial");
		expect(feedback.missingRequiredFieldKeys).toEqual([
			"scope_out",
			"non_goals",
		]);
		expect(feedback.firstMissingRequiredFieldKey).toBe("scope_out");
	});

	it("treats a step as complete when its required fields are present and optional fields stay blank", () => {
		const feedback = classifyStepSave("design", "flow", {
			screen_sequence: "Hero\nCheckout\nConfirmation",
			must_have_capabilities: "Collect payment\nDeliver blueprint",
			surface_type: "",
		});

		expect(feedback.state).toBe("complete");
		expect(feedback.missingRequiredFieldKeys).toEqual([]);
		expect(feedback.firstMissingRequiredFieldKey).toBeNull();
	});

	it("treats clearing a previously complete required field as cleared_to_incomplete", () => {
		const existingSavedValues: BlueprintStepDraftValues = {
			objective: "Ship the blueprint funnel.",
			user_visible_outcome:
				"Buyers reach review with a complete blueprint and starter snapshot.",
			distribution_model: "Protected web app with downloads",
			install_destination: "Vercel",
			buyer_ai_promise: "AI helps compile the blueprint and starter repo.",
			pricing_model: "One-time payment",
			price_usd_cents: "9900",
			price_display: "$99",
			currency: "USD",
			domain: "shipbysunday.dev",
			support_email: "support@shipbysunday.dev",
		};
		const feedback = classifyStepSave(
			"build-plan",
			"delivery",
			{
				...existingSavedValues,
				price_usd_cents: "",
			},
			existingSavedValues,
		);

		expect(feedback.state).toBe("cleared_to_incomplete");
		expect(feedback.clearedSavedFieldKeys).toEqual(["price_usd_cents"]);
		expect(feedback.missingRequiredFieldKeys).toEqual(["price_usd_cents"]);
		expect(feedback.firstMissingRequiredFieldKey).toBe("price_usd_cents");
	});
});
