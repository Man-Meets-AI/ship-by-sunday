import { describe, expect, it } from "vitest";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
	getBlueprintStageDefinition,
} from "@blueprint-compiler";
import {
	doesCompletingStepCompleteStage,
	getAdjacentBlueprintPageHrefs,
	getBlueprintStageEntryHref,
} from "@/features/blueprint-flow/lib/blueprint-stage-routes";

describe("blueprint stage routes", () => {
	it("resolves stage-entry routes from the current objective or first complete page", () => {
		const completeFacts = createCompleteProjectDefinition().facts;
		const incompleteProductFacts = createCanonicalProjectDefinitionDraft({
			clerkUserId: "user_123",
			productKey: "ship-by-sunday",
			facts: {
				product_name: completeFacts.product_name,
				product_summary: completeFacts.product_summary,
				primary_user: completeFacts.primary_user,
				problem_statement: completeFacts.problem_statement,
				problem_trigger: completeFacts.problem_trigger,
				problem_severity: completeFacts.problem_severity,
			},
		}).facts;
		const incompleteProductStatus = deriveStageStatus(
			incompleteProductFacts,
		).stageStatuses.find((stageStatus) => stageStatus.stageId === "product");
		const completeBuildPlanStatus = deriveStageStatus(
			completeFacts,
		).stageStatuses.find((stageStatus) => stageStatus.stageId === "build-plan");

		expect(incompleteProductStatus).toBeTruthy();
		expect(completeBuildPlanStatus).toBeTruthy();
		expect(
			getBlueprintStageEntryHref("product", incompleteProductStatus!),
		).toBe("/product/outcome");
		expect(
			getBlueprintStageEntryHref("build-plan", completeBuildPlanStatus!),
		).toBe("/build-plan/delivery");
	});

	it("builds the previous and next blueprint page links across stage boundaries", () => {
		expect(getAdjacentBlueprintPageHrefs("product", "foundation")).toEqual({
			previousHref: "/start",
			nextHref: "/product/problem",
		});
		expect(getAdjacentBlueprintPageHrefs("build-plan", "setup")).toEqual({
			previousHref: "/build-plan/delivery",
			nextHref: "/review",
		});
	});

	it("treats delivery as the required build-plan step and setup as the final optional page", () => {
		const completeFacts = createCompleteProjectDefinition().facts;
		const stageStatus = deriveStageStatus({
			...completeFacts,
			pricing: undefined,
			price_usd_cents: undefined,
		}).stageStatuses.find((item) => item.stageId === "build-plan");
		const deliveryStep = getBlueprintStageDefinition("build-plan").steps.find(
			(step) => step.id === "delivery",
		);
		const setupStep = getBlueprintStageDefinition("build-plan").steps.find(
			(step) => step.id === "setup",
		);

		expect(stageStatus).toBeTruthy();
		expect(deliveryStep).toBeTruthy();
		expect(setupStep).toBeTruthy();
		expect(doesCompletingStepCompleteStage(stageStatus!, deliveryStep!)).toBe(
			true,
		);
		expect(doesCompletingStepCompleteStage(stageStatus!, setupStep!)).toBe(
			false,
		);
	});
});
