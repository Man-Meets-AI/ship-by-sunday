import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLessonHref } from "@/lib/course/lesson/routing/lesson-routes";

const fetchAuthenticatedQueryMock = vi.fn();
const getServerProductAccessMock = vi.fn();
const redirectMock = vi.fn((href: string) => {
	throw new Error(`NEXT_REDIRECT:${href}`);
});

vi.mock("server-only", () => ({}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		codebase: {
			getCodebaseResumeDestination: "getCodebaseResumeDestination",
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

vi.mock("@/platform/access/product-access", () => ({
	getServerProductAccess: getServerProductAccessMock,
}));

vi.mock(
	"@/app/(workspace)/_components/access-required/access-required-page",
	() => ({
		AccessRequiredPage: () => <div>Access recovery</div>,
	}),
);

describe("workspace execute route", () => {
	beforeEach(() => {
		fetchAuthenticatedQueryMock.mockReset();
		getServerProductAccessMock.mockReset();
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: true,
			status: "granted",
		});
		redirectMock.mockClear();
		vi.resetModules();
	});

	it("renders access recovery without protected queries when access is missing", async () => {
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: false,
			status: "no_access",
		});

		const { default: ExecuteRoutePage } =
			await import("@/app/(workspace)/execute/page");

		const markup = renderToStaticMarkup(await ExecuteRoutePage());

		expect(markup).toContain("Access recovery");
		expect(fetchAuthenticatedQueryMock).not.toHaveBeenCalled();
		expect(redirectMock).not.toHaveBeenCalled();
	});

	it("redirects locked visitors back to review", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getCodebaseResumeDestination") {
				return {
					destination: "/review",
					kind: "review",
					codebaseStageId: "review",
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
			if (query === "getCodebaseResumeDestination") {
				return {
					destination: getLessonHref("iterate-the-product-with-ai"),
					kind: "post_review",
					codebaseStageId: null,
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
