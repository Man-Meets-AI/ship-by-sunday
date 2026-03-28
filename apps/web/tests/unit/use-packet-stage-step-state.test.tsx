/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import type { ReactMutation } from "convex/react";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
	getPacketStageDefinition,
} from "@packet-compiler";
import { describe, expect, it, vi } from "vitest";
import { PRODUCT_APP_ID } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { usePacketStageStepState } from "@/features/packet-flow/hooks/use-packet-stage-step-state";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";

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

function createSaveProjectDefinitionFactsMutationWithSpy(
	saveProjectDefinitionFactsSpy: ReturnType<typeof vi.fn>,
) {
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
	} as PacketWorkspaceState;
}

async function setCurrentFieldValue(
	result: {
		current: ReturnType<typeof usePacketStageStepState>;
	},
	fieldKey:
		| "product_name"
		| "product_summary"
		| "primary_user"
		| "why_this_matters"
		| "done_when"
		| "acceptance_criteria"
		| "validation_plan"
		| "demo_flow",
	value: string,
) {
	await act(async () => {
		result.current.handleFieldChange(fieldKey, value);
	});
}

describe("usePacketStageStepState", () => {
	it("keeps typing silent until Continue is pressed", async () => {
		const stage = getPacketStageDefinition("product");
		const { saveProjectDefinitionFacts, saveProjectDefinitionFactsSpy } =
			createSaveProjectDefinitionFactsMutation();
		const { projectFacts, stageStatus } = getStageStatus("product", {
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
			why_this_matters: undefined,
		});
		const navigateToHref = vi.fn();
		const onDirtyChange = vi.fn();
		const requestNavigation = vi.fn();
		const { result } = renderHook(() =>
			usePacketStageStepState({
				navigateToHref,
				onDirtyChange,
				requestNavigation,
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
			"product_name",
			"Ship the packet-first launch system",
		);

		expect(saveProjectDefinitionFactsSpy).not.toHaveBeenCalled();
		expect(result.current.currentFeedback).toBeNull();
		expect(result.current.currentFieldErrors).toEqual({});
		expect(navigateToHref).not.toHaveBeenCalled();
		expect(requestNavigation).not.toHaveBeenCalled();
		expect(onDirtyChange).toHaveBeenLastCalledWith(true);
	});

	it("reveals missing required fields only after Continue and clears them as answers arrive", async () => {
		const stage = getPacketStageDefinition("product");
		const { saveProjectDefinitionFacts, saveProjectDefinitionFactsSpy } =
			createSaveProjectDefinitionFactsMutation();
		const { projectFacts, stageStatus } = getStageStatus("product", {
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
			why_this_matters: undefined,
		});
		const { result } = renderHook(() =>
			usePacketStageStepState({
				navigateToHref: vi.fn(),
				onDirtyChange: vi.fn(),
				requestNavigation: vi.fn(),
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
			"product_name",
			"Ship the packet-first launch system",
		);

		expect(saveProjectDefinitionFactsSpy).not.toHaveBeenCalled();
		expect(result.current.currentFeedback).toBeNull();
		expect(result.current.currentFieldErrors).toEqual({});

		await act(async () => {
			await result.current.handleSaveAndContinue();
		});

		expect(saveProjectDefinitionFactsSpy).toHaveBeenCalledTimes(1);
		expect(result.current.currentFeedback).toEqual(
			expect.objectContaining({
				title: "Saved for now.",
			}),
		);
		expect(result.current.currentFieldErrors).toEqual({
			product_summary: "Add an answer here before this page can complete.",
			primary_user: "Add an answer here before this page can complete.",
			why_this_matters: "Add an answer here before this page can complete.",
		});

		await setCurrentFieldValue(
			result,
			"product_summary",
			"A guided packet flow that compiles product, design, marketing, and build inputs into one starter snapshot.",
		);

		expect(result.current.currentFieldErrors).toEqual({
			primary_user: "Add an answer here before this page can complete.",
			why_this_matters: "Add an answer here before this page can complete.",
		});

		await setCurrentFieldValue(
			result,
			"primary_user",
			"A solo builder who needs to turn one idea into a launchable starter quickly.",
		);
		await setCurrentFieldValue(
			result,
			"why_this_matters",
			"Without a tight packet, the builder keeps restarting and never gets to a shippable first version.",
		);

		expect(result.current.currentFieldErrors).toEqual({});
		expect(result.current.currentFeedback).toBeNull();
	});

	it("keeps the last build-plan page in place when earlier blockers still exist", async () => {
		const stage = getPacketStageDefinition("build-plan");
		const navigateToHref = vi.fn();
		const { saveProjectDefinitionFacts, saveProjectDefinitionFactsSpy } =
			createSaveProjectDefinitionFactsMutation();
		const { projectFacts, stageStatus } = getStageStatus("build-plan", {
			objective: undefined,
			done_when: undefined,
			acceptance_criteria: undefined,
			validation_plan: undefined,
			demo_flow: undefined,
		});
		const { result } = renderHook(() =>
			usePacketStageStepState({
				navigateToHref,
				onDirtyChange: vi.fn(),
				requestNavigation: vi.fn(),
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
			"done_when",
			"Buyers can answer the packet flow and download the starter snapshot.",
		);
		await setCurrentFieldValue(
			result,
			"acceptance_criteria",
			"Complete all packet stages\nDownload starter snapshot",
		);
		await setCurrentFieldValue(
			result,
			"validation_plan",
			"Run packet stage smoke tests\nCheck review download state",
		);
		await setCurrentFieldValue(
			result,
			"demo_flow",
			"Product stage to review download in one sitting.",
		);

		await act(async () => {
			await result.current.handleSaveAndContinue();
		});

		expect(saveProjectDefinitionFactsSpy).toHaveBeenCalledTimes(1);
		expect(navigateToHref).not.toHaveBeenCalled();
		expect(result.current.currentFeedback).toEqual(
			expect.objectContaining({
				title: "Saved.",
				description: "Validation is locked.",
			}),
		);
	});

	it("routes to review when the final build-plan page resolves the last blocker", async () => {
		const stage = getPacketStageDefinition("build-plan");
		const navigateToHref = vi.fn();
		const { saveProjectDefinitionFacts, saveProjectDefinitionFactsSpy } =
			createSaveProjectDefinitionFactsMutation();
		const { projectFacts, stageStatus } = getStageStatus("build-plan", {
			done_when: undefined,
			acceptance_criteria: undefined,
			validation_plan: undefined,
			demo_flow: undefined,
		});
		const { result } = renderHook(() =>
			usePacketStageStepState({
				navigateToHref,
				onDirtyChange: vi.fn(),
				requestNavigation: vi.fn(),
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
			"done_when",
			"Buyers can answer the packet flow and download the starter snapshot.",
		);
		await setCurrentFieldValue(
			result,
			"acceptance_criteria",
			"Complete all packet stages\nDownload starter snapshot",
		);
		await setCurrentFieldValue(
			result,
			"validation_plan",
			"Run packet stage smoke tests\nCheck review download state",
		);
		await setCurrentFieldValue(
			result,
			"demo_flow",
			"Product stage to review download in one sitting.",
		);

		await act(async () => {
			await result.current.handleSaveAndContinue();
		});

		expect(saveProjectDefinitionFactsSpy).toHaveBeenCalledTimes(1);
		expect(navigateToHref).toHaveBeenCalledWith("/review");
	});

	it("creates an optimistic project definition when the first packet save starts from null", async () => {
		const stage = getPacketStageDefinition("product");
		const { saveProjectDefinitionFacts } =
			createSaveProjectDefinitionFactsMutation();
		const { projectFacts, stageStatus } = getStageStatus("product", {
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
			why_this_matters: undefined,
		});

		renderHook(() =>
			usePacketStageStepState({
				navigateToHref: vi.fn(),
				onDirtyChange: vi.fn(),
				requestNavigation: vi.fn(),
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

	it("shows a save failure inline, preserves the draft, and does not retry on its own", async () => {
		const stage = getPacketStageDefinition("product");
		const saveProjectDefinitionFactsSpy = vi
			.fn()
			.mockRejectedValueOnce(new Error("Save failed"))
			.mockResolvedValue({});
		const { saveProjectDefinitionFacts } =
			createSaveProjectDefinitionFactsMutationWithSpy(
				saveProjectDefinitionFactsSpy,
			);
		const { projectFacts, stageStatus } = getStageStatus("product", {
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
			why_this_matters: undefined,
		});
		const { result } = renderHook(() =>
			usePacketStageStepState({
				navigateToHref: vi.fn(),
				onDirtyChange: vi.fn(),
				requestNavigation: vi.fn(),
				stage,
				stageId: "product",
				stageStatus,
				stepId: "foundation",
				projectFacts,
				saveProjectDefinitionFacts,
			}),
		);

		await setCurrentFieldValue(result, "product_name", "Ship by Sunday");

		await act(async () => {
			await result.current.handleSaveAndContinue();
		});

		expect(saveProjectDefinitionFactsSpy).toHaveBeenCalledTimes(1);
		expect(result.current.currentFeedback).toEqual(
			expect.objectContaining({
				title: "We could not save this page right now.",
			}),
		);
		expect(result.current.currentDraftValues.product_name).toBe(
			"Ship by Sunday",
		);

		await act(async () => {
			await Promise.resolve();
		});

		expect(saveProjectDefinitionFactsSpy).toHaveBeenCalledTimes(1);
	});
});
