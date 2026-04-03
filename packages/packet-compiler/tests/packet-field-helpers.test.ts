import {
	createCompleteProjectDefinition,
	getPacketStageDefinition,
	buildSavePayload,
	buildStageDraftValues,
	buildStepDraftValues,
	formatPacketFactValue,
	normalizeProblemUrgencyValue,
	normalizeProblemSeverityValue,
	packetFieldPromptKind,
	problemSeverityScaleValues,
} from "../src/index";

describe("packet field helpers", () => {
	it("classifies prompt kinds and formats values for editing", () => {
		const projectDefinition = createCompleteProjectDefinition();
		const facts = projectDefinition.facts;

		expect(packetFieldPromptKind("product_name")).toBe("text");
		expect(packetFieldPromptKind("price_usd_cents")).toBe("number");
		expect(packetFieldPromptKind("screen_sequence")).toBe("list");
		expect(packetFieldPromptKind("problem_severity")).toBe("scale");
		expect(packetFieldPromptKind("problem_urgency")).toBe("scale");
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
		expect(formatPacketFactValue(facts, "screen_sequence")).toBe(
			facts.screen_sequence.join("\n"),
		);
		expect(formatPacketFactValue(facts, "price_usd_cents")).toBe("2900");
		expect(formatPacketFactValue({}, "surface_type")).toBe("web_app");
	});

	it("builds step and stage draft values for the review forms", () => {
		const projectDefinition = createCompleteProjectDefinition();
		const stage = getPacketStageDefinition("build-plan");
		const stageDraftValues = buildStageDraftValues(
			projectDefinition.facts,
			stage,
		);
		const deliveryStep = stage.steps[0];
		const deliveryDraftValues = buildStepDraftValues(
			projectDefinition.facts,
			deliveryStep,
		);

		expect(Object.keys(stageDraftValues)).toEqual([
			"delivery",
			"plan",
			"validation",
		]);
		expect(deliveryDraftValues.price_usd_cents).toBe("2900");
		expect(deliveryDraftValues.domain).toBe("example.com");
		expect(stageDraftValues.delivery.price_display).toBe("$29");
	});

	it("builds a save payload that trims, splits, and normalizes values", () => {
		const projectDefinition = createCompleteProjectDefinition();
		const step = getPacketStageDefinition("design").steps[0];
		const draftValues = {
			...buildStepDraftValues(projectDefinition.facts, step),
			screen_sequence: " Home\nPricing \n",
			must_have_capabilities: "Search\nOnboarding",
		};
		const savePayload = buildSavePayload(step, draftValues);
		const buildPlanDeliveryStep =
			getPacketStageDefinition("build-plan").steps[0];
		const buildPlanDeliveryDraftValues = {
			...buildStepDraftValues(projectDefinition.facts, buildPlanDeliveryStep),
			price_usd_cents: " 2900 ",
			domain: " ",
		};
		const buildPlanDeliveryPayload = buildSavePayload(
			buildPlanDeliveryStep,
			buildPlanDeliveryDraftValues,
		);
		const problemStep = getPacketStageDefinition("product").steps[1];
		const problemDraftValues = {
			...buildStepDraftValues(projectDefinition.facts, problemStep),
			problem_severity: "medium",
		};
		const problemPayload = buildSavePayload(problemStep, problemDraftValues);
		const urgencyDraftValues = {
			...buildStepDraftValues(projectDefinition.facts, problemStep),
			problem_urgency: "urgent",
		};
		const urgencyPayload = buildSavePayload(problemStep, urgencyDraftValues);

		expect(savePayload.clearedFieldKeys).toEqual([]);
		expect(savePayload.factsPatch.screen_sequence).toEqual(["Home", "Pricing"]);
		expect(savePayload.factsPatch.must_have_capabilities).toEqual([
			"Search",
			"Onboarding",
		]);
		expect(buildPlanDeliveryPayload.factsPatch.price_usd_cents).toBe(2900);
		expect(buildPlanDeliveryPayload.clearedFieldKeys).toContain("domain");
		expect(problemPayload.factsPatch.problem_severity).toBe("5");
		expect(urgencyPayload.factsPatch.problem_urgency).toBe("Needs action now");
	});
});
