import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchAuthenticatedQueryMock = vi.fn();
const getServerProductAccessMock = vi.fn();
const redirectMock = vi.fn((href: string) => {
	throw new Error(`NEXT_REDIRECT:${href}`);
});

vi.mock("server-only", () => ({}));

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

vi.mock("@/app/(app)/_components/app-shell", () => ({
	AppShell: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

vi.mock("@/platform/convex/server-preload", () => ({
	fetchAuthenticatedQuery: fetchAuthenticatedQueryMock,
}));

vi.mock("@/platform/access/product-access", () => ({
	getServerProductAccess: getServerProductAccessMock,
}));

vi.mock("@/app/(app)/_components/access-required/access-required-page", () => ({
	AccessRequiredPage: () => <div>Access recovery</div>,
}));

vi.mock("next/navigation", () => ({
	redirect: (href: string) => redirectMock(href),
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		codebase: {
			getCodebaseResumeDestination: "getCodebaseResumeDestination",
		},
	},
}));

describe("workspace mission route", () => {
	beforeEach(() => {
		fetchAuthenticatedQueryMock.mockReset();
		getServerProductAccessMock.mockReset();
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: true,
			status: "granted",
		});
		redirectMock.mockReset();
		vi.resetModules();
	});

	it("renders access recovery without protected queries when access is missing", async () => {
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: false,
			status: "no_access",
		});

		const { default: MissionRoutePage } =
			await import("@/app/(app)/mission/page");

		const markup = renderToStaticMarkup(await MissionRoutePage());

		expect(markup).toContain("Access recovery");
		expect(fetchAuthenticatedQueryMock).not.toHaveBeenCalled();
		expect(redirectMock).not.toHaveBeenCalled();
	});

	it("renders explicit unlock messaging before the bonus is available", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getCodebaseResumeDestination") {
				return {
					destination: "/starter/generate-codebase/review",
					kind: "review",
					codebaseStageId: "review",
					postReviewTargets: null,
				};
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: MissionRoutePage } =
			await import("@/app/(app)/mission/page");

		const markup = renderToStaticMarkup(await MissionRoutePage());

		expect(markup).toContain("Lesson Map opens after Review.");
		expect(markup).toContain('href="/starter/generate-codebase/review"');
	});

	it("keeps the restored route reachable after unlock without redirecting to start", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getCodebaseResumeDestination") {
				return {
					destination: "/lesson/iterate-the-product-with-ai",
					kind: "post_review",
					codebaseStageId: null,
					postReviewTargets: {
						reviewDestination: "/starter/generate-codebase/review",
						buildLessonsDestination: "/lesson/iterate-the-product-with-ai",
						launchLessonsDestination: "/lesson/product-review",
						lessonMapDestination:
							"/starter/generate-codebase/review?showLessonMap=1",
						latestLessonDestination: "/lesson/iterate-the-product-with-ai",
					},
				};
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: MissionRoutePage } =
			await import("@/app/(app)/mission/page");

		await expect(MissionRoutePage()).rejects.toThrowError(
			"NEXT_REDIRECT:/starter/generate-codebase/review?showLessonMap=1",
		);
		expect(redirectMock).toHaveBeenCalledWith(
			"/starter/generate-codebase/review?showLessonMap=1",
		);
	});
});
