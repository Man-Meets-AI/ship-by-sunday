import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchAuthenticatedQueryMock = vi.fn();
const getServerProductAccessMock = vi.fn();

vi.mock("server-only", () => ({}));

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

vi.mock("@/app/(workspace)/_components/blueprint-flow/blueprint-page", () => ({
	BlueprintPage: () => <div>Blueprint workspace</div>,
}));

vi.mock("@/app/(workspace)/review/_components/blueprint-review-page", () => ({
	BlueprintReviewPage: () => <div>Review workspace</div>,
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		blueprint: {
			getBlueprintWorkspaceState: "getBlueprintWorkspaceState",
			getBlueprintResumeDestination: "getBlueprintResumeDestination",
		},
		course: {
			getBonusMissionState: "getBonusMissionState",
		},
	},
}));

describe("workspace blueprint and review routes", () => {
	beforeEach(() => {
		fetchAuthenticatedQueryMock.mockReset();
		getServerProductAccessMock.mockReset();
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: true,
			status: "granted",
		});
		vi.resetModules();
	});

	it("renders blueprint access recovery without protected queries when access is missing", async () => {
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: false,
			status: "no_access",
		});

		const { default: BlueprintRoutePage } =
			await import("@/app/(workspace)/blueprint/page");

		const markup = renderToStaticMarkup(await BlueprintRoutePage());

		expect(markup).toContain("Access recovery");
		expect(fetchAuthenticatedQueryMock).not.toHaveBeenCalled();
	});

	it("renders review access recovery without protected queries when access is missing", async () => {
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: false,
			status: "no_access",
		});

		const { default: ReviewRoutePage } =
			await import("@/app/(workspace)/review/page");

		const markup = renderToStaticMarkup(
			await ReviewRoutePage({
				searchParams: Promise.resolve({}),
			}),
		);

		expect(markup).toContain("Access recovery");
		expect(fetchAuthenticatedQueryMock).not.toHaveBeenCalled();
	});

	it("loads the blueprint workspace after access is granted", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getBlueprintWorkspaceState") {
				return {
					workflowState: null,
				};
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: BlueprintRoutePage } =
			await import("@/app/(workspace)/blueprint/page");

		const markup = renderToStaticMarkup(await BlueprintRoutePage());

		expect(markup).toContain("Blueprint workspace");
		expect(fetchAuthenticatedQueryMock).toHaveBeenCalledTimes(1);
		expect(fetchAuthenticatedQueryMock).toHaveBeenCalledWith(
			"getBlueprintWorkspaceState",
			{},
		);
	});

	it("loads the review workspace after access is granted", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getBlueprintWorkspaceState") {
				return {
					workflowState: null,
				};
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: ReviewRoutePage } =
			await import("@/app/(workspace)/review/page");

		const markup = renderToStaticMarkup(
			await ReviewRoutePage({
				searchParams: Promise.resolve({ download: "1" }),
			}),
		);

		expect(markup).toContain("Review workspace");
		expect(fetchAuthenticatedQueryMock).toHaveBeenCalledTimes(1);
		expect(fetchAuthenticatedQueryMock).toHaveBeenCalledWith(
			"getBlueprintWorkspaceState",
			{},
		);
	});
});
