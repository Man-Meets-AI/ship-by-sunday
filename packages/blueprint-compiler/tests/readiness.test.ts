import {
	createCanonicalProjectDefinition,
	createCanonicalProjectDefinitionDraft,
	deriveStageStatus,
	evaluateBlueprintReadiness,
	getBlueprintStageDefinition,
} from "../src/index";

describe("blueprint readiness", () => {
	it("marks all blueprints ready for a reduced intake once aliases are derived", () => {
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
		const readiness = evaluateBlueprintReadiness(projectDefinition.facts);
		const stageStatus = deriveStageStatus(projectDefinition.facts);

		expect(readiness.product.isReady).toBe(true);
		expect(readiness.design.isReady).toBe(true);
		expect(readiness.marketing.isReady).toBe(true);
		expect(readiness.build.isReady).toBe(true);
		expect(readiness.review.isReady).toBe(true);
		expect(stageStatus.firstIncompleteStageId).toBe("review");
	});

	it("finds the first incomplete stage for a partial reduced draft", () => {
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

	it("does not block readiness when design references are left blank", () => {
		const completeFacts = createCanonicalProjectDefinition({
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
				design_references: [],
			},
			placeholdersInUse: [],
			createdAt: 1,
			updatedAt: 1,
		}).facts;
		const readiness = evaluateBlueprintReadiness({
			...completeFacts,
			design_references: [],
		});

		expect(readiness.design.isReady).toBe(true);
		expect(readiness.design.missingFactKeys).not.toContain("design_references");
	});

	it("exposes the blueprint page step ids for marketing and build plan", () => {
		expect(
			getBlueprintStageDefinition("marketing").steps.map((step) => step.id),
		).toEqual(["preview"]);
		expect(
			getBlueprintStageDefinition("build-plan").steps.map((step) => step.id),
		).toEqual(["delivery", "setup"]);
	});

	it("preserves optional domain and support email on the regrouped delivery page", () => {
		const completeFacts = createCanonicalProjectDefinition({
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
				domain: undefined,
				support_email: undefined,
			},
			placeholdersInUse: [],
			createdAt: 1,
			updatedAt: 1,
		}).facts;
		const readiness = evaluateBlueprintReadiness({
			...completeFacts,
			domain: undefined,
			support_email: undefined,
		});

		expect(readiness.build.isReady).toBe(true);
		expect(readiness.review.isReady).toBe(true);
	});
});
