import React from "react";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BonusLessonViewTracker } from "@/features/execute-ship/components/bonus-lesson-view-tracker";
import { BONUS_LESSON_VIEWED_ENDPOINT } from "@/features/execute-ship/lib/bonus-lesson-view-contract";

describe("BonusLessonViewTracker", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it("posts the current bonus lesson to the server boundary on mount", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			Response.json({
				viewedAt: 123,
				created: true,
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		render(<BonusLessonViewTracker lessonKey="iterate-the-product-with-ai" />);

		await waitFor(() => {
			expect(fetchMock).toHaveBeenCalledWith(
				BONUS_LESSON_VIEWED_ENDPOINT,
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify({
						lessonKey: "iterate-the-product-with-ai",
					}),
				}),
			);
		});
	});

	it("stops retrying after terminal server responses", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			Response.json(
				{
					error: "Sign in before tracking bonus lesson progress.",
					code: "UNAUTHORIZED",
				},
				{ status: 401 },
			),
		);
		vi.stubGlobal("fetch", fetchMock);

		const { rerender } = render(
			<BonusLessonViewTracker lessonKey="iterate-the-product-with-ai" />,
		);

		await waitFor(() => {
			expect(fetchMock).toHaveBeenCalledTimes(1);
		});

		rerender(
			<BonusLessonViewTracker lessonKey="iterate-the-product-with-ai" />,
		);

		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("keeps network failures non-blocking", async () => {
		const fetchMock = vi.fn().mockRejectedValue(new Error("network offline"));
		vi.stubGlobal("fetch", fetchMock);

		render(<BonusLessonViewTracker lessonKey="iterate-the-product-with-ai" />);

		await waitFor(() => {
			expect(fetchMock).toHaveBeenCalledTimes(1);
		});
		await new Promise((resolve) => setTimeout(resolve, 0));
	});
});
