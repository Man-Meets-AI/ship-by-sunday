import {
	DEFAULT_DESIGN_PRESET_ID,
	buildDesignPresetFactSeed,
	buildSavePayload,
	buildStageDraftValues,
	buildStepDraftValues,
	codebaseFieldPromptKind,
	createCanonicalProjectDefinition,
	getCodebaseStageDefinition,
	formatCodebaseFactValue,
	normalizeProblemSeverityValue,
	normalizeProblemUrgencyValue,
	problemSeverityScaleValues,
} from "../src/index";

const reducedPricingStep = {
	id: "pricing",
	label: "Pricing",
	fieldKeys: ["pricing", "core_flow", "theme_preset", "contact_email"],
} as const;

describe("codebase field helpers", () => {
	it("classifies prompt kinds and formats values for editing", () => {
		const projectDefinition = createCanonicalProjectDefinition({
			clerkUserId: "user_123",
			productKey: "ship-by-sunday",
			facts: {
				product_name: "Ship by Sunday OS",
				product_summary: "Codebase-first runtime",
				primary_user: "Founders",
				problem_statement: "Planning stays vague",
				problem_trigger:
					"They need a clear codebase and repo handoff immediately.",
				problem_severity: "8",
				success_looks_like:
					"A founder downloads a working Codebase zip.",
				core_flow: [
					"Capture product facts",
					"Unlock codebases",
					"Download repo",
				],
				pricing: 29,
				design_preset_id: DEFAULT_DESIGN_PRESET_ID,
				theme_preset: buildDesignPresetFactSeed(DEFAULT_DESIGN_PRESET_ID)
					.theme_preset,
			},
			placeholdersInUse: [],
			createdAt: 1,
			updatedAt: 1,
		});
		const facts = projectDefinition.facts;

		expect(codebaseFieldPromptKind("product_name")).toBe("text");
		expect(codebaseFieldPromptKind("price_usd_cents")).toBe("number");
		expect(codebaseFieldPromptKind("pricing")).toBe("number");
		expect(codebaseFieldPromptKind("core_flow")).toBe("list");
		expect(codebaseFieldPromptKind("screen_sequence")).toBe("list");
		expect(codebaseFieldPromptKind("problem_severity")).toBe("scale");
		expect(codebaseFieldPromptKind("problem_urgency")).toBe("scale");
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
		expect(formatCodebaseFactValue(facts, "core_flow")).toBe(
			facts.core_flow.join("\n"),
		);
		expect(formatCodebaseFactValue(facts, "screen_sequence")).toBe(
			facts.screen_sequence.join("\n"),
		);
		expect(formatCodebaseFactValue(facts, "design_preset_id")).toBe(
			DEFAULT_DESIGN_PRESET_ID,
		);
		expect(formatCodebaseFactValue(facts, "price_usd_cents")).toBe("2900");
		expect(formatCodebaseFactValue(facts, "pricing")).toBe("29");
		expect(formatCodebaseFactValue({}, "surface_type")).toBe("web_app");
	});

	it("builds step and stage draft values for the review forms", () => {
		const projectDefinition = createCanonicalProjectDefinition({
			clerkUserId: "user_123",
			productKey: "ship-by-sunday",
			facts: {
				product_name: "Ship by Sunday OS",
				product_summary: "Codebase-first runtime",
				primary_user: "Founders",
				problem_statement: "Planning stays vague",
				problem_trigger:
					"They need a clear codebase and repo handoff immediately.",
				problem_severity: "8",
				success_looks_like:
					"A founder downloads a working Codebase zip.",
				core_flow: [
					"Capture product facts",
					"Unlock codebases",
					"Download repo",
				],
				pricing: 29,
			},
			placeholdersInUse: [],
			createdAt: 1,
			updatedAt: 1,
		});
		const stage = getCodebaseStageDefinition("codebase");
		const stageDraftValues = buildStageDraftValues(
			projectDefinition.facts,
			stage,
		);
		const pricingStep = stage.steps.find((step) => step.id === "pricing");
		if (!pricingStep) {
			throw new Error("Missing codebase pricing step");
		}
		const setupStep = stage.steps.find((step) => step.id === "setup");
		if (!setupStep) {
			throw new Error("Missing codebase setup step");
		}
		const pricingDraftValues = buildStepDraftValues(
			projectDefinition.facts,
			pricingStep,
		);

		expect(Object.keys(stageDraftValues)).toContain("pricing");
		expect(Object.keys(stageDraftValues)).toContain("setup");
		expect(pricingDraftValues.pricing).toBe("29");
		expect(stageDraftValues.setup.scope_in).toBe(
			"Capture product facts\nUnlock codebases\nDownload repo",
		);
		expect(
			buildStepDraftValues(projectDefinition.facts, setupStep).scope_in,
		).toBe("Capture product facts\nUnlock codebases\nDownload repo");
	});

	it("builds a save payload that trims, splits, and normalizes values", () => {
		const projectDefinition = createCanonicalProjectDefinition({
			clerkUserId: "user_123",
			productKey: "ship-by-sunday",
			facts: {
				product_name: "Ship by Sunday OS",
				product_summary: "Codebase-first runtime",
				primary_user: "Founders",
				problem_statement: "Planning stays vague",
				problem_trigger:
					"They need a clear codebase and repo handoff immediately.",
				problem_severity: "8",
				success_looks_like:
					"A founder downloads a working Codebase zip.",
				core_flow: [
					"Capture product facts",
					"Unlock codebases",
					"Download repo",
				],
				pricing: 29,
			},
			placeholdersInUse: [],
			createdAt: 1,
			updatedAt: 1,
		});
		const codebaseStage = getCodebaseStageDefinition("codebase");
		const step = codebaseStage.steps.find(
			(candidate) => candidate.id === "design",
		);
		if (!step) {
			throw new Error("Missing codebase design step");
		}
		const draftValues = {
			...buildStepDraftValues(projectDefinition.facts, step),
			theme_preset: " a1PzeK ",
		};
		const savePayload = buildSavePayload(step, draftValues);
		const buildPlanDeliveryStep = codebaseStage.steps.find(
			(candidate) => candidate.id === "pricing",
		);
		if (!buildPlanDeliveryStep) {
			throw new Error("Missing codebase pricing step");
		}
		const buildPlanDeliveryDraftValues = {
			...buildStepDraftValues(projectDefinition.facts, buildPlanDeliveryStep),
			pricing: " 29 ",
		};
		const buildPlanDeliveryPayload = buildSavePayload(
			buildPlanDeliveryStep,
			buildPlanDeliveryDraftValues,
		);
		const buildPlanSetupStep = codebaseStage.steps.find(
			(candidate) => candidate.id === "setup",
		);
		if (!buildPlanSetupStep) {
			throw new Error("Missing codebase setup step");
		}
		const buildPlanSetupPayload = buildSavePayload(buildPlanSetupStep, {
			...buildStepDraftValues(projectDefinition.facts, buildPlanSetupStep),
			domain: " ",
		});
		const problemStep = codebaseStage.steps.find(
			(candidate) => candidate.id === "problem",
		);
		if (!problemStep) {
			throw new Error("Missing codebase problem step");
		}
		const problemDraftValues = {
			...buildStepDraftValues(projectDefinition.facts, problemStep),
			problem_severity: "medium",
		};
		const problemPayload = buildSavePayload(problemStep, problemDraftValues);
		const reducedPricingSavePayload = buildSavePayload(reducedPricingStep, {
			pricing: " 29 ",
			core_flow: "Capture product facts\nUnlock codebases",
			theme_preset: ` ${buildDesignPresetFactSeed(DEFAULT_DESIGN_PRESET_ID).theme_preset} `,
			contact_email: " founder@example.com ",
		});

		expect(savePayload.clearedFieldKeys).toEqual(["design_preset_id"]);
		expect(savePayload.factsPatch.theme_preset).toBe("a1PzeK");
		expect(buildPlanDeliveryPayload.factsPatch.pricing).toBe(29);
		expect(buildPlanSetupPayload.clearedFieldKeys).toContain("domain");
		expect(problemPayload.factsPatch.problem_severity).toBe("5");
		expect(reducedPricingSavePayload.factsPatch.pricing).toBe(29);
		expect(reducedPricingSavePayload.factsPatch.core_flow).toEqual([
			"Capture product facts",
			"Unlock codebases",
		]);
		expect(reducedPricingSavePayload.factsPatch.theme_preset).toBe(
			buildDesignPresetFactSeed(DEFAULT_DESIGN_PRESET_ID).theme_preset,
		);
		expect(reducedPricingSavePayload.factsPatch.contact_email).toBe(
			"founder@example.com",
		);
	});
});
