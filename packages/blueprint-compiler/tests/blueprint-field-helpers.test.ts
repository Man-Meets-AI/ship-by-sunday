import {
	buildSavePayload,
	buildStageDraftValues,
	buildStepDraftValues,
	blueprintFieldPromptKind,
	createCanonicalProjectDefinition,
	getBlueprintStageDefinition,
	formatBlueprintFactValue,
	normalizeProblemSeverityValue,
	normalizeProblemUrgencyValue,
	problemSeverityScaleValues,
} from "../src/index";

const reducedPricingStep = {
	id: "pricing",
	label: "Pricing",
	fieldKeys: ["pricing", "core_flow", "theme_hex", "contact_email"],
} as const;

describe("blueprint field helpers", () => {
	it("classifies prompt kinds and formats values for editing", () => {
		const projectDefinition = createCanonicalProjectDefinition({
			clerkUserId: "user_123",
			productKey: "ship-by-sunday",
			facts: {
				product_name: "Ship by Sunday OS",
				product_summary: "Blueprint-first runtime",
				primary_user: "Founders",
				problem_statement: "Planning stays vague",
				problem_trigger:
					"They need a clear blueprint and repo handoff immediately.",
				problem_severity: "8",
				success_looks_like:
					"A founder downloads a working blueprint and repo zip.",
				core_flow: [
					"Capture product facts",
					"Unlock blueprints",
					"Download repo",
				],
				pricing: 29,
				theme_hex: "#0f766e",
			},
			placeholdersInUse: [],
			createdAt: 1,
			updatedAt: 1,
		});
		const facts = projectDefinition.facts;

		expect(blueprintFieldPromptKind("product_name")).toBe("text");
		expect(blueprintFieldPromptKind("price_usd_cents")).toBe("number");
		expect(blueprintFieldPromptKind("pricing")).toBe("number");
		expect(blueprintFieldPromptKind("core_flow")).toBe("list");
		expect(blueprintFieldPromptKind("screen_sequence")).toBe("list");
		expect(blueprintFieldPromptKind("problem_severity")).toBe("scale");
		expect(blueprintFieldPromptKind("problem_urgency")).toBe("scale");
		expect(problemSeverityScaleValues).toEqual([
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			"10",
		]);
		expect(normalizeProblemSeverityValue(" high ")).toBe("8");
		expect(normalizeProblemSeverityValue(" 10 ")).toBe("10");
		expect(normalizeProblemUrgencyValue("this week")).toBe(
			"Needs attention soon",
		);
		expect(normalizeProblemUrgencyValue("urgent")).toBe("Needs action now");
		expect(normalizeProblemUrgencyValue("can wait")).toBe("Can schedule");
		expect(formatBlueprintFactValue(facts, "core_flow")).toBe(
			facts.core_flow.join("\n"),
		);
		expect(formatBlueprintFactValue(facts, "screen_sequence")).toBe(
			facts.screen_sequence.join("\n"),
		);
		expect(formatBlueprintFactValue(facts, "price_usd_cents")).toBe("2900");
		expect(formatBlueprintFactValue(facts, "pricing")).toBe("29");
		expect(formatBlueprintFactValue({}, "surface_type")).toBe("web_app");
	});

	it("builds step and stage draft values for the review forms", () => {
		const projectDefinition = createCanonicalProjectDefinition({
			clerkUserId: "user_123",
			productKey: "ship-by-sunday",
			facts: {
				product_name: "Ship by Sunday OS",
				product_summary: "Blueprint-first runtime",
				primary_user: "Founders",
				problem_statement: "Planning stays vague",
				problem_trigger:
					"They need a clear blueprint and repo handoff immediately.",
				problem_severity: "8",
				success_looks_like:
					"A founder downloads a working blueprint and repo zip.",
				core_flow: [
					"Capture product facts",
					"Unlock blueprints",
					"Download repo",
				],
				pricing: 29,
			},
			placeholdersInUse: [],
			createdAt: 1,
			updatedAt: 1,
		});
		const stage = getBlueprintStageDefinition("build-plan");
		const stageDraftValues = buildStageDraftValues(
			projectDefinition.facts,
			stage,
		);
		const deliveryStep = stage.steps[0];
		const deliveryDraftValues = buildStepDraftValues(
			projectDefinition.facts,
			deliveryStep,
		);
		const pricingDraftValues = buildStepDraftValues(
			projectDefinition.facts,
			reducedPricingStep,
		);

		expect(Object.keys(stageDraftValues)).toEqual(["delivery", "setup"]);
		expect(deliveryDraftValues.pricing).toBe("29");
		expect(stageDraftValues.setup.scope_in).toBe(
			"Capture product facts\nUnlock blueprints\nDownload repo",
		);
		expect(pricingDraftValues.pricing).toBe("29");
		expect(pricingDraftValues.core_flow).toBe(
			"Capture product facts\nUnlock blueprints\nDownload repo",
		);
	});

	it("builds a save payload that trims, splits, and normalizes values", () => {
		const projectDefinition = createCanonicalProjectDefinition({
			clerkUserId: "user_123",
			productKey: "ship-by-sunday",
			facts: {
				product_name: "Ship by Sunday OS",
				product_summary: "Blueprint-first runtime",
				primary_user: "Founders",
				problem_statement: "Planning stays vague",
				problem_trigger:
					"They need a clear blueprint and repo handoff immediately.",
				problem_severity: "8",
				success_looks_like:
					"A founder downloads a working blueprint and repo zip.",
				core_flow: [
					"Capture product facts",
					"Unlock blueprints",
					"Download repo",
				],
				pricing: 29,
			},
			placeholdersInUse: [],
			createdAt: 1,
			updatedAt: 1,
		});
		const step = getBlueprintStageDefinition("design").steps[0];
		const draftValues = {
			...buildStepDraftValues(projectDefinition.facts, step),
			theme_hex: " #123456 ",
		};
		const savePayload = buildSavePayload(step, draftValues);
		const buildPlanDeliveryStep =
			getBlueprintStageDefinition("build-plan").steps[0];
		const buildPlanDeliveryDraftValues = {
			...buildStepDraftValues(projectDefinition.facts, buildPlanDeliveryStep),
			pricing: " 29 ",
		};
		const buildPlanDeliveryPayload = buildSavePayload(
			buildPlanDeliveryStep,
			buildPlanDeliveryDraftValues,
		);
		const buildPlanSetupStep =
			getBlueprintStageDefinition("build-plan").steps[1];
		const buildPlanSetupPayload = buildSavePayload(buildPlanSetupStep, {
			...buildStepDraftValues(projectDefinition.facts, buildPlanSetupStep),
			domain: " ",
		});
		const problemStep = getBlueprintStageDefinition("product").steps[1];
		const problemDraftValues = {
			...buildStepDraftValues(projectDefinition.facts, problemStep),
			problem_severity: "medium",
		};
		const problemPayload = buildSavePayload(problemStep, problemDraftValues);
		const reducedPricingSavePayload = buildSavePayload(reducedPricingStep, {
			pricing: " 29 ",
			core_flow: "Capture product facts\nUnlock blueprints",
			theme_hex: " #0f766e ",
			contact_email: " founder@example.com ",
		});

		expect(savePayload.clearedFieldKeys).toEqual([]);
		expect(savePayload.factsPatch.theme_hex).toBe("#123456");
		expect(buildPlanDeliveryPayload.factsPatch.pricing).toBe(29);
		expect(buildPlanSetupPayload.clearedFieldKeys).toContain("domain");
		expect(problemPayload.factsPatch.problem_severity).toBe("5");
		expect(reducedPricingSavePayload.factsPatch.pricing).toBe(29);
		expect(reducedPricingSavePayload.factsPatch.core_flow).toEqual([
			"Capture product facts",
			"Unlock blueprints",
		]);
		expect(reducedPricingSavePayload.factsPatch.theme_hex).toBe("#0f766e");
		expect(reducedPricingSavePayload.factsPatch.contact_email).toBe(
			"founder@example.com",
		);
	});
});
