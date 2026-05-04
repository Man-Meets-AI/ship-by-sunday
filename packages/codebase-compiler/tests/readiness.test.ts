import {
	createCanonicalProjectDefinition,
	createCanonicalProjectDefinitionDraft,
	deriveStageStatus,
	evaluateCodebaseReadiness,
	getCodebaseStageDefinition,
} from "../src/index";

describe("codebase readiness", () => {
	it("marks the combined codebase and review ready for a complete intake", () => {
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
		const readiness = evaluateCodebaseReadiness(projectDefinition.facts);
		const stageStatus = deriveStageStatus(projectDefinition.facts);

		expect(readiness.codebase.isReady).toBe(true);
		expect(readiness.review.isReady).toBe(true);
		expect(stageStatus.firstIncompleteStageId).toBe("review");
	});

	it("finds the first incomplete stage for a partial reduced draft", () => {
		const projectDefinition = createCanonicalProjectDefinitionDraft({
			clerkUserId: "user_123",
			productKey: "ship-by-sunday",
			facts: {
				product_name: "Ship by Sunday OS",
				product_summary: "Codebase-first runtime",
				primary_user: "Founders",
			},
		});
		const stageStatus = deriveStageStatus(projectDefinition.facts);

		expect(stageStatus.firstIncompleteStageId).toBe("codebase");
		expect(
			stageStatus.stageStatuses.find((stage) => stage.stageId === "review"),
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
				design_references: [],
			},
			placeholdersInUse: [],
			createdAt: 1,
			updatedAt: 1,
		}).facts;
		const readiness = evaluateCodebaseReadiness({
			...completeFacts,
			design_references: [],
		});

		expect(readiness.codebase.isReady).toBe(true);
		expect(readiness.codebase.missingFactKeys).not.toContain(
			"design_references",
		);
	});

	it("exposes the combined codebase page section ids", () => {
		expect(
			getCodebaseStageDefinition("codebase").steps.map((step) => step.id),
		).toEqual([
			"foundation",
			"problem",
			"outcome",
			"design",
			"pricing",
			"setup",
			"generated-preview",
		]);
	});

	it("preserves optional domain and support email on the combined setup section", () => {
		const completeFacts = createCanonicalProjectDefinition({
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
				domain: undefined,
				support_email: undefined,
			},
			placeholdersInUse: [],
			createdAt: 1,
			updatedAt: 1,
		}).facts;
		const readiness = evaluateCodebaseReadiness({
			...completeFacts,
			domain: undefined,
			support_email: undefined,
		});

		expect(readiness.codebase.isReady).toBe(true);
		expect(readiness.review.isReady).toBe(true);
	});
});
