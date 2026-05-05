import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchAuthenticatedQueryMock = vi.fn();
const fetchAuthenticatedMutationMock = vi.fn();
const getServerProductAccessMock = vi.fn();
const redirectMock = vi.fn();

vi.mock("server-only", () => ({}));

vi.mock("@/platform/convex/server-preload", () => ({
	fetchAuthenticatedMutation: fetchAuthenticatedMutationMock,
	fetchAuthenticatedQuery: fetchAuthenticatedQueryMock,
}));

vi.mock("@/platform/access/product-access", () => ({
	getServerProductAccess: getServerProductAccessMock,
}));

vi.mock("next/navigation", () => ({
	redirect: redirectMock,
}));

vi.mock(
	"@/app/(workspace)/_components/access-required/access-required-page",
	() => ({
		AccessRequiredPage: () => <div>Access recovery</div>,
	}),
);

vi.mock("@/app/(workspace)/_components/codebase-flow/codebase-page", () => ({
	CodebasePage: () => <div>Codebase workspace</div>,
}));

vi.mock("@/app/(workspace)/review/_components/codebase-review-page", () => ({
	CodebaseReviewPage: () => <div>Review workspace</div>,
}));

vi.mock(
	"@/app/(workspace)/_components/existing-codebase-setup/existing-codebase-setup-page",
	() => ({
		ExistingCodebaseSetupPage: () => <div>Existing codebase setup</div>,
	}),
);

vi.mock("@/app/(workspace)/_components/workspace-fulfillment-choice", () => ({
	WorkspaceFulfillmentChoice: () => <div>Workspace fulfillment choice</div>,
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		codebase: {
			getCodebaseWorkspaceState: "getCodebaseWorkspaceState",
			getCodebaseResumeDestination: "getCodebaseResumeDestination",
		},
		course: {
			getBonusMissionState: "getBonusMissionState",
		},
		workspace: {
			prepareWorkspaceSetupPairing: "prepareWorkspaceSetupPairing",
		},
	},
}));

