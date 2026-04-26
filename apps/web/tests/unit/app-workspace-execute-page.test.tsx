import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLessonHref } from "@/features/course/lesson/routing/lesson-routes";

const fetchAuthenticatedQueryMock = vi.fn();
const redirectMock = vi.fn((href: string) => {
	throw new Error(`NEXT_REDIRECT:${href}`);
});

vi.mock("@/convex/_generated/api", () => ({
	api: {
		blueprint: {
			getBlueprintResumeDestination: "getBlueprintResumeDestination",
		},
	},
}));

vi.mock("next/navigation", () => ({
	redirect: (href: string) => redirectMock(href),
}));

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		scroll: _scroll,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
		children: React.ReactNode;
		href: string;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock("@/platform/convex/server-preload", () => ({
	fetchAuthenticatedQuery: fetchAuthenticatedQueryMock,
}));

describe("workspace execute route", () => {
	beforeEach(() => {
		fetchAuthenticatedQueryMock.mockReset();
		redirectMock.mockClear();
		vi.resetModules();
	});

	it("redirects locked visitors back to review", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getBlueprintResumeDestination") {
				return {
					destination: "/review",
					kind: "review",
					blueprintStageId: "review",
					postReviewTargets: null,
				};
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: ExecuteRoutePage } =
			await import("@/app/(workspace)/execute/page");

		await expect(ExecuteRoutePage()).rejects.toThrowError(
			"NEXT_REDIRECT:/review",
		);
		expect(redirectMock).toHaveBeenCalledWith("/review");
	});

	it("redirects unlocked visitors into the canonical build lessons target", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getBlueprintResumeDestination") {
				return {
					destination: getLessonHref("iterate-the-product-with-ai"),
					kind: "post_review",
					blueprintStageId: null,
					postReviewTargets: {
						reviewDestination: "/review",
						buildLessonsDestination: getLessonHref(
							"iterate-the-product-with-ai",
						),
						launchLessonsDestination: getLessonHref("product-review"),
						lessonMapDestination: "/review?showLessonMap=1",
						latestLessonDestination: getLessonHref(
							"iterate-the-product-with-ai",
						),
					},
				};
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: ExecuteRoutePage } =
			await import("@/app/(workspace)/execute/page");

		await expect(ExecuteRoutePage()).rejects.toThrowError(
			`NEXT_REDIRECT:${getLessonHref("iterate-the-product-with-ai")}`,
		);
		expect(redirectMock).toHaveBeenCalledWith(
			getLessonHref("iterate-the-product-with-ai"),
		);
	});
});
