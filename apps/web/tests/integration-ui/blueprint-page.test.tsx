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
const useQueryMock = vi.fn(() => undefined);
const pushMock = vi.fn();
const replaceMock = vi.fn();

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		onNavigate: _onNavigate,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
		children: React.ReactNode;
		href: string;
		onNavigate?: unknown;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock("next/navigation", () => ({
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

vi.mock("@/features/course/shared/components/app-shell", () => ({
	AppShell: ({
		title,
		children,
		localNav,
	}: {
		title: string;
		children: React.ReactNode;
		localNav?: { compact?: React.ReactNode; desktop?: React.ReactNode };
	}) => (
		<div>
			<h1>{title}</h1>
			<div data-testid="blueprint-local-nav-compact">{localNav?.compact}</div>
			<div data-testid="blueprint-local-nav-desktop">{localNav?.desktop}</div>
			{children}
		</div>
	),
}));

vi.mock("@/features/course/lesson/components/lesson-video-player", () => ({
	LessonVideoPlayer: ({ title }: { title?: string }) => (
		<div data-testid="blueprint-page-video-player">
			{title ?? "Lesson video"}
		</div>
	),
}));

import { BlueprintPage } from "@/features/blueprint-flow/components/blueprint-page";

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
		workflowState: null,
		firstIncompleteStageId: stageStatus.firstIncompleteStageId,
		blueprintReadiness: stageStatus.blueprintReadiness,
		stageStatuses: stageStatus.stageStatuses,
	} as BlueprintWorkspaceState;
}

describe("BlueprintPage", () => {
	beforeEach(() => {
		saveProjectDefinitionFactsMock.mockReset();
		useMutationMock.mockClear();
		useQueryMock.mockReset();
		pushMock.mockReset();
		replaceMock.mockReset();
	});

	it("renders the combined blueprint surface with overview, sections, and progress links", () => {
		render(<BlueprintPage initialWorkspaceState={createWorkspaceState()} />);

		expect(screen.getAllByRole("heading", { name: "Blueprint" })).toHaveLength(
			2,
		);
		expect(
			screen.getByText(
				"Answer the full reduced blueprint here, keep the draft local until you press Continue to Review, and let the review page stay focused on readiness plus the Ship by Sunday Blueprint download.",
			),
		).toBeTruthy();
		expect(screen.getByTestId("blueprint-page-video-player").textContent).toBe(
			"Welcome Video",
		);
		expect(screen.getByRole("link", { name: "Foundation" })).toBeTruthy();
		expect(
			screen.getByRole("heading", {
				name: "Name the product clearly and anchor who it is for.",
			}),
		).toBeTruthy();
		expect(
			screen.getByRole("heading", {
				name: "Review the compiler-owned marketing defaults derived from your answers.",
			}),
		).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Continue to Review" }),
		).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: "Generated preview" })
				.getAttribute("href"),
		).toBe("#generated-preview");
	});

	it("saves partial work on continue and reveals the remaining blockers", async () => {
		const user = userEvent.setup();
		render(
			<BlueprintPage
				initialWorkspaceState={createWorkspaceState({
					product_name: undefined,
					product_summary: undefined,
					primary_user: undefined,
					pricing: undefined,
				})}
			/>,
		);

		await user.type(
			screen.getByLabelText("What's the name?"),
			"Ship by Sunday Blueprint",
		);
		await user.click(
			screen.getByRole("button", { name: "Continue to Review" }),
		);

		await waitFor(() => {
			expect(saveProjectDefinitionFactsMock).toHaveBeenCalledTimes(1);
		});
		expect(screen.getByText("Draft saved.")).toBeTruthy();
		expect(
			screen.getAllByText("Add an answer here before Review can unlock.")
				.length,
		).toBeGreaterThan(0);
		expect(pushMock).not.toHaveBeenCalled();
		expect(replaceMock).not.toHaveBeenCalled();
	});
});