describe("workspace codebase, review, and setup routes", () => {
	beforeEach(() => {
		fetchAuthenticatedMutationMock.mockReset();
		fetchAuthenticatedQueryMock.mockReset();
		getServerProductAccessMock.mockReset();
		redirectMock.mockReset();
		redirectMock.mockImplementation((destination: string) => {
			throw new Error(`redirect:${destination}`);
		});
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: true,
			status: "granted",
			fulfillmentTrack: "generated_codebase",
		});
		vi.resetModules();
	});

	it("renders codebase access recovery without protected queries when access is missing", async () => {
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: false,
			status: "no_access",
		});

		const { default: CodebaseRoutePage } =
			await import("@/app/(workspace)/codebase/page");

		const markup = renderToStaticMarkup(await CodebaseRoutePage());

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

	it("renders setup access recovery without preparing pairing state when access is missing", async () => {
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: false,
			status: "no_access",
		});

		const { default: SetupRoutePage } =
			await import("@/app/(workspace)/workspace/setup/page");

		const markup = renderToStaticMarkup(await SetupRoutePage());

		expect(markup).toContain("Access recovery");
		expect(fetchAuthenticatedMutationMock).not.toHaveBeenCalled();
	});

	it("loads the codebase workspace after access is granted", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getCodebaseWorkspaceState") {
				return {
					workflowState: null,
				};
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: CodebaseRoutePage } =
			await import("@/app/(workspace)/codebase/page");

		const markup = renderToStaticMarkup(await CodebaseRoutePage());

		expect(markup).toContain("Codebase workspace");
		expect(fetchAuthenticatedQueryMock).toHaveBeenCalledTimes(1);
		expect(fetchAuthenticatedQueryMock).toHaveBeenCalledWith(
			"getCodebaseWorkspaceState",
			{},
		);
	});

	it("loads the review workspace after access is granted", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getCodebaseWorkspaceState") {
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
			"getCodebaseWorkspaceState",
			{},
		);
	});

	it("prepares pairing state for setup after access is granted", async () => {
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: true,
			status: "granted",
			fulfillmentTrack: "existing_codebase_doctor",
		});
		fetchAuthenticatedMutationMock.mockResolvedValue({
			project: null,
			runnerBindings: [],
			activeRunner: null,
			repositoryBinding: null,
			latestDoctorPassRun: null,
			setupEvents: [],
			pairingCommand: null,
		});

		const { default: SetupRoutePage } =
			await import("@/app/(workspace)/workspace/setup/page");

		const markup = renderToStaticMarkup(await SetupRoutePage());

		expect(markup).toContain("Existing codebase setup");
		expect(fetchAuthenticatedMutationMock).toHaveBeenCalledTimes(1);
		expect(fetchAuthenticatedMutationMock).toHaveBeenCalledWith(
			"prepareWorkspaceSetupPairing",
			{
				runnerMode: "daemon",
			},
		);
	});

	it("renders workspace choice only for unresolved paid access", async () => {
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: true,
			status: "granted",
			fulfillmentTrack: "unspecified",
		});

		const { default: ChoiceRoutePage } =
			await import("@/app/(workspace)/workspace/choose/page");

		const markup = renderToStaticMarkup(await ChoiceRoutePage());

		expect(markup).toContain("Workspace fulfillment choice");
	});

	it("renders workspace choice access recovery without paid access", async () => {
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: false,
			status: "no_access",
		});

		const { default: ChoiceRoutePage } =
			await import("@/app/(workspace)/workspace/choose/page");

		const markup = renderToStaticMarkup(await ChoiceRoutePage());

		expect(markup).toContain("Access recovery");
	});

	it("redirects generated-codebase viewers away from workspace choice", async () => {
		const { default: ChoiceRoutePage } =
			await import("@/app/(workspace)/workspace/choose/page");

		await expect(ChoiceRoutePage()).rejects.toThrow("redirect:/codebase");
		expect(redirectMock).toHaveBeenCalledWith("/codebase");
	});

	it("redirects existing-codebase viewers away from workspace choice", async () => {
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: true,
			status: "granted",
			fulfillmentTrack: "existing_codebase_doctor",
		});

		const { default: ChoiceRoutePage } =
			await import("@/app/(workspace)/workspace/choose/page");

		await expect(ChoiceRoutePage()).rejects.toThrow(
			"redirect:/workspace/setup",
		);
		expect(redirectMock).toHaveBeenCalledWith("/workspace/setup");
	});

	it("redirects generated-codebase viewers away from existing-codebase setup", async () => {
		const { default: SetupRoutePage } =
			await import("@/app/(workspace)/workspace/setup/page");

		await expect(SetupRoutePage()).rejects.toThrow("redirect:/codebase");
		expect(fetchAuthenticatedMutationMock).not.toHaveBeenCalled();
		expect(redirectMock).toHaveBeenCalledWith("/codebase");
	});

	it("redirects existing-codebase viewers away from generated-codebase codebase", async () => {
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: true,
			status: "granted",
			fulfillmentTrack: "existing_codebase_doctor",
		});

		const { default: CodebaseRoutePage } =
			await import("@/app/(workspace)/codebase/page");

		await expect(CodebaseRoutePage()).rejects.toThrow(
			"redirect:/workspace/setup",
		);
		expect(fetchAuthenticatedQueryMock).not.toHaveBeenCalled();
		expect(redirectMock).toHaveBeenCalledWith("/workspace/setup");
	});

	it("redirects unresolved viewers away from generated-codebase review", async () => {
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: true,
			status: "granted",
			fulfillmentTrack: "unspecified",
		});

		const { default: ReviewRoutePage } =
			await import("@/app/(workspace)/review/page");

		await expect(
			ReviewRoutePage({
				searchParams: Promise.resolve({}),
			}),
		).rejects.toThrow("redirect:/workspace/choose");
		expect(fetchAuthenticatedQueryMock).not.toHaveBeenCalled();
		expect(redirectMock).toHaveBeenCalledWith("/workspace/choose");
	});
});
