import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchAuthenticatedQueryMock = vi.fn();
const redirectMock = vi.fn((href: string) => {
	throw new Error(`NEXT_REDIRECT:${href}`);
});

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

vi.mock("@/features/workspace-shell/components/app-shell", () => ({
	AppShell: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

vi.mock("@/platform/convex/server-preload", () => ({
	fetchAuthenticatedQuery: fetchAuthenticatedQueryMock,
}));

vi.mock("next/navigation", () => ({
	redirect: (href: string) => redirectMock(href),
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		blueprint: {
			getBlueprintResumeDestination: "getBlueprintResumeDestination",
		},
	},
}));

describe("workspace mission route", () => {
	beforeEach(() => {
		fetchAuthenticatedQueryMock.mockReset();
		redirectMock.mockReset();
		vi.resetModules();
	});

	it("renders explicit unlock messaging before the bonus is available", async () => {
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

		const { default: MissionRoutePage } =
			await import("@/app/(workspace)/mission/page");

		const markup = renderToStaticMarkup(await MissionRoutePage());

		expect(markup).toContain("Lesson Map opens after Review.");
		expect(markup).toContain('href="/review"');
	});

	it("keeps the restored route reachable after unlock without redirecting to start", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getBlueprintResumeDestination") {
				return {
					destination: "/lesson/iterate-the-product-with-ai",
					kind: "post_review",
					blueprintStageId: null,
					postReviewTargets: {
						reviewDestination: "/review",
						buildLessonsDestination: "/lesson/iterate-the-product-with-ai",
						launchLessonsDestination: "/lesson/product-review",
						lessonMapDestination: "/review?showLessonMap=1",
						latestLessonDestination: "/lesson/iterate-the-product-with-ai",
					},
				};
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: MissionRoutePage } =
			await import("@/app/(workspace)/mission/page");

		await expect(MissionRoutePage()).rejects.toThrowError(
			"NEXT_REDIRECT:/review?showLessonMap=1",
		);
		expect(redirectMock).toHaveBeenCalledWith("/review?showLessonMap=1");
	});
});
