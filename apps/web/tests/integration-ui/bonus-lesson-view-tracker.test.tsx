import React from "react";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const markBonusLessonViewedMock = vi.fn();
const useMutationMock = vi.fn(() => markBonusLessonViewedMock);

vi.mock("convex/react", () => ({
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
});
