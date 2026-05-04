/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import type { ReactMutation } from "convex/react";
import {
	buildDesignPresetFactSeed,
	createCanonicalProjectDefinition,
	createCompleteProjectDefinition,
	designPresetDerivedFactKeys,
} from "@shipbysunday/codebase-compiler";
import { describe, expect, it, vi } from "vitest";
vi.mock("@clerk/nextjs", () => ({
	useUser: () => ({
		isLoaded: true,
		user: null,
	}),
}));
import { api } from "@/convex/_generated/api";
import { useCodebasePageState } from "@/app/(workspace)/_hooks/codebase-flow/use-codebase-page-state";

type SaveProjectDefinitionFactsMock = ReactMutation<
	typeof api.codebase.saveProjectDefinitionFacts
>;
type UnlockExecuteShipMock = ReactMutation<
	typeof api.codebase.unlockExecuteShip
>;

function createProjectFacts(factOverrides: Record<string, unknown> = {}) {
	return {
		...createCompleteProjectDefinition().facts,
		...factOverrides,
	};
}

function createMutationMock() {
	const saveProjectDefinitionFactsSpy = vi.fn().mockResolvedValue({});
	const unlockExecuteShipSpy = vi.fn().mockResolvedValue({});
	const saveProjectDefinitionFacts = Object.assign(
		(args: unknown) => saveProjectDefinitionFactsSpy(args),
		{
			withOptimisticUpdate: vi.fn(() => saveProjectDefinitionFacts),
		},
	) as SaveProjectDefinitionFactsMock;
	const unlockExecuteShip = Object.assign(
		(args: unknown) => unlockExecuteShipSpy(args),
		{
			withOptimisticUpdate: vi.fn(() => unlockExecuteShip),
		},
	) as UnlockExecuteShipMock;

	return {
		saveProjectDefinitionFacts,
		saveProjectDefinitionFactsSpy,
		unlockExecuteShip,
		unlockExecuteShipSpy,
	};
}

