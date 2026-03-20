/** @vitest-environment jsdom */

import { renderHook, act } from "@testing-library/react";

import { timingConfig } from "@/config/product";
import { useLessonState } from "@/features/course/lesson/hooks/use-lesson-state";

const useConvexAuthMock = vi.fn();
const useQueryMock = vi.fn();
const useMutationMock = vi.fn();

const markLessonViewedMutation = vi.fn();
const saveLessonDraftMutation = vi.fn();
const unlockedLessonState = {
	accessStatus: "unlocked" as const,
	fieldValues: {
		app_idea: "Ship the landing page",
		problem_to_solve: "Onboarding is scattered",
		why_ship_now: "Pilot users asked for a single place to finish setup",
		intro_readiness_checklist: [
			{ label: "See the 4-block path", checked: true },
			{ label: "Define the thing you are here to ship", checked: true },
			{ label: "Commit to doing reps instead of just watching", checked: true },
		],
		__fieldShapeVersion: 1,
	},
	status: "in_progress",
	pinnedArtifacts: [],
};

vi.mock("convex/react", () => ({
	useConvexAuth: () => useConvexAuthMock(),
	useQuery: (query: unknown, args: unknown) => useQueryMock(query, args),
	useMutation: (mutation: unknown) => useMutationMock(mutation),
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		course: {
			getLessonState: "getLessonState",
			markLessonViewed: "markLessonViewed",
			saveLessonDraft: "saveLessonDraft",
		},
	},
}));

describe("useLessonState", () => {
	const flushEffects = () =>
		act(async () => {
			await Promise.resolve();
		});

	beforeEach(() => {
		vi.useFakeTimers();
		useConvexAuthMock.mockReset();
		useQueryMock.mockReset();
		useMutationMock.mockReset();
		markLessonViewedMutation.mockReset();
		saveLessonDraftMutation.mockReset();

		useConvexAuthMock.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
		});
		useQueryMock.mockReturnValue(unlockedLessonState);
		markLessonViewedMutation.mockResolvedValue({
			viewedAt: 1,
			created: false,
		});
		useMutationMock.mockImplementation((mutation) => {
			if (mutation === "markLessonViewed") {
				return markLessonViewedMutation;
			}
			if (mutation === "saveLessonDraft") {
				return saveLessonDraftMutation;
			}
			throw new Error(`Unexpected mutation: ${String(mutation)}`);
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("does not enter saving during initial lesson hydration", async () => {
		const { result } = renderHook(() => useLessonState({ lessonId: "1.1" }));

		await flushEffects();

		expect(result.current.fieldValuesReady).toBe(true);
		expect(result.current.fieldValues).toEqual(unlockedLessonState.fieldValues);
		expect(result.current.saveStatus).toBe("idle");

		await act(async () => {
			vi.runOnlyPendingTimers();
		});

		expect(saveLessonDraftMutation).not.toHaveBeenCalled();
		expect(result.current.saveStatus).toBe("idle");
	});

	it("only enters saving after the debounce starts a real draft mutation", async () => {
		let resolveSave: (() => void) | null = null;
		saveLessonDraftMutation.mockReturnValue(
			new Promise<{ savedAt: number }>((resolve) => {
				resolveSave = () => resolve({ savedAt: 123 });
			}),
		);

		const { result } = renderHook(() => useLessonState({ lessonId: "1.1" }));

		await flushEffects();

		expect(result.current.fieldValuesReady).toBe(true);

		act(() => {
			result.current.setFieldValue(
				"app_idea",
				"Ship the onboarding flow",
			);
		});

		expect(result.current.saveStatus).toBe("idle");

		await act(async () => {
			vi.advanceTimersByTime(timingConfig.lessonAutosaveDebounceMs - 1);
		});

		expect(saveLessonDraftMutation).not.toHaveBeenCalled();
		expect(result.current.saveStatus).toBe("idle");

		await act(async () => {
			vi.advanceTimersByTime(1);
		});

		expect(saveLessonDraftMutation).toHaveBeenCalledTimes(1);
		expect(result.current.saveStatus).toBe("saving");

		await act(async () => {
			resolveSave?.();
		});

		await flushEffects();

		expect(result.current.saveStatus).toBe("saved");
	});
});
