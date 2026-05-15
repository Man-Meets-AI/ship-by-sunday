import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchAuthenticatedQueryMock = vi.fn();
const fetchAuthenticatedMutationMock = vi.fn();
const getServerProductAccessMock = vi.fn();
const loadWorkspacePageAccessMock = vi.fn();
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

vi.mock("@/app/(app)/_server/load-workspace-page-access", () => ({
	loadWorkspacePageAccess: loadWorkspacePageAccessMock,
}));

vi.mock("next/navigation", () => ({
	redirect: redirectMock,
}));

vi.mock("@/app/(app)/_components/access-required/access-required-page", () => ({
	AccessRequiredPage: () => <div>Access recovery</div>,
}));

vi.mock("@/app/(app)/_components/codebase-flow/codebase-page", () => ({
	CodebasePage: () => <div>Codebase workspace</div>,
}));

vi.mock(
	"@/app/(app)/generate-codebase/review/_components/codebase-review-page",
	() => ({
		CodebaseReviewPage: () => <div>Review workspace</div>,
	}),
);

vi.mock(
	"@/app/(app)/_components/existing-codebase-setup/existing-codebase-setup-page",
	() => ({
		ExistingCodebaseSetupPage: () => <div>Existing codebase setup</div>,
	}),
);

vi.mock("@/app/(app)/_components/app-shell", () => ({
	AppShell: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="app-shell">{children}</div>
	),
}));

