import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
	evaluatePacketReadiness,
} from "../src/index";

describe("packet readiness", () => {
	it("marks all packets ready for the complete fixture", () => {
		const projectDefinition = createCompleteProjectDefinition();
		const readiness = evaluatePacketReadiness(projectDefinition.facts);
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
				product_summary: "Packet-first runtime",
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
		const readiness = evaluatePacketReadiness({
			...completeFacts,
			design_references: [],
		});

		expect(readiness.design.isReady).toBe(false);
		expect(readiness.design.missingFactKeys).toContain("design_references");
	});
});
