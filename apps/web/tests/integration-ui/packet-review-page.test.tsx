import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
} from "@packet-compiler";

import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";

const unlockExecuteShipMock = vi.fn();
const useConvexAuthMock = vi.fn();
const useQueryMock = vi.fn();
const redirectMock = vi.fn((href: string) => {
	throw new Error(`NEXT_REDIRECT:${href}`);
});
const pushMock = vi.fn();

vi.mock("@/features/course/shared/components/app-shell", () => ({
	AppShell: ({
		title,
		subtitle,
		children,
	}: {
		title: string;
		subtitle?: string;
		children: ReactNode;
	}) => (
		<div>
			<h1>{title}</h1>
			{subtitle ? <p>{subtitle}</p> : null}
			{children}
		</div>
	),
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

vi.mock("@/features/packet-flow/components/packet-stage-nav", () => ({
	PacketStageNav: () => <div data-testid="packet-stage-nav" />,
}));

vi.mock("@/features/course/lesson/components/lesson-video-player", () => ({
	LessonVideoPlayer: ({ title }: { title?: string }) => (
		<div data-testid="packet-review-video-player">
			{title ?? "Lesson video"}
		</div>
	),
}));

vi.mock("convex/react", () => ({
	useConvexAuth: () => useConvexAuthMock(),
	useMutation: () => unlockExecuteShipMock,
	useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

vi.mock("next/navigation", () => ({
	redirect: (href: string) => redirectMock(href),
	useRouter: () => ({
		push: pushMock,
	}),
}));

import { PacketReviewPage } from "@/features/packet-flow/components/packet-review-page";

function createWorkspaceState(
	options: {
		executeShipUnlockedAt?: number;
		factOverrides?: Record<string, unknown>;
	} = {},
): PacketWorkspaceState {
	const baseFacts = createCompleteProjectDefinition().facts;
	const facts = Object.fromEntries(
		Object.entries({
			...baseFacts,
			...options.factOverrides,
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
		workflowState: options.executeShipUnlockedAt
			? {
					clerkUserId: "user_123",
					productKey: "ship-by-sunday",
					executeShipUnlockedAt: options.executeShipUnlockedAt,
					createdAt: options.executeShipUnlockedAt,
					updatedAt: options.executeShipUnlockedAt,
				}
			: null,
		firstIncompleteStageId: stageStatus.firstIncompleteStageId,
		packetReadiness: stageStatus.packetReadiness,
		stageStatuses: stageStatus.stageStatuses,
	} as PacketWorkspaceState;
}

describe("PacketReviewPage", () => {
	beforeEach(() => {
		redirectMock.mockClear();
		unlockExecuteShipMock.mockReset();
		pushMock.mockReset();
		useConvexAuthMock.mockReset();
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
		});
		useQueryMock.mockReset();
		useQueryMock.mockReturnValue(undefined);
	});

	it("renders the starter snapshot as the primary outcome and expands execute after download", async () => {
		const user = userEvent.setup();
		const readyWorkspaceState = createWorkspaceState();
		render(<PacketReviewPage initialWorkspaceState={readyWorkspaceState} />);

		expect(
			screen.getByRole("heading", { name: "Review & Download" }),
		).toBeTruthy();
		const reviewVideo = screen.getByTestId("packet-review-video-player");
		expect(screen.getByText("Starter Snapshot is ready.")).toBeTruthy();
		expect(
			screen.getByRole("heading", {
				name: "What's inside the Starter Snapshot",
			}),
		).toBeTruthy();
		expect(screen.getByText("Design Pack")).toBeTruthy();
		expect(screen.getByText("Marketing Pack")).toBeTruthy();
		expect(screen.getByText("Build Pack")).toBeTruthy();
		expect(screen.getByText("Prompt Pack")).toBeTruthy();
		expect(screen.getByText("Included under docs/design/")).toBeTruthy();
		expect(screen.getByText("Included under docs/marketing/")).toBeTruthy();
		expect(screen.getByText("Included under docs/build/")).toBeTruthy();
		expect(screen.getByText("Included under docs/prompts/")).toBeTruthy();
		expect(
			screen.getByText(
				"Execute / Ship opens as a separate optional next path after this download.",
			),
		).toBeTruthy();
		expect(
			screen
				.getByRole("button", { name: "Download Snapshot to Unlock" })
				.hasAttribute("disabled"),
		).toBe(true);
		expect(screen.queryByText("QUEST")).toBeNull();
		expect(reviewVideo.textContent).toBe("Review Video");

		await user.click(screen.getByRole("link", { name: "Download Snapshot" }));

		expect(
			screen
				.getByRole("button", { name: "Unlock Execute / Ship" })
				.hasAttribute("disabled"),
		).toBe(false);
		expect(screen.getByText("Execute / Ship")).toBeTruthy();

		unlockExecuteShipMock.mockResolvedValue({
			executeShipUnlockedAt: 123,
		});
		await user.click(
			screen.getByRole("button", { name: "Unlock Execute / Ship" }),
		);

		expect(unlockExecuteShipMock).toHaveBeenCalledWith({});
		expect(pushMock).toHaveBeenCalledWith("/execute");

		expect(screen.queryByRole("link", { name: "Download Pack" })).toBeNull();
		expect(
			screen
				.getByRole("link", { name: "Download Snapshot" })
				.getAttribute("href"),
		).toBe("/api/download/repo");
	});

	it("derives execute unlock from the live workspace query", () => {
		useQueryMock.mockReturnValue(
			createWorkspaceState({
				executeShipUnlockedAt: 456,
			}),
		);
		render(<PacketReviewPage initialWorkspaceState={createWorkspaceState()} />);

		expect(
			screen
				.getByRole("link", { name: "Open Execute / Ship" })
				.getAttribute("href"),
		).toBe("/execute");
		expect(
			screen.queryByRole("button", { name: "Unlock Execute / Ship" }),
		).toBeNull();
		expect(
			screen.getByText(
				"Execute / Ship is unlocked as a separate optional next path.",
			),
		).toBeTruthy();
		expect(
			screen.getByText("You have full access to the post-download library."),
		).toBeTruthy();
	});

	it("redirects back to the first incomplete stage when review is still locked", () => {
		const lockedWorkspaceState = createWorkspaceState({
			factOverrides: {
				objective: undefined,
			},
		});

		expect(() =>
			render(<PacketReviewPage initialWorkspaceState={lockedWorkspaceState} />),
		).toThrowError("NEXT_REDIRECT:/build-plan");
		expect(redirectMock).toHaveBeenCalledWith("/build-plan");
	});
});
