import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchAuthenticatedQueryMock = vi.fn();
const fetchAuthenticatedMutationMock = vi.fn();
const getServerProductAccessMock = vi.fn();
const currentUserMock = vi.fn();
const redirectMock = vi.fn();

vi.mock("server-only", () => ({}));

vi.mock("@clerk/nextjs/server", () => ({
	currentUser: currentUserMock,
}));

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

vi.mock(
	"@/app/(workspace)/generate-codebase/review/_components/codebase-review-page",
	() => ({
		CodebaseReviewPage: () => <div>Review workspace</div>,
	}),
);

vi.mock(
	"@/app/(workspace)/_components/existing-codebase-setup/existing-codebase-setup-page",
	() => ({
		ExistingCodebaseSetupPage: () => <div>Existing codebase setup</div>,
	}),
);

vi.mock(
	"@/app/(workspace)/_components/paid-app-home/paid-app-home-page",
	() => ({
		PaidAppHomePage: () => <div>Paid app home</div>,
	}),
);

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
		currentUserMock.mockReset();
		redirectMock.mockReset();
		redirectMock.mockImplementation((destination: string) => {
			throw new Error(`redirect:${destination}`);
		});
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: true,
			status: "granted",
			capabilities: ["generate_codebase", "tutorials", "worker"],
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
			await import("@/app/(workspace)/generate-codebase/page");

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
			await import("@/app/(workspace)/generate-codebase/review/page");

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
			await import("@/app/(workspace)/workers/setup/page");

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
			await import("@/app/(workspace)/generate-codebase/page");

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
			await import("@/app/(workspace)/generate-codebase/review/page");

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
			capabilities: ["generate_codebase", "tutorials", "worker"],
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
			await import("@/app/(workspace)/workers/setup/page");

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

	it("renders paid app home for granted access", async () => {
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: true,
			status: "granted",
			capabilities: ["generate_codebase", "tutorials", "worker"],
			fulfillmentTrack: "unspecified",
		});

		const { default: HomeRoutePage } =
			await import("@/app/(workspace)/home/page");

		const markup = renderToStaticMarkup(
			await HomeRoutePage({
				searchParams: Promise.resolve({}),
			}),
		);

		expect(markup).toContain("Paid app home");
	});

	it("renders paid app home access recovery without paid access", async () => {
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: false,
			status: "no_access",
			capabilities: [],
		});

		const { default: HomeRoutePage } =
			await import("@/app/(workspace)/home/page");

		const markup = renderToStaticMarkup(
			await HomeRoutePage({
				searchParams: Promise.resolve({}),
			}),
		);

		expect(markup).toContain("Access recovery");
	});

	it("redirects viewers without worker capability away from worker setup", async () => {
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: true,
			status: "granted",
			capabilities: ["generate_codebase", "tutorials"],
			fulfillmentTrack: "generated_codebase",
		});

		const { default: SetupRoutePage } =
			await import("@/app/(workspace)/workers/setup/page");

		await expect(SetupRoutePage()).rejects.toThrow("redirect:/home");
		expect(fetchAuthenticatedMutationMock).not.toHaveBeenCalled();
		expect(redirectMock).toHaveBeenCalledWith("/home");
	});

	it("redirects viewers without generate-codebase capability away from generate-codebase", async () => {
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: true,
			status: "granted",
			capabilities: ["tutorials", "worker"],
			fulfillmentTrack: "existing_codebase_doctor",
		});

		const { default: CodebaseRoutePage } =
			await import("@/app/(workspace)/generate-codebase/page");

		await expect(CodebaseRoutePage()).rejects.toThrow("redirect:/home");
		expect(fetchAuthenticatedQueryMock).not.toHaveBeenCalled();
		expect(redirectMock).toHaveBeenCalledWith("/home");
	});
});
