/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import type { ReactMutation } from "convex/react";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
	getPacketStageDefinition,
	type PacketStepDefinition,
} from "@packet-compiler";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/convex/_generated/api";
import { PRODUCT_APP_ID } from "@/config/product";
import { buildStepDraftValues } from "@/features/packet-flow/lib/packet-field-helpers";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import { getPacketStageFieldInputId } from "@/features/packet-flow/lib/packet-step-save-feedback";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: pushMock,
	}),
}));

import { usePacketStageStepState } from "@/features/packet-flow/hooks/use-packet-stage-step-state";

type SaveProjectDefinitionFactsMock = ReactMutation<
	typeof api.packet.saveProjectDefinitionFacts
>;

function createProjectFacts(factOverrides: Record<string, unknown> = {}) {
	const baseFacts = createCompleteProjectDefinition().facts;
	return createCanonicalProjectDefinitionDraft({
		clerkUserId: "user_123",
		productKey: "ship-by-sunday",
		facts: Object.fromEntries(
			Object.entries({
				...baseFacts,
				...factOverrides,
			}).filter(([, value]) => value !== undefined),
		),
	}).facts;
}

function getStageStatus(
	stageId: "product" | "build-plan",
	factOverrides: Record<string, unknown> = {},
) {
	const projectFacts = createProjectFacts(factOverrides);
	const stageStatus = deriveStageStatus(projectFacts).stageStatuses.find(
		(candidate) => candidate.stageId === stageId,
	);
	if (!stageStatus) {
		throw new Error(`Missing stage status for ${stageId}`);
	}

	return {
		projectFacts,
		stageStatus,
	};
}

async function setCurrentFieldValue(
	result: {
		current: ReturnType<typeof usePacketStageStepState>;
	},
	step: PacketStepDefinition,
	fieldKey:
		| "product_name"
		| "done_when"
		| "acceptance_criteria"
		| "validation_plan"
		| "demo_flow",
	value: string,
) {
	const input = document.getElementById(
		getPacketStageFieldInputId(step.id, fieldKey),
	) as HTMLTextAreaElement | null;
	if (!input) {
		throw new Error(`Missing input for ${fieldKey}`);
	}

	input.value = value;
	await act(async () => {
		result.current.handleFieldChange(fieldKey, value);
	});
}

function mountStepInputs(
	step: PacketStepDefinition,
	projectFacts: ReturnType<typeof createProjectFacts>,
) {
	const draftValues = buildStepDraftValues(projectFacts, step);
	for (const fieldKey of step.fieldKeys) {
		const input = document.createElement("textarea");
		input.id = getPacketStageFieldInputId(step.id, fieldKey);
		input.value = draftValues[fieldKey] ?? "";
		document.body.appendChild(input);
	}
}

function createSaveProjectDefinitionFactsMutation() {
	const saveProjectDefinitionFactsSpy = vi.fn().mockResolvedValue({});
	const saveProjectDefinitionFacts = Object.assign(
		(args: unknown) => saveProjectDefinitionFactsSpy(args),
		{
			withOptimisticUpdate: vi.fn(() => saveProjectDefinitionFacts),
		},
	) as SaveProjectDefinitionFactsMock;

	return { saveProjectDefinitionFacts, saveProjectDefinitionFactsSpy };
}

function createPacketWorkspaceState(
	projectFacts: ReturnType<typeof createProjectFacts> | null,
): PacketWorkspaceState {
	const stageStatus = deriveStageStatus(projectFacts ?? {});

	return {
		projectDefinition: projectFacts
			? createCanonicalProjectDefinitionDraft({
					clerkUserId: "user_123",
					productKey: PRODUCT_APP_ID,
					facts: projectFacts,
				})
			: null,
		workflowState: null,
		firstIncompleteStageId: projectFacts
			? stageStatus.firstIncompleteStageId
			: "start",
		packetReadiness: stageStatus.packetReadiness,
		stageStatuses: stageStatus.stageStatuses,
	};
}

