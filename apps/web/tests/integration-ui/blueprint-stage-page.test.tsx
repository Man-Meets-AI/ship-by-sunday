import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
} from "@blueprint-compiler";
import type { BlueprintWorkspaceState } from "@/features/blueprint-flow/lib/blueprint-workspace-types";

const saveProjectDefinitionFactsMock = vi.fn();
type MockBlueprintMutation = ((args: unknown) => Promise<unknown>) & {
	withOptimisticUpdate: ReturnType<typeof vi.fn>;
};

function createMutationMock(): MockBlueprintMutation {
	const mutation = (async (args: unknown) =>
		saveProjectDefinitionFactsMock(args)) as MockBlueprintMutation;
	mutation.withOptimisticUpdate = vi.fn(() => mutation);
	return mutation;
}

const useMutationMock = vi.fn(() => createMutationMock());
const useQueryMock = vi.fn(
	(): BlueprintWorkspaceState | undefined => undefined,
);
const redirectMock = vi.fn((href: string) => {
	throw new Error(`NEXT_REDIRECT:${href}`);
});
const pushMock = vi.fn();
const replaceMock = vi.fn();

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

vi.mock("next/navigation", () => ({
	redirect: (href: string) => redirectMock(href),
	useRouter: () => ({
		push: pushMock,
		replace: replaceMock,
	}),
}));

vi.mock("convex/react", () => ({
	useConvexAuth: () => ({
		isAuthenticated: false,
		isLoading: false,
	}),
	useMutation: () => useMutationMock(),
	useQuery: () => useQueryMock(),
}));

vi.mock("@clerk/nextjs", () => ({
	useUser: () => ({
		isLoaded: true,
		user: null,
	}),
}));

vi.mock("@/features/course/shared/components/app-shell", async () => {
	const { BlueprintStageNav } =
		await import("@/features/blueprint-flow/components/blueprint-stage-nav");
	const { WorkspacePrimaryNav } =
		await import("@/features/workspace-navigation/components/workspace-primary-nav");

	return {
		AppShell: ({
			title,
			subtitle,
			children,
			primaryNav,
			localNav,
		}: {
			title: string;
			subtitle?: string;
			children: React.ReactNode;
			primaryNav?: {
				kind: "combined";
				currentBlueprintStageId?:
					| "start"
					| "product"
					| "design"
					| "marketing"
					| "build-plan"
					| "review";
				stageStatuses: BlueprintWorkspaceState["stageStatuses"];
				postReviewItems: Parameters<typeof WorkspacePrimaryNav>[0]["items"];
				onLinkNavigate?: (
					event: { preventDefault: () => void },
					href: string,
				) => void;
				onNavigate?: (href: string) => void;
			};
			localNav?: {
				kind: "blueprint" | "review" | "workspace";
				compact?: React.ReactNode;
				desktop?: React.ReactNode;
			};
		}) => (
			<div>
				<h1>{title}</h1>
				{subtitle ? <p>{subtitle}</p> : null}
				{primaryNav ? (
					<div>
						<BlueprintStageNav
							currentStageId={primaryNav.currentBlueprintStageId}
							stageStatuses={primaryNav.stageStatuses}
							onLinkNavigate={primaryNav.onLinkNavigate}
							onNavigate={primaryNav.onNavigate}
						/>
						<WorkspacePrimaryNav items={primaryNav.postReviewItems} />
					</div>
				) : null}
				<div data-testid="blueprint-local-nav-compact">{localNav?.compact}</div>
				<div data-testid="blueprint-local-nav-desktop" hidden>
					{localNav?.desktop}
				</div>
				{children}
			</div>
		),
	};
});

vi.mock("@/features/course/lesson/components/lesson-video-player", () => ({
	LessonVideoPlayer: ({ title }: { title?: string }) => (
		<div data-testid="blueprint-stage-video-player">
			{title ?? "Lesson video"}
		</div>
	),
}));

import { BlueprintStagePage } from "@/features/blueprint-flow/components/blueprint-stage-page";

