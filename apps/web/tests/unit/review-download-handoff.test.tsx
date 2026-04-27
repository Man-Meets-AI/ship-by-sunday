/** @vitest-environment jsdom */

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/config/product", () => ({
	routeConfig: {
		review: "/review?showLessonMap=1",
	},
}));

import {
	getReviewAutoDownloadHref,
	isReviewAutoDownloadEnabled,
} from "@/lib/blueprint-flow/review-download-handoff";
import { useReviewDownloadHandoff } from "@/app/(workspace)/review/_hooks/use-review-download-handoff";

describe("review download handoff", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		window.history.replaceState({}, "", "/review");
	});

	it("builds the review download href and only enables the exact query value", () => {
		expect(getReviewAutoDownloadHref()).toBe(
			"/review?showLessonMap=1&download=1",
		);
		expect(isReviewAutoDownloadEnabled("1")).toBe(true);
		expect(isReviewAutoDownloadEnabled("0")).toBe(false);
		expect(isReviewAutoDownloadEnabled(["1"])).toBe(false);
		expect(isReviewAutoDownloadEnabled(undefined)).toBe(false);
	});

	it("returns the fallback label when auto download is disabled", () => {
		const { result } = renderHook(() =>
			useReviewDownloadHandoff({
				autoDownloadEnabled: false,
			}),
		);

		expect(result.current.downloadHref).toBe("/api/download/repo");
		expect(result.current.fallbackLinkLabel).toBe(
			"Need the Ship by Sunday Blueprint again? Download it here.",
		);
	});

	it("clicks the hidden download link once and clears the auto-download query param", async () => {
		window.history.replaceState(
			{},
			"",
			"/review?download=1&showLessonMap=1#handoff",
		);
		const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");

		const { result, rerender } = renderHook(
			({ autoDownloadEnabled }) =>
				useReviewDownloadHandoff({
					autoDownloadEnabled,
				}),
			{
				initialProps: {
					autoDownloadEnabled: true,
				},
			},
		);

		await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
		expect(result.current.fallbackLinkLabel).toBe(
			"Download didn’t start? Click here.",
		);
		expect(result.current.downloadHref).toBe("/api/download/repo");
		expect(
			window.location.pathname + window.location.search + window.location.hash,
		).toBe("/review?showLessonMap=1#handoff");

		await act(async () => {
			rerender({
				autoDownloadEnabled: true,
			});
		});

		expect(clickSpy).toHaveBeenCalledTimes(1);
	});
});
