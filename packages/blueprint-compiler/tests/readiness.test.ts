import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
	evaluateBlueprintReadiness,
	getBlueprintStageDefinition,
} from "../src/index";

describe("blueprint readiness", () => {
	it("marks all blueprints ready for the complete fixture", () => {
		const projectDefinition = createCompleteProjectDefinition();
		const readiness = evaluateBlueprintReadiness(projectDefinition.facts);
		const stageStatus = deriveStageStatus(projectDefinition.facts);

		expect(readiness.product.isReady).toBe(true);
		expect(readiness.design.isReady).toBe(true);
		expect(readiness.marketing.isReady).toBe(true);
		expect(readiness.build.isReady).toBe(true);
		expect(readiness.review.isReady).toBe(true);
		expect(stageStatus.firstIncompleteStageId).toBe("review");
	});

	it("defaults surface_type and finds the first incomplete stage", () => {
		const projectDefinition = createCanonicalProjectDefinitionDraft({
			clerkUserId: "user_123",
			productKey: "ship-by-sunday",
			facts: {
				product_name: "Ship by Sunday OS",
				product_summary: "Blueprint-first runtime",
				primary_user: "Founders",
			},
		});
		const stageStatus = deriveStageStatus(projectDefinition.facts);

		expect(stageStatus.firstIncompleteStageId).toBe("product");
		expect(
			stageStatus.stageStatuses.find((stage) => stage.stageId === "design"),
		).toMatchObject({
			isUnlocked: false,
			currentStepIndex: 0,
		});
	});

	it("treats missing design references as a design blocker", () => {
		const completeFacts = createCompleteProjectDefinition().facts;
		const readiness = evaluateBlueprintReadiness({
			...completeFacts,
			design_references: [],
		});

		expect(readiness.design.isReady).toBe(false);
		expect(readiness.design.missingFactKeys).toContain("design_references");
	});

	it("exposes the blueprint page step ids for marketing and build plan", () => {
		expect(
			getBlueprintStageDefinition("marketing").steps.map((step) => step.id),
		).toEqual(["operating-system"]);
		expect(
			getBlueprintStageDefinition("build-plan").steps.map((step) => step.id),
		).toEqual(["delivery", "plan", "validation"]);
	});

	it("preserves optional domain and support email on the regrouped delivery page", () => {
		const completeFacts = createCompleteProjectDefinition().facts;
		const readiness = evaluateBlueprintReadiness({
			...completeFacts,
			domain: undefined,
			support_email: undefined,
		});

		expect(readiness.build.isReady).toBe(true);
		expect(readiness.review.isReady).toBe(true);
	});
});