function createWorkspaceState(
	factOverrides: Record<string, unknown> = {},
): BlueprintWorkspaceState {
	const baseFacts = createCompleteProjectDefinition().facts;
	const facts = Object.fromEntries(
		Object.entries({
			...baseFacts,
			...factOverrides,
		}).filter(([, value]) => value !== undefined),
	);
	const projectDefinition = createCanonicalProjectDefinitionDraft({
		clerkUserId: "user_123",
		productKey: "ship-by-sunday",
		facts,
	});
	const stageStatus = deriveStageStatus(projectDefinition.facts);

	return {
		projectDefinition,
		firstIncompleteStageId: stageStatus.firstIncompleteStageId,
		blueprintReadiness: stageStatus.blueprintReadiness,
		stageStatuses: stageStatus.stageStatuses,
	} as BlueprintWorkspaceState;
}

describe("BlueprintStagePage", () => {
	beforeEach(() => {
		saveProjectDefinitionFactsMock.mockReset();
		useMutationMock.mockClear();
		useQueryMock.mockReset();
		useQueryMock.mockReturnValue(undefined);
		redirectMock.mockClear();
		pushMock.mockReset();
		replaceMock.mockReset();
	});

	it("does not loop when live workspace state arrives with new object identities", async () => {
		const workspaceState = createWorkspaceState({
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
		});
		useQueryMock.mockImplementation(() => structuredClone(workspaceState));
		const consoleErrorSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);

		try {
			render(
				<BlueprintStagePage
					stageId="product"
					stepId="foundation"
					initialWorkspaceState={workspaceState}
				/>,
			);

			await screen.findByRole("heading", { name: "Foundation" });
			await new Promise((resolve) => window.setTimeout(resolve, 50));

			expect(
				consoleErrorSpy.mock.calls.some((call) =>
					call.some(
						(entry) =>
							typeof entry === "string" &&
							entry.includes("Maximum update depth exceeded"),
					),
				),
			).toBe(false);
		} finally {
			consoleErrorSpy.mockRestore();
		}
	});

	it("uses live Convex blueprint facts as the pristine field baseline", async () => {
		const initialWorkspaceState = createWorkspaceState({
			product_name: "Initial blueprint name",
		});
		let liveWorkspaceState: BlueprintWorkspaceState | undefined = undefined;
		useQueryMock.mockImplementation(() => liveWorkspaceState);
		const { rerender } = render(
			<BlueprintStagePage
				stageId="product"
				stepId="foundation"
				initialWorkspaceState={initialWorkspaceState}
			/>,
		);

		expect(
			(screen.getByLabelText("What's the name?") as HTMLInputElement).value,
		).toBe("Initial blueprint name");

		liveWorkspaceState = createWorkspaceState({
			product_name: "Live Convex blueprint name",
		});
		rerender(
			<BlueprintStagePage
				stageId="product"
				stepId="foundation"
				initialWorkspaceState={initialWorkspaceState}
			/>,
		);

		await waitFor(() =>
			expect(
				(screen.getByLabelText("What's the name?") as HTMLInputElement).value,
			).toBe("Live Convex blueprint name"),
		);
	});

	it("preserves the dirty local draft across live Convex updates until the draft is clean again", async () => {
		const user = userEvent.setup();
		const initialWorkspaceState = createWorkspaceState({
			product_name: "Initial blueprint name",
		});
		let liveWorkspaceState: BlueprintWorkspaceState | undefined = undefined;
		useQueryMock.mockImplementation(() => liveWorkspaceState);
		const { rerender } = render(
			<BlueprintStagePage
				stageId="product"
				stepId="foundation"
				initialWorkspaceState={initialWorkspaceState}
			/>,
		);

		const productNameField = screen.getByLabelText("What's the name?");
		await user.clear(productNameField);
		await user.type(productNameField, "Local dirty blueprint name");

		liveWorkspaceState = createWorkspaceState({
			product_name: "Live Convex blueprint name",
		});
		rerender(
			<BlueprintStagePage
				stageId="product"
				stepId="foundation"
				initialWorkspaceState={initialWorkspaceState}
			/>,
		);

		expect((productNameField as HTMLInputElement).value).toBe(
			"Local dirty blueprint name",
		);

		await user.type(
			screen.getByLabelText("What's the one-liner?"),
			"A blueprint-first builder for Sunday launches.",
		);
		await user.type(
			screen.getByLabelText("Who wants this? Who benefits from this?"),
			"Indie founders shipping a paid product.",
		);
		await user.click(screen.getByRole("button", { name: /^Continue/ }));

		await waitFor(() =>
			expect(saveProjectDefinitionFactsMock).toHaveBeenCalledWith(
				expect.objectContaining({
					stageId: "product",
					factsPatch: expect.objectContaining({
						product_name: "Local dirty blueprint name",
					}),
				}),
			),
		);

		liveWorkspaceState = createWorkspaceState({
			product_name: "Fresh live blueprint name",
		});
		rerender(
			<BlueprintStagePage
				stageId="product"
				stepId="foundation"
				initialWorkspaceState={initialWorkspaceState}
			/>,
		);

		await waitFor(() =>
			expect(
				(screen.getByLabelText("What's the name?") as HTMLInputElement).value,
			).toBe("Fresh live blueprint name"),
		);
	});

	it("places the blueprint rail into the shell localNav slot and keeps the compact selector available", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState();

		render(
			<BlueprintStagePage
				stageId="product"
				stepId="foundation"
				initialWorkspaceState={workspaceState}
			/>,
		);

		expect(screen.getByTestId("blueprint-local-nav-compact")).toBeTruthy();
		expect(screen.getByTestId("blueprint-local-nav-desktop")).toBeTruthy();
		expect(screen.getByLabelText("Page")).toBeTruthy();
		expect(screen.queryByText("QUEST")).toBeNull();
		await user.selectOptions(screen.getByLabelText("Page"), "problem");

		expect(pushMock).toHaveBeenCalledWith("/product/problem");
	});

	it("opens a leave warning for dirty blueprint links and keeps the draft on Stay", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState({
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
		});

		render(
			<BlueprintStagePage
				stageId="product"
				stepId="foundation"
				initialWorkspaceState={workspaceState}
			/>,
		);

		const productNameField = screen.getByLabelText("What's the name?");
		await user.type(productNameField, "Ship by Sunday");
		await user.click(screen.getByRole("link", { name: "Start" }));

		expect(pushMock).not.toHaveBeenCalled();
		expect(replaceMock).not.toHaveBeenCalled();
		expect(screen.getByText("Leave this blueprint page?")).toBeTruthy();
		await user.click(screen.getByRole("button", { name: "Stay" }));

		expect(screen.queryByText("Leave this blueprint page?")).toBeNull();
		expect((productNameField as HTMLInputElement).value).toBe("Ship by Sunday");
	});

	it("opens a leave warning for dirty blueprint pager links and keeps the draft on Stay", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState({
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
		});

		render(
			<BlueprintStagePage
				stageId="product"
				stepId="foundation"
				initialWorkspaceState={workspaceState}
			/>,
		);

		const productNameField = screen.getByLabelText("What's the name?");
		await user.type(productNameField, "Ship by Sunday");
		await user.click(screen.getByRole("link", { name: "Next blueprint page" }));

		expect(pushMock).not.toHaveBeenCalled();
		expect(replaceMock).not.toHaveBeenCalled();
		expect(screen.getByText("Leave this blueprint page?")).toBeTruthy();
		await user.click(screen.getByRole("button", { name: "Stay" }));

		expect(screen.queryByText("Leave this blueprint page?")).toBeNull();
		expect((productNameField as HTMLInputElement).value).toBe("Ship by Sunday");
	});

	it("only leaves a dirty blueprint page after Leave without saving is confirmed", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState({
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
		});

		render(
			<BlueprintStagePage
				stageId="product"
				stepId="foundation"
				initialWorkspaceState={workspaceState}
			/>,
		);

		await user.type(
			screen.getByLabelText("What's the name?"),
			"Ship by Sunday",
		);
		await user.click(screen.getByRole("link", { name: "Next blueprint page" }));

		expect(pushMock).not.toHaveBeenCalled();
		expect(screen.getByText("Leave this blueprint page?")).toBeTruthy();
		await user.click(
			screen.getByRole("button", { name: "Leave without saving" }),
		);

		expect(replaceMock).toHaveBeenCalledWith("/product/problem");
	});

	it("blocks blank saves, saves partial drafts in place, and clears field errors as users fix them", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState({
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
		});

		render(
			<BlueprintStagePage
				stageId="product"
				stepId="foundation"
				initialWorkspaceState={workspaceState}
			/>,
		);

		const productNameField = screen.getByLabelText("What's the name?");
		const productSummaryField = screen.getByLabelText("What's the one-liner?");
		const primaryUserField = screen.getByLabelText(
			"Who wants this? Who benefits from this?",
		);
		await user.type(productNameField, "Ship by Sunday");

		expect(saveProjectDefinitionFactsMock).not.toHaveBeenCalled();
		expect(screen.queryByText("Draft saved.")).toBeNull();

		await user.clear(productNameField);

		await user.click(screen.getByRole("button", { name: /^Continue/ }));

		expect(saveProjectDefinitionFactsMock).not.toHaveBeenCalled();
		expect(screen.getByText("Foundation is still blank.")).toBeTruthy();
		await waitFor(() => expect(document.activeElement).toBe(productNameField));
		expect(productNameField.getAttribute("aria-invalid")).toBe("true");
		expect(productSummaryField.getAttribute("aria-invalid")).toBe("true");
		expect(primaryUserField.getAttribute("aria-invalid")).toBe("true");

		await user.type(productNameField, "Ship by Sunday");
		await user.type(
			productSummaryField,
			"A blueprint-first builder for Sunday launches.",
		);
		await user.click(screen.getByRole("button", { name: /^Continue/ }));

		await waitFor(() =>
			expect(saveProjectDefinitionFactsMock).toHaveBeenCalledWith(
				expect.objectContaining({
					stageId: "product",
					factsPatch: expect.objectContaining({
						product_name: "Ship by Sunday",
						product_summary: "A blueprint-first builder for Sunday launches.",
					}),
				}),
			),
		);
		expect(screen.getByText("Draft saved.")).toBeTruthy();
		expect(screen.getByText(/Page 1 of 3/)).toBeTruthy();
		await waitFor(() => expect(document.activeElement).toBe(primaryUserField));
		expect(primaryUserField.getAttribute("aria-invalid")).toBe("true");

		await user.type(
			primaryUserField,
			"Indie founders shipping a paid product.",
		);

		expect(primaryUserField.getAttribute("aria-invalid")).toBeNull();
	});

	it("advances after a complete save", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState({
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
		});

		render(
			<BlueprintStagePage
				stageId="product"
				stepId="foundation"
				initialWorkspaceState={workspaceState}
			/>,
		);

		await user.type(
			screen.getByLabelText("What's the name?"),
			"Ship by Sunday",
		);
		await user.type(
			screen.getByLabelText("What's the one-liner?"),
			"A blueprint-first builder for Sunday launches.",
		);
		await user.type(
			screen.getByLabelText("Who wants this? Who benefits from this?"),
			"Indie founders shipping a paid product.",
		);
		await user.click(screen.getByRole("button", { name: /^Continue/ }));

		await waitFor(() =>
			expect(saveProjectDefinitionFactsMock).toHaveBeenCalledWith(
				expect.objectContaining({
					stageId: "product",
					factsPatch: expect.objectContaining({
						product_name: "Ship by Sunday",
						product_summary: "A blueprint-first builder for Sunday launches.",
						primary_user: "Indie founders shipping a paid product.",
					}),
				}),
			),
		);
		expect(replaceMock).toHaveBeenCalledWith("/product/problem");
	});

	it("keeps a cleared step in place and explains that it became incomplete again", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState();

		render(
			<BlueprintStagePage
				stageId="build-plan"
				stepId="delivery"
				initialWorkspaceState={workspaceState}
			/>,
		);

		const priceField = screen.getByLabelText(
			"What's the one-time price in USD?",
		);
		await user.clear(priceField);
		await user.click(screen.getByRole("button", { name: /^Continue/ }));

		await waitFor(() =>
			expect(saveProjectDefinitionFactsMock).toHaveBeenCalledWith(
				expect.objectContaining({
					stageId: "build-plan",
					clearedFieldKeys: expect.arrayContaining(["pricing"]),
				}),
			),
		);
		expect(screen.getByText("This page is incomplete.")).toBeTruthy();
		expect(
			screen.getByText(/restore completion for this page\./i),
		).toBeTruthy();
		expect(screen.getByText(/Page 1 of 2/)).toBeTruthy();
		await waitFor(() => expect(document.activeElement).toBe(priceField));
		expect(priceField.getAttribute("aria-invalid")).toBe("true");
	});

	it("renders the shared pain and urgency scales on the problem page", () => {
		const workspaceState = createWorkspaceState();

		render(
			<BlueprintStagePage
				stageId="product"
				stepId="problem"
				initialWorkspaceState={workspaceState}
			/>,
		);

		expect(screen.getByText("Minor annoyance")).toBeTruthy();
		expect(screen.getByText("Critical blocker")).toBeTruthy();
		expect(
			screen.getByRole("radio", { name: "Pain 7 out of 10" }),
		).toBeTruthy();
	});

	it("shows a save failure inline and preserves the current draft", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState({
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
		});
		saveProjectDefinitionFactsMock.mockRejectedValueOnce(
			new Error("network unavailable"),
		);

		render(
			<BlueprintStagePage
				stageId="product"
				stepId="foundation"
				initialWorkspaceState={workspaceState}
			/>,
		);

		const productNameField = screen.getByLabelText("What's the name?");
		await user.type(productNameField, "Ship by Sunday");
		await user.click(screen.getByRole("button", { name: /^Continue/ }));

		await waitFor(() =>
			expect(
				screen.getByText("We could not save this page right now."),
			).toBeTruthy(),
		);
		expect((productNameField as HTMLInputElement).value).toBe("Ship by Sunday");
		expect(screen.getByText(/Page 1 of 3/)).toBeTruthy();
		expect(
			screen
				.getByLabelText("Who wants this? Who benefits from this?")
				.getAttribute("aria-invalid"),
		).toBeNull();
	});

	it("adds native browser warnings for unload and browser history while the draft is dirty", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState({
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
		});
		const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
		const historyBackSpy = vi
			.spyOn(window.history, "back")
			.mockImplementation(() => undefined);
		const pushStateSpy = vi
			.spyOn(window.history, "pushState")
			.mockImplementation(() => undefined);

		render(
			<BlueprintStagePage
				stageId="product"
				stepId="foundation"
				initialWorkspaceState={workspaceState}
			/>,
		);

		await user.type(
			screen.getByLabelText("What's the name?"),
			"Ship by Sunday",
		);

		const beforeUnloadEvent = new Event("beforeunload", {
			cancelable: true,
		}) as BeforeUnloadEvent;
		Object.defineProperty(beforeUnloadEvent, "returnValue", {
			value: undefined,
			writable: true,
		});

		window.dispatchEvent(beforeUnloadEvent);
		window.dispatchEvent(new PopStateEvent("popstate"));

		expect(beforeUnloadEvent.defaultPrevented).toBe(true);
		expect(confirmSpy).toHaveBeenCalledWith(
			"You have unsaved changes. Leave without saving?",
		);
		expect(historyBackSpy).not.toHaveBeenCalled();
		expect(pushStateSpy).toHaveBeenCalled();
	});

	it("redirects locked stage routes back to the first incomplete blueprint stage", () => {
		const workspaceState = createWorkspaceState({
			product_name: undefined,
		});

		expect(() =>
			render(
				<BlueprintStagePage
					stageId="design"
					stepId="direction"
					initialWorkspaceState={workspaceState}
				/>,
			),
		).toThrowError("NEXT_REDIRECT:/product");
		expect(redirectMock).toHaveBeenCalledWith("/product");
	});

	it("renders the mapped blueprint video and the L2 orientation fallback", () => {
		const workspaceState = createWorkspaceState();
		const { rerender } = render(
			<BlueprintStagePage
				stageId="product"
				stepId="foundation"
				initialWorkspaceState={workspaceState}
			/>,
		);

		expect(screen.getByTestId("blueprint-stage-video-player").textContent).toBe(
			"Product Foundation Video",
		);

		rerender(
			<BlueprintStagePage
				stageId="product"
				stepId="problem"
				initialWorkspaceState={workspaceState}
			/>,
		);

		expect(screen.queryByTestId("blueprint-stage-video-player")).toBeNull();
		expect(screen.getByText("Problem checkpoint")).toBeTruthy();
		expect(
			screen.getByText(
				"This page is intentionally text-first until the L2 recording is uploaded.",
			),
		).toBeTruthy();
	});
});