vi.mock("@/app/(app)/_components/paid-app-home/paid-app-home-page", () => ({
	PaidAppHomePage: () => <div>Paid app home</div>,
}));

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
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
		loadWorkspacePageAccessMock.mockReset();
		currentUserMock.mockReset();
		redirectMock.mockReset();
		redirectMock.mockImplementation((destination: string) => {
			throw new Error(`redirect:${destination}`);
		});
		loadWorkspacePageAccessMock.mockResolvedValue({
			kind: "granted",
			access: {
				clerkUserId: "user_123",
				hasAccess: true,
				status: "granted",
				capabilities: ["generate_codebase", "tutorials", "worker"],
				fulfillmentTrack: "generated_codebase",
			},
		});
		vi.resetModules();
	});

	it("renders codebase access recovery without protected queries when access is missing", async () => {
		loadWorkspacePageAccessMock.mockResolvedValue({
			kind: "access_required",
			access: {
				clerkUserId: "user_123",
				hasAccess: false,
				status: "no_access",
			},
		});

		const { default: CodebaseRoutePage } =
			await import("@/app/(app)/starter/generate-codebase/page");

		const markup = renderToStaticMarkup(await CodebaseRoutePage());

		expect(markup).toContain("Access recovery");
		expect(fetchAuthenticatedQueryMock).not.toHaveBeenCalled();
	});

	it("renders review access recovery without protected queries when access is missing", async () => {
		loadWorkspacePageAccessMock.mockResolvedValue({
			kind: "access_required",
			access: {
				clerkUserId: "user_123",
				hasAccess: false,
				status: "no_access",
			},
		});

		const { default: ReviewRoutePage } =
			await import("@/app/(app)/starter/generate-codebase/review/page");

		const markup = renderToStaticMarkup(
			await ReviewRoutePage({
				searchParams: Promise.resolve({}),
			}),
		);

		expect(markup).toContain("Access recovery");
		expect(fetchAuthenticatedQueryMock).not.toHaveBeenCalled();
	});

	it("renders setup access recovery without preparing pairing state when access is missing", async () => {
		loadWorkspacePageAccessMock.mockResolvedValue({
			kind: "access_required",
			access: {
				clerkUserId: "user_123",
				hasAccess: false,
				status: "no_access",
			},
		});

		const { default: SetupRoutePage } =
			await import("@/app/(app)/workers/setup/page");

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
			await import("@/app/(app)/starter/generate-codebase/page");

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
					codebaseReadiness: {
						review: {
							isReady: true,
						},
					},
					workflowState: null,
				};
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: ReviewRoutePage } =
			await import("@/app/(app)/starter/generate-codebase/review/page");

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
		loadWorkspacePageAccessMock.mockResolvedValue({
			kind: "granted",
			access: {
				clerkUserId: "user_123",
				hasAccess: true,
				status: "granted",
				capabilities: ["generate_codebase", "tutorials", "worker"],
				fulfillmentTrack: "existing_codebase_doctor",
			},
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
			await import("@/app/(app)/workers/setup/page");

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
		loadWorkspacePageAccessMock.mockResolvedValue({
			kind: "granted",
			access: {
				clerkUserId: "user_123",
				hasAccess: true,
				status: "granted",
				capabilities: ["generate_codebase", "tutorials", "worker"],
				fulfillmentTrack: "unspecified",
			},
		});

		const { default: HomeRoutePage } = await import("@/app/(app)/home/page");

		const markup = renderToStaticMarkup(
			await HomeRoutePage({
				searchParams: Promise.resolve({}),
			}),
		);

		expect(markup).toContain("Paid app home");
	});

	it("renders paid app home access recovery without paid access", async () => {
		loadWorkspacePageAccessMock.mockResolvedValue({
			kind: "access_required",
			access: {
				clerkUserId: "user_123",
				hasAccess: false,
				status: "no_access",
				capabilities: [],
			},
		});

		const { default: HomeRoutePage } = await import("@/app/(app)/home/page");

		const markup = renderToStaticMarkup(
			await HomeRoutePage({
				searchParams: Promise.resolve({}),
			}),
		);

		expect(markup).toContain("Access recovery");
	});

	it("renders the direct Starter template download action on Starter Home", async () => {
		loadWorkspacePageAccessMock.mockResolvedValue({
			kind: "granted",
			access: {
				clerkUserId: "user_123",
				hasAccess: true,
				status: "granted",
				capabilities: ["generate_codebase", "tutorials"],
				fulfillmentTrack: "generated_codebase",
			},
		});

		const { default: StarterHomeRoutePage } =
			await import("@/app/(app)/starter/home/page");

		const markup = renderToStaticMarkup(await StarterHomeRoutePage());

		expect(markup).toContain('data-slot="protected-route-page"');
		expect(markup).toContain('data-slot="protected-route-header"');
		expect(markup).toContain('data-slot="protected-route-panel"');
		expect(markup).toContain("Choose your build path");
		expect(markup).toContain("Download template");
		expect(markup).toContain(
			'href="/api/download/starter-template?downloadToken=',
		);
		expect(markup).toContain('download=""');
		expect(markup).toContain('href="/starter/lessons"');
		expect(markup).not.toContain("font-heading-serif");
	});

	it("redirects viewers without worker capability away from worker setup", async () => {
		loadWorkspacePageAccessMock.mockResolvedValue({
			kind: "granted",
			access: {
				clerkUserId: "user_123",
				hasAccess: true,
				status: "granted",
				capabilities: ["generate_codebase", "tutorials"],
				fulfillmentTrack: "generated_codebase",
			},
		});

		const { default: SetupRoutePage } =
			await import("@/app/(app)/workers/setup/page");

		await expect(SetupRoutePage()).rejects.toThrow("redirect:/home");
		expect(fetchAuthenticatedMutationMock).not.toHaveBeenCalled();
		expect(redirectMock).toHaveBeenCalledWith("/home");
	});

	it("redirects viewers without generate-codebase capability away from generate-codebase", async () => {
		loadWorkspacePageAccessMock.mockResolvedValue({
			kind: "granted",
			access: {
				clerkUserId: "user_123",
				hasAccess: true,
				status: "granted",
				capabilities: ["tutorials", "worker"],
				fulfillmentTrack: "existing_codebase_doctor",
			},
		});

		const { default: CodebaseRoutePage } =
			await import("@/app/(app)/starter/generate-codebase/page");

		await expect(CodebaseRoutePage()).rejects.toThrow("redirect:/home");
		expect(fetchAuthenticatedQueryMock).not.toHaveBeenCalled();
		expect(redirectMock).toHaveBeenCalledWith("/home");
	});

	it("redirects legacy codebase routes to Starter codebase routes", async () => {
		const { default: LegacyCodebasePage } =
			await import("@/app/(app)/generate-codebase/page");
		const { default: LegacyReviewPage } =
			await import("@/app/(app)/generate-codebase/review/page");

		expect(() => LegacyCodebasePage()).toThrow(
			"redirect:/starter/generate-codebase",
		);
		expect(() => LegacyReviewPage()).toThrow(
			"redirect:/starter/generate-codebase/review",
		);
	});
});
