import { describe, expect, it } from "vitest";
import {
	createCompleteProjectDefinition,
	deriveStageStatus,
	getPacketStageDefinition,
} from "@packet-compiler";
import {
	doesCompletingStepCompleteStage,
	getAdjacentPacketPageHrefs,
	getPacketStageEntryHref,
} from "@/features/packet-flow/lib/packet-stage-routes";

describe("packet stage routes", () => {
	it("resolves stage-entry routes from the current objective or first complete page", () => {
		const completeFacts = createCompleteProjectDefinition().facts;
		const incompleteProductStatus = deriveStageStatus({
			...completeFacts,
			scope_in: undefined,
			scope_out: undefined,
			non_goals: undefined,
			v1_rationale: undefined,
		}).stageStatuses.find((stageStatus) => stageStatus.stageId === "product");
		const completeBuildPlanStatus = deriveStageStatus(
			completeFacts,
		).stageStatuses.find((stageStatus) => stageStatus.stageId === "build-plan");

		expect(incompleteProductStatus).toBeTruthy();
		expect(completeBuildPlanStatus).toBeTruthy();
		expect(getPacketStageEntryHref("product", incompleteProductStatus!)).toBe(
			"/product/scope",
		);
		expect(
			getPacketStageEntryHref("build-plan", completeBuildPlanStatus!),
		).toBe("/build-plan/delivery");
	});

	it("builds the previous and next packet page links across stage boundaries", () => {
		expect(getAdjacentPacketPageHrefs("product", "foundation")).toEqual({
			previousHref: "/start",
			nextHref: "/product/problem",
		});
		expect(getAdjacentPacketPageHrefs("build-plan", "validation")).toEqual({
			previousHref: "/build-plan/plan",
			nextHref: "/review",
		});
	});

	it("only treats the last build-plan page as stage-completing when it clears the remaining blockers", () => {
		const completeFacts = createCompleteProjectDefinition().facts;
		const stageStatus = deriveStageStatus({
			...completeFacts,
			done_when: undefined,
		}).stageStatuses.find((item) => item.stageId === "build-plan");
		const validationStep = getPacketStageDefinition("build-plan").steps.find(
			(step) => step.id === "validation",
		);

		expect(stageStatus).toBeTruthy();
		expect(validationStep).toBeTruthy();
		expect(doesCompletingStepCompleteStage(stageStatus!, validationStep!)).toBe(
			true,
		);
		expect(
			doesCompletingStepCompleteStage(
				stageStatus!,
				getPacketStageDefinition("build-plan").steps[0]!,
			),
		).toBe(false);
	});
});
