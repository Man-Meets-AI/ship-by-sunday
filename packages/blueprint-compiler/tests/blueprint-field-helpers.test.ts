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
	fieldKeys: ["pricing", "core_flow", "theme_preset", "contact_email"],
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
				theme_preset: "a0",
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
		const stage = getBlueprintStageDefinition("blueprint");
		const stageDraftValues = buildStageDraftValues(
			projectDefinition.facts,
			stage,
		);
		const pricingStep = stage.steps.find((step) => step.id === "pricing");
		if (!pricingStep) {
			throw new Error("Missing blueprint pricing step");
		}
		const setupStep = stage.steps.find((step) => step.id === "setup");
		if (!setupStep) {
			throw new Error("Missing blueprint setup step");
		}
		const pricingDraftValues = buildStepDraftValues(
			projectDefinition.facts,
			pricingStep,
		);

		expect(Object.keys(stageDraftValues)).toContain("pricing");
		expect(Object.keys(stageDraftValues)).toContain("setup");
		expect(pricingDraftValues.pricing).toBe("29");
		expect(stageDraftValues.setup.scope_in).toBe(
			"Capture product facts\nUnlock blueprints\nDownload repo",
		);
		expect(
			buildStepDraftValues(projectDefinition.facts, setupStep).scope_in,
		).toBe("Capture product facts\nUnlock blueprints\nDownload repo");
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
		const blueprintStage = getBlueprintStageDefinition("blueprint");
		const step = blueprintStage.steps.find(
			(candidate) => candidate.id === "design",
		);
		if (!step) {
			throw new Error("Missing blueprint design step");
		}
		const draftValues = {
			...buildStepDraftValues(projectDefinition.facts, step),
			theme_preset: " a1PzeK ",
		};
		const savePayload = buildSavePayload(step, draftValues);
		const buildPlanDeliveryStep = blueprintStage.steps.find(
			(candidate) => candidate.id === "pricing",
		);
		if (!buildPlanDeliveryStep) {
			throw new Error("Missing blueprint pricing step");
		}
		const buildPlanDeliveryDraftValues = {
			...buildStepDraftValues(projectDefinition.facts, buildPlanDeliveryStep),
			pricing: " 29 ",
		};
		const buildPlanDeliveryPayload = buildSavePayload(
			buildPlanDeliveryStep,
			buildPlanDeliveryDraftValues,
		);
		const buildPlanSetupStep = blueprintStage.steps.find(
			(candidate) => candidate.id === "setup",
		);
		if (!buildPlanSetupStep) {
			throw new Error("Missing blueprint setup step");
		}
		const buildPlanSetupPayload = buildSavePayload(buildPlanSetupStep, {
			...buildStepDraftValues(projectDefinition.facts, buildPlanSetupStep),
			domain: " ",
		});
		const problemStep = blueprintStage.steps.find(
			(candidate) => candidate.id === "problem",
		);
		if (!problemStep) {
			throw new Error("Missing blueprint problem step");
		}
		const problemDraftValues = {
			...buildStepDraftValues(projectDefinition.facts, problemStep),
			problem_severity: "medium",
		};
		const problemPayload = buildSavePayload(problemStep, problemDraftValues);
		const reducedPricingSavePayload = buildSavePayload(reducedPricingStep, {
			pricing: " 29 ",
			core_flow: "Capture product facts\nUnlock blueprints",
			theme_preset: " a0 ",
			contact_email: " founder@example.com ",
		});

		expect(savePayload.clearedFieldKeys).toEqual([]);
		expect(savePayload.factsPatch.theme_preset).toBe("a1PzeK");
		expect(buildPlanDeliveryPayload.factsPatch.pricing).toBe(29);
		expect(buildPlanSetupPayload.clearedFieldKeys).toContain("domain");
		expect(problemPayload.factsPatch.problem_severity).toBe("5");
		expect(reducedPricingSavePayload.factsPatch.pricing).toBe(29);
		expect(reducedPricingSavePayload.factsPatch.core_flow).toEqual([
			"Capture product facts",
			"Unlock blueprints",
		]);
		expect(reducedPricingSavePayload.factsPatch.theme_preset).toBe("a0");
		expect(reducedPricingSavePayload.factsPatch.contact_email).toBe(
			"founder@example.com",
		);
	});
});
