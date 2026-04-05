/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import type { ReactMutation } from "convex/react";
import { createCompleteProjectDefinition } from "@shipbysunday/blueprint-compiler";
import { describe, expect, it, vi } from "vitest";
vi.mock("@clerk/nextjs", () => ({
	useUser: () => ({
		isLoaded: true,
		user: null,
	}),
}));
import { api } from "@/convex/_generated/api";
import { useBlueprintPageState } from "@/features/blueprint-flow/hooks/use-blueprint-page-state";

type SaveProjectDefinitionFactsMock = ReactMutation<
	typeof api.blueprint.saveProjectDefinitionFacts
>;
type UnlockExecuteShipMock = ReactMutation<
	typeof api.blueprint.unlockExecuteShip
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

describe("useBlueprintPageState", () => {
	it("keeps typing local until Continue is pressed, then reveals missing required answers", async () => {
		const {
			saveProjectDefinitionFacts,
			saveProjectDefinitionFactsSpy,
			unlockExecuteShip,
			unlockExecuteShipSpy,
		} = createMutationMock();
		const navigateToHref = vi.fn();
		const { result } = renderHook(() =>
			useBlueprintPageState({
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
				"Ship the single blueprint workspace",
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
			useBlueprintPageState({
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

	it("navigates to review once the blueprint is complete", async () => {
		const {
			saveProjectDefinitionFacts,
			unlockExecuteShip,
			unlockExecuteShipSpy,
		} = createMutationMock();
		const navigateToHref = vi.fn();
		const { result } = renderHook(() =>
			useBlueprintPageState({
				navigateToHref,
				projectFacts: createProjectFacts(),
				saveProjectDefinitionFacts,
				unlockExecuteShip,
			}),
		);

		await act(async () => {
			result.current.handleFieldChange(
				"product_name",
				"Ship by Sunday Blueprint",
			);
		});

		await act(async () => {
			await result.current.handleSaveAndContinue();
		});

		expect(unlockExecuteShipSpy).toHaveBeenCalledWith({});
		expect(navigateToHref).toHaveBeenCalledWith("/review?download=1");
	});
});
