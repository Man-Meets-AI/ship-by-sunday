import React from "react";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const markBonusLessonViewedMock = vi.fn();
const useMutationMock = vi.fn(() => markBonusLessonViewedMock);
const useConvexAuthMock = vi.fn();

vi.mock("convex/react", () => ({
	useConvexAuth: () => useConvexAuthMock(),
	useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		course: {
			markBonusLessonViewed: "markBonusLessonViewed",
		},
	},
}));

import { BonusLessonViewTracker } from "@/features/execute-ship/components/bonus-lesson-view-tracker";

describe("BonusLessonViewTracker", () => {
	beforeEach(() => {
		markBonusLessonViewedMock.mockReset();
		useMutationMock.mockClear();
		useConvexAuthMock.mockReset();
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
		});
		markBonusLessonViewedMock.mockResolvedValue({
			viewedAt: 123,
			created: true,
		});
	});

	it("marks the current bonus lesson as viewed on mount", async () => {
		render(<BonusLessonViewTracker lessonKey="iterate-the-product-with-ai" />);

		await waitFor(() => {
			expect(useMutationMock).toHaveBeenCalledWith("markBonusLessonViewed");
			expect(markBonusLessonViewedMock).toHaveBeenCalledWith({
				lessonKey: "iterate-the-product-with-ai",
			});
		});
	});

	it("stops retrying after auth or access failures", async () => {
		markBonusLessonViewedMock.mockRejectedValueOnce(new Error("Unauthorized"));

		const { rerender } = render(
			<BonusLessonViewTracker lessonKey="iterate-the-product-with-ai" />,
		);

		await waitFor(() => {
			expect(markBonusLessonViewedMock).toHaveBeenCalledTimes(1);
		});

		rerender(
			<BonusLessonViewTracker lessonKey="iterate-the-product-with-ai" />,
		);

		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(markBonusLessonViewedMock).toHaveBeenCalledTimes(1);
	});

	it("waits for Convex auth readiness before marking the lesson as viewed", async () => {
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: false,
			isLoading: true,
		});

		const { rerender } = render(
			<BonusLessonViewTracker lessonKey="iterate-the-product-with-ai" />,
		);

		expect(markBonusLessonViewedMock).not.toHaveBeenCalled();

		useConvexAuthMock.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
		});

		rerender(
			<BonusLessonViewTracker lessonKey="iterate-the-product-with-ai" />,
		);

		await waitFor(() => {
			expect(markBonusLessonViewedMock).toHaveBeenCalledWith({
				lessonKey: "iterate-the-product-with-ai",
			});
		});
	});
});
