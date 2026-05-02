import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { HomePageBlueprintDraftFields } from "@/app/_components/home-page/sections/blueprint-demo/home-page-blueprint-draft-storage";
import { useBlueprintLocalDraftSeeder } from "@/lib/blueprint-flow/use-blueprint-local-draft-seeder";
import type { BlueprintWorkspaceState } from "@/lib/blueprint-flow/blueprint-workspace-types";

const baseFields: HomePageBlueprintDraftFields = {
	product_name: "Telemetry Pro",
	product_summary: "A focused telemetry workspace for solo founders.",
	primary_user: "Solo founders shipping in public",
	design_preset_id: "linear",
	theme_preset: "abc123",
	pricing_model: "monthly",
	pricing: "29",
};

const baseEmptyWorkspaceState: BlueprintWorkspaceState = {
	projectDefinition: null,
	workflowState: null,
	firstIncompleteStageId: "blueprint",
	blueprintReadiness: {
		blueprint: { isReady: false, missingFactKeys: [] },
		review: { isReady: false, missingFactKeys: [] },
	},
	stageStatuses: [],
};

const populatedWorkspaceState: BlueprintWorkspaceState = {
	...baseEmptyWorkspaceState,
	projectDefinition: {
		clerkUserId: "user_existing",
		productKey: "ship-by-sunday",
		schemaVersion: 1,
		facts: {
			product_name: "An older saved product",
			pricing_model: "one_time",
			pricing: 99,
		},
		placeholdersInUse: [],
		createdAt: 1,
		updatedAt: 2,
	},
};

describe("useBlueprintLocalDraftSeeder", () => {
	it("never writes before the user is authenticated and workspace state is ready", async () => {
		const saveProjectDefinitionFacts = vi.fn().mockResolvedValue(null);
		const loadDraftFromStorage = vi.fn(() => baseFields);
		const clearDraftFromStorage = vi.fn();

		renderHook(() =>
			useBlueprintLocalDraftSeeder({
				isAuthenticated: false,
				isAuthLoading: true,
				workspaceState: undefined,
				saveProjectDefinitionFacts,
				loadDraftFromStorage,
				clearDraftFromStorage,
			}),
		);

		expect(saveProjectDefinitionFacts).not.toHaveBeenCalled();
		expect(loadDraftFromStorage).not.toHaveBeenCalled();
		expect(clearDraftFromStorage).not.toHaveBeenCalled();
	});

	it("seeds Convex when authenticated workspace facts are empty and clears storage", async () => {
		const saveProjectDefinitionFacts = vi.fn().mockResolvedValue(null);
		const loadDraftFromStorage = vi.fn(() => baseFields);
		const clearDraftFromStorage = vi.fn();

		renderHook(() =>
			useBlueprintLocalDraftSeeder({
				isAuthenticated: true,
				isAuthLoading: false,
				workspaceState: baseEmptyWorkspaceState,
				saveProjectDefinitionFacts,
				loadDraftFromStorage,
				clearDraftFromStorage,
			}),
		);

		await waitFor(() => {
			expect(saveProjectDefinitionFacts).toHaveBeenCalledTimes(1);
		});

		const callArgs = saveProjectDefinitionFacts.mock.calls[0]?.[0] as
			| {
					factsPatch: Record<string, string | number | string[]>;
			  }
			| undefined;
		expect(callArgs?.factsPatch.product_name).toBe("Telemetry Pro");
		expect(callArgs?.factsPatch.pricing).toBe(29);

		await waitFor(() => {
			expect(clearDraftFromStorage).toHaveBeenCalledTimes(1);
		});
	});

	it("clears the local draft without writing when the workspace already has facts", async () => {
		const saveProjectDefinitionFacts = vi.fn().mockResolvedValue(null);
		const loadDraftFromStorage = vi.fn(() => baseFields);
		const clearDraftFromStorage = vi.fn();

		renderHook(() =>
			useBlueprintLocalDraftSeeder({
				isAuthenticated: true,
				isAuthLoading: false,
				workspaceState: populatedWorkspaceState,
				saveProjectDefinitionFacts,
				loadDraftFromStorage,
				clearDraftFromStorage,
			}),
		);

		await waitFor(() => {
			expect(clearDraftFromStorage).toHaveBeenCalledTimes(1);
		});
		expect(saveProjectDefinitionFacts).not.toHaveBeenCalled();
	});

	it("does nothing when no draft is stored", async () => {
		const saveProjectDefinitionFacts = vi.fn().mockResolvedValue(null);
		const loadDraftFromStorage = vi.fn(() => null);
		const clearDraftFromStorage = vi.fn();

		renderHook(() =>
			useBlueprintLocalDraftSeeder({
				isAuthenticated: true,
				isAuthLoading: false,
				workspaceState: baseEmptyWorkspaceState,
				saveProjectDefinitionFacts,
				loadDraftFromStorage,
				clearDraftFromStorage,
			}),
		);

		await waitFor(() => {
			expect(loadDraftFromStorage).toHaveBeenCalled();
		});
		expect(saveProjectDefinitionFacts).not.toHaveBeenCalled();
		expect(clearDraftFromStorage).not.toHaveBeenCalled();
	});

	it("preserves the local draft when the Convex mutation fails", async () => {
		const saveProjectDefinitionFacts = vi
			.fn()
			.mockRejectedValue(new Error("Convex unavailable"));
		const loadDraftFromStorage = vi.fn(() => baseFields);
		const clearDraftFromStorage = vi.fn();

		renderHook(() =>
			useBlueprintLocalDraftSeeder({
				isAuthenticated: true,
				isAuthLoading: false,
				workspaceState: baseEmptyWorkspaceState,
				saveProjectDefinitionFacts,
				loadDraftFromStorage,
				clearDraftFromStorage,
			}),
		);

		await waitFor(() => {
			expect(saveProjectDefinitionFacts).toHaveBeenCalledTimes(1);
		});

		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(clearDraftFromStorage).not.toHaveBeenCalled();
	});
});
