/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import type { ReactMutation } from "convex/react";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
	getBlueprintStageDefinition,
} from "@blueprint-compiler";
import { describe, expect, it, vi } from "vitest";
vi.mock("@clerk/nextjs", () => ({
	useUser: () => ({
		isLoaded: true,
		user: null,
	}),
}));
import { PRODUCT_APP_ID } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { useBlueprintStageStepState } from "@/features/blueprint-flow/hooks/use-blueprint-stage-step-state";
import type { BlueprintWorkspaceState } from "@/features/blueprint-flow/lib/blueprint-workspace-types";

type SaveProjectDefinitionFactsMock = ReactMutation<
	typeof api.blueprint.saveProjectDefinitionFacts
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

function createBlueprintWorkspaceState(
	projectFacts: ReturnType<typeof createProjectFacts> | null,
): BlueprintWorkspaceState {
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
		blueprintReadiness: stageStatus.blueprintReadiness,
		stageStatuses: stageStatus.stageStatuses,
	} as BlueprintWorkspaceState;
}

async function setCurrentFieldValue(
	result: {
		current: ReturnType<typeof useBlueprintStageStepState>;
	},
	fieldKey: "product_name" | "product_summary" | "primary_user" | "pricing",
	value: string,
) {
	await act(async () => {
		result.current.handleFieldChange(fieldKey, value);
	});
}

describe("useBlueprintStageStepState", () => {
	it("keeps typing silent until Continue is pressed", async () => {
		const stage = getBlueprintStageDefinition("product");
		const { saveProjectDefinitionFacts, saveProjectDefinitionFactsSpy } =
			createSaveProjectDefinitionFactsMutation();
		const { projectFacts, stageStatus } = getStageStatus("product", {
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
		});
		const navigateToHref = vi.fn();
		const onDirtyChange = vi.fn();
		const requestNavigation = vi.fn();
		const { result } = renderHook(() =>
			useBlueprintStageStepState({
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
			"Ship the blueprint-first launch system",
		);

		expect(saveProjectDefinitionFactsSpy).not.toHaveBeenCalled();
		expect(result.current.currentFeedback).toBeNull();
		expect(result.current.currentFieldErrors).toEqual({});
		expect(navigateToHref).not.toHaveBeenCalled();
		expect(requestNavigation).not.toHaveBeenCalled();
		expect(onDirtyChange).toHaveBeenLastCalledWith(true);
	});

	it("reveals missing required fields only after Continue and clears them as answers arrive", async () => {
		const stage = getBlueprintStageDefinition("product");
		const { saveProjectDefinitionFacts, saveProjectDefinitionFactsSpy } =
			createSaveProjectDefinitionFactsMutation();
		const { projectFacts, stageStatus } = getStageStatus("product", {
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
		});
		const { result } = renderHook(() =>
			useBlueprintStageStepState({
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
			"Ship the blueprint-first launch system",
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
				title: "Draft saved.",
			}),
		);
		expect(result.current.currentFieldErrors).toEqual({
			product_summary: "Add an answer here before this page can complete.",
			primary_user: "Add an answer here before this page can complete.",
		});

		await setCurrentFieldValue(
			result,
			"product_summary",
			"A guided blueprint flow that compiles product, design, marketing, and build inputs into one starter snapshot.",
		);

		expect(result.current.currentFieldErrors).toEqual({
			primary_user: "Add an answer here before this page can complete.",
		});

		await setCurrentFieldValue(
			result,
			"primary_user",
			"A solo builder who needs to turn one idea into a launchable starter quickly.",
		);

		expect(result.current.currentFieldErrors).toEqual({});
		expect(result.current.currentFeedback).toBeNull();
	});

	it("keeps the final build-plan page in place when earlier blockers still exist", async () => {
		const stage = getBlueprintStageDefinition("build-plan");
		const navigateToHref = vi.fn();
		const { saveProjectDefinitionFacts, saveProjectDefinitionFactsSpy } =
			createSaveProjectDefinitionFactsMutation();
		const { projectFacts, stageStatus } = getStageStatus("build-plan", {
			pricing: undefined,
			price_usd_cents: undefined,
		});
		const { result } = renderHook(() =>
			useBlueprintStageStepState({
				navigateToHref,
				onDirtyChange: vi.fn(),
				requestNavigation: vi.fn(),
				stage,
				stageId: "build-plan",
				stageStatus,
				stepId: "setup",
				previousHref: "/build-plan/delivery",
				nextHref: "/review",
				projectFacts,
				saveProjectDefinitionFacts,
			}),
		);

		await act(async () => {
			await result.current.handleSaveAndContinue();
		});

		expect(saveProjectDefinitionFactsSpy).not.toHaveBeenCalled();
		expect(navigateToHref).not.toHaveBeenCalled();
		expect(result.current.currentFeedback).toEqual(
			expect.objectContaining({
				title: "Saved and complete.",
				description: "Setup is ready to continue.",
			}),
		);
	});

	it("routes to review when the final build-plan page has no remaining blockers", async () => {
		const stage = getBlueprintStageDefinition("build-plan");
		const navigateToHref = vi.fn();
		const { saveProjectDefinitionFacts, saveProjectDefinitionFactsSpy } =
			createSaveProjectDefinitionFactsMutation();
		const { projectFacts, stageStatus } = getStageStatus("build-plan");
		const { result } = renderHook(() =>
			useBlueprintStageStepState({
				navigateToHref,
				onDirtyChange: vi.fn(),
				requestNavigation: vi.fn(),
				stage,
				stageId: "build-plan",
				stageStatus,
				stepId: "setup",
				previousHref: "/build-plan/delivery",
				nextHref: "/review",
				projectFacts,
				saveProjectDefinitionFacts,
			}),
		);

		await act(async () => {
			await result.current.handleSaveAndContinue();
		});

		expect(saveProjectDefinitionFactsSpy).not.toHaveBeenCalled();
		expect(navigateToHref).toHaveBeenCalledWith("/review");
	});

	it("creates an optimistic project definition when the first blueprint save starts from null", async () => {
		const stage = getBlueprintStageDefinition("product");
		const { saveProjectDefinitionFacts } =
			createSaveProjectDefinitionFactsMutation();
		const { projectFacts, stageStatus } = getStageStatus("product", {
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
		});

		renderHook(() =>
			useBlueprintStageStepState({
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
			getQuery: vi.fn(() => createBlueprintWorkspaceState(null)),
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
			api.blueprint.getBlueprintWorkspaceState,
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
		const stage = getBlueprintStageDefinition("product");
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
		});
		const { result } = renderHook(() =>
			useBlueprintStageStepState({
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