describe("usePacketStageStepState", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		pushMock.mockReset();
	});

	afterEach(() => {
		vi.useRealTimers();
		document.body.innerHTML = "";
	});

	it("autosaves the latest packet draft without navigating away from the current page", async () => {
		const stage = getPacketStageDefinition("product");
		const foundationStep = stage.steps[0]!;
		const { saveProjectDefinitionFacts, saveProjectDefinitionFactsSpy } =
			createSaveProjectDefinitionFactsMutation();
		const { projectFacts, stageStatus } = getStageStatus("product", {
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
			why_this_matters: undefined,
		});
		mountStepInputs(foundationStep, projectFacts);
		const { result } = renderHook(() =>
			usePacketStageStepState({
				stage,
				stageId: "product",
				stageStatus,
				stepId: "foundation",
				nextHref: "/product/problem",
				projectFacts,
				saveProjectDefinitionFacts,
			}),
		);

		await setCurrentFieldValue(
			result,
			foundationStep,
			"product_name",
			"Ship by Sunday",
		);
		expect(pushMock).not.toHaveBeenCalled();

		await act(async () => {
			vi.advanceTimersByTime(990);
		});

		await setCurrentFieldValue(
			result,
			foundationStep,
			"product_name",
			"Ship the packet-first launch system",
		);
		expect(saveProjectDefinitionFactsSpy).not.toHaveBeenCalled();

		await act(async () => {
			vi.advanceTimersByTime(10);
			await Promise.resolve();
		});

		expect(saveProjectDefinitionFactsSpy).toHaveBeenCalledTimes(1);
		expect(saveProjectDefinitionFactsSpy).toHaveBeenCalledWith({
			stageId: "product",
			clearedFieldKeys: expect.arrayContaining([
				"product_summary",
				"primary_user",
				"why_this_matters",
			]),
			factsPatch: {
				product_name: "Ship the packet-first launch system",
			},
		});
		expect(result.current.currentFeedback).toEqual(
			expect.objectContaining({
				title: "Saved for now.",
			}),
		);
		expect(pushMock).not.toHaveBeenCalled();
	});

	it("keeps the last build-plan page in place when earlier blockers still exist", async () => {
		const stage = getPacketStageDefinition("build-plan");
		const { saveProjectDefinitionFacts, saveProjectDefinitionFactsSpy } =
			createSaveProjectDefinitionFactsMutation();
		const { projectFacts, stageStatus } = getStageStatus("build-plan", {
			objective: undefined,
			done_when: undefined,
			acceptance_criteria: undefined,
			validation_plan: undefined,
			demo_flow: undefined,
		});
		mountStepInputs(stage.steps.at(-1)!, projectFacts);
		const { result } = renderHook(() =>
			usePacketStageStepState({
				stage,
				stageId: "build-plan",
				stageStatus,
				stepId: "validation",
				previousHref: "/build-plan/plan",
				nextHref: "/review",
				projectFacts,
				saveProjectDefinitionFacts,
			}),
		);

		await setCurrentFieldValue(
			result,
			stage.steps.at(-1)!,
			"done_when",
			"Buyers can answer the packet flow and download the starter snapshot.",
		);
		await setCurrentFieldValue(
			result,
			stage.steps.at(-1)!,
			"acceptance_criteria",
			"Complete all packet stages\nDownload starter snapshot",
		);
		await setCurrentFieldValue(
			result,
			stage.steps.at(-1)!,
			"validation_plan",
			"Run packet stage smoke tests\nCheck review download state",
		);
		await setCurrentFieldValue(
			result,
			stage.steps.at(-1)!,
			"demo_flow",
			"Product stage to review download in one sitting.",
		);

		await act(async () => {
			await result.current.handleSaveAndContinue();
		});

		expect(saveProjectDefinitionFactsSpy).toHaveBeenCalledTimes(1);
		expect(pushMock).not.toHaveBeenCalled();
		expect(result.current.currentFeedback).toEqual(
			expect.objectContaining({
				title: "Saved.",
				description: "Validation is locked.",
			}),
		);
	});

	it("routes to review when the final build-plan page resolves the last blocker", async () => {
		const stage = getPacketStageDefinition("build-plan");
		const { saveProjectDefinitionFacts, saveProjectDefinitionFactsSpy } =
			createSaveProjectDefinitionFactsMutation();
		const { projectFacts, stageStatus } = getStageStatus("build-plan", {
			done_when: undefined,
			acceptance_criteria: undefined,
			validation_plan: undefined,
			demo_flow: undefined,
		});
		mountStepInputs(stage.steps.at(-1)!, projectFacts);
		const { result } = renderHook(() =>
			usePacketStageStepState({
				stage,
				stageId: "build-plan",
				stageStatus,
				stepId: "validation",
				previousHref: "/build-plan/plan",
				nextHref: "/review",
				projectFacts,
				saveProjectDefinitionFacts,
			}),
		);

		await setCurrentFieldValue(
			result,
			stage.steps.at(-1)!,
			"done_when",
			"Buyers can answer the packet flow and download the starter snapshot.",
		);
		await setCurrentFieldValue(
			result,
			stage.steps.at(-1)!,
			"acceptance_criteria",
			"Complete all packet stages\nDownload starter snapshot",
		);
		await setCurrentFieldValue(
			result,
			stage.steps.at(-1)!,
			"validation_plan",
			"Run packet stage smoke tests\nCheck review download state",
		);
		await setCurrentFieldValue(
			result,
			stage.steps.at(-1)!,
			"demo_flow",
			"Product stage to review download in one sitting.",
		);

		await act(async () => {
			await result.current.handleSaveAndContinue();
		});

		expect(saveProjectDefinitionFactsSpy).toHaveBeenCalledTimes(1);
		expect(pushMock).toHaveBeenCalledWith("/review");
	});

	it("creates an optimistic project definition when the first packet save starts from null", async () => {
		const stage = getPacketStageDefinition("product");
		const foundationStep = stage.steps[0]!;
		const { saveProjectDefinitionFacts } =
			createSaveProjectDefinitionFactsMutation();
		const { projectFacts, stageStatus } = getStageStatus("product", {
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
			why_this_matters: undefined,
		});
		mountStepInputs(foundationStep, projectFacts);

		renderHook(() =>
			usePacketStageStepState({
				stage,
				stageId: "product",
				stageStatus,
				stepId: "foundation",
				projectFacts,
				saveProjectDefinitionFacts,
			}),
		);

		const optimisticUpdate =
			saveProjectDefinitionFacts.withOptimisticUpdate.mock.calls[0]?.[0];
		expect(typeof optimisticUpdate).toBe("function");

		const localStore = {
			getQuery: vi.fn(() => createPacketWorkspaceState(null)),
			setQuery: vi.fn(),
		};

		optimisticUpdate(localStore, {
			stageId: "product",
			clearedFieldKeys: [],
			factsPatch: {
				product_name: "Ship by Sunday",
			},
		});

		expect(localStore.setQuery).toHaveBeenCalledWith(
			api.packet.getPacketWorkspaceState,
			{},
			expect.objectContaining({
				projectDefinition: expect.objectContaining({
					productKey: PRODUCT_APP_ID,
					facts: expect.objectContaining({
						product_name: "Ship by Sunday",
					}),
				}),
			}),
		);
	});
});