describe("useCodebasePageState", () => {
	it("keeps typing local until Continue is pressed, then reveals missing required answers", async () => {
		const {
			saveProjectDefinitionFacts,
			saveProjectDefinitionFactsSpy,
			unlockExecuteShip,
			unlockExecuteShipSpy,
		} = createMutationMock();
		const navigateToHref = vi.fn();
		const { result } = renderHook(() =>
			useCodebasePageState({
				navigateToHref,
				projectFacts: createProjectFacts({
					product_name: undefined,
					product_summary: undefined,
					primary_user: undefined,
					pricing: undefined,
				}),
				saveProjectDefinitionFacts,
				unlockExecuteShip,
			}),
		);

		await act(async () => {
			result.current.handleFieldChange(
				"product_name",
				"Ship the single codebase workspace",
			);
		});

		expect(saveProjectDefinitionFactsSpy).not.toHaveBeenCalled();
		expect(result.current.feedback).toBeNull();

		await act(async () => {
			await result.current.handleSaveAndContinue();
		});

		expect(saveProjectDefinitionFactsSpy).toHaveBeenCalledTimes(1);
		expect(result.current.feedback).toEqual(
			expect.objectContaining({
				title: "Draft saved.",
			}),
		);
		expect(result.current.currentFieldErrors.product_summary).toBe(
			"Add an answer here before Review can unlock.",
		);
		expect(result.current.currentFieldErrors.primary_user).toBe(
			"Add an answer here before Review can unlock.",
		);
		expect(unlockExecuteShipSpy).not.toHaveBeenCalled();
		expect(navigateToHref).not.toHaveBeenCalled();
	});

	it("omits untouched generated scope fields from the save payload", async () => {
		const {
			saveProjectDefinitionFacts,
			saveProjectDefinitionFactsSpy,
			unlockExecuteShip,
		} = createMutationMock();
		const { result } = renderHook(() =>
			useCodebasePageState({
				navigateToHref: vi.fn(),
				projectFacts: createProjectFacts({
					scope_in: undefined,
					scope_out: undefined,
				}),
				saveProjectDefinitionFacts,
				unlockExecuteShip,
			}),
		);

		await act(async () => {
			result.current.handleFieldChange("pricing", "49");
		});

		await act(async () => {
			await result.current.handleSaveAndContinue();
		});

		expect(saveProjectDefinitionFactsSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				factsPatch: expect.objectContaining({
					pricing: 49,
				}),
			}),
		);
		const saveCall = saveProjectDefinitionFactsSpy.mock.calls[0]?.[0] as {
			factsPatch: Record<string, unknown>;
		};
		expect(saveCall.factsPatch.scope_in).toBeUndefined();
		expect(saveCall.factsPatch.scope_out).toBeUndefined();
	});

	it("navigates to review once the codebase is complete", async () => {
		const {
			saveProjectDefinitionFacts,
			unlockExecuteShip,
			unlockExecuteShipSpy,
		} = createMutationMock();
		const navigateToHref = vi.fn();
		const { result } = renderHook(() =>
			useCodebasePageState({
				navigateToHref,
				projectFacts: createProjectFacts(),
				saveProjectDefinitionFacts,
				unlockExecuteShip,
			}),
		);

		await act(async () => {
			result.current.handleFieldChange(
				"product_name",
				"Ship by Sunday Codebase",
			);
		});

		await act(async () => {
			await result.current.handleSaveAndContinue();
		});

		expect(unlockExecuteShipSpy).toHaveBeenCalledWith({});
		expect(navigateToHref).toHaveBeenCalledWith("/review?download=1");
	});

	it("clears stale derived design facts when the preset changes", async () => {
		const {
			saveProjectDefinitionFacts,
			saveProjectDefinitionFactsSpy,
			unlockExecuteShip,
		} = createMutationMock();
		const derivedProjectFacts = createCanonicalProjectDefinition({
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
				design_preset_id: "vercel",
				theme_preset: buildDesignPresetFactSeed("vercel").theme_preset,
				design_references: ["https://getdesign.md/vercel/design-md"],
			},
			placeholdersInUse: [],
			createdAt: 1,
			updatedAt: 1,
		}).facts;
		const { result } = renderHook(() =>
			useCodebasePageState({
				navigateToHref: vi.fn(),
				projectFacts: derivedProjectFacts,
				saveProjectDefinitionFacts,
				unlockExecuteShip,
			}),
		);

		await act(async () => {
			result.current.handleFieldChange("design_preset_id", "notion");
			result.current.handleFieldChange(
				"theme_preset",
				buildDesignPresetFactSeed("notion").theme_preset,
			);
			result.current.handleFieldChange(
				"design_references",
				"https://getdesign.md/notion/design-md",
			);
		});

		await act(async () => {
			await result.current.handleSaveAndContinue();
		});

		expect(saveProjectDefinitionFactsSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				clearedFieldKeys: expect.arrayContaining([
					...designPresetDerivedFactKeys,
				]),
				factsPatch: expect.objectContaining({
					design_preset_id: "notion",
					theme_preset: buildDesignPresetFactSeed("notion").theme_preset,
				}),
			}),
		);
	});

	it("preserves authored design copy when the preset changes", async () => {
		const {
			saveProjectDefinitionFacts,
			saveProjectDefinitionFactsSpy,
			unlockExecuteShip,
		} = createMutationMock();
		const { result } = renderHook(() =>
			useCodebasePageState({
				navigateToHref: vi.fn(),
				projectFacts: createProjectFacts({
					visual_thesis: "Hand-authored visual thesis",
					copy_tone: "Hand-authored copy tone",
				}),
				saveProjectDefinitionFacts,
				unlockExecuteShip,
			}),
		);

		await act(async () => {
			result.current.handleFieldChange("design_preset_id", "notion");
			result.current.handleFieldChange(
				"theme_preset",
				buildDesignPresetFactSeed("notion").theme_preset,
			);
			result.current.handleFieldChange(
				"design_references",
				"https://getdesign.md/notion/design-md",
			);
		});

		await act(async () => {
			await result.current.handleSaveAndContinue();
		});

		expect(saveProjectDefinitionFactsSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				clearedFieldKeys: expect.not.arrayContaining([
					"visual_thesis",
					"copy_tone",
				]),
			}),
		);
	});
});
