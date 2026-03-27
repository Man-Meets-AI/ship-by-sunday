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
	useMutation: () => unlockExecuteShipMock,
}));

vi.mock("next/navigation", () => ({
	redirect: (href: string) => redirectMock(href),
	useRouter: () => ({
		push: pushMock,
	}),
}));

import { PacketReviewPage } from "@/features/packet-flow/components/packet-review-page";

function createWorkspaceState(
	factOverrides: Record<string, unknown> = {},
): PacketWorkspaceState {
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
		packetReadiness: stageStatus.packetReadiness,
		stageStatuses: stageStatus.stageStatuses,
	} as PacketWorkspaceState;
}

describe("PacketReviewPage", () => {
	beforeEach(() => {
		redirectMock.mockClear();
		unlockExecuteShipMock.mockReset();
		pushMock.mockReset();
	});

	it("renders the starter snapshot as the primary outcome and expands execute after download", async () => {
		const user = userEvent.setup();
		const readyWorkspaceState = createWorkspaceState();
		render(<PacketReviewPage initialWorkspaceState={readyWorkspaceState} />);

		expect(
			screen.getByRole("heading", { name: "Review & Download" }),
		).toBeTruthy();
		const reviewVideo = screen.getByTestId("packet-review-video-player");
		const checkpoint = screen.getByText("Starter Snapshot is ready.");
		expect(screen.getByText("Starter Snapshot is ready.")).toBeTruthy();
		expect(screen.getByText("Design Pack")).toBeTruthy();
		expect(screen.getByText("Marketing Pack")).toBeTruthy();
		expect(screen.getByText("Build Pack")).toBeTruthy();
		expect(screen.getByText("Prompt Pack")).toBeTruthy();
		expect(
			screen.getByText(
				"Execute / Ship opens as a separate optional next path after this download.",
			),
		).toBeTruthy();
		expect(
			screen.queryByRole("button", { name: "Unlock Execute / Ship" }),
		).toBeNull();
		expect(reviewVideo.textContent).toBe("Review Video");
		expect(
			reviewVideo.compareDocumentPosition(checkpoint) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();

		await user.click(
			screen.getByRole("link", { name: "Download Starter Snapshot" }),
		);

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

		expect(
			screen
				.getByRole("link", { name: "Download Design Pack" })
				.getAttribute("href"),
		).toBe("/api/download/packet/design");
		expect(
			screen
				.getByRole("link", { name: "Download Marketing Pack" })
				.getAttribute("href"),
		).toBe("/api/download/packet/marketing");
		expect(
			screen
				.getByRole("link", { name: "Download Build Pack" })
				.getAttribute("href"),
		).toBe("/api/download/packet/build");
		expect(
			screen
				.getByRole("link", { name: "Download Starter Snapshot" })
				.getAttribute("href"),
		).toBe("/api/download/repo");
	});

	it("redirects back to the first incomplete stage when review is still locked", () => {
		const lockedWorkspaceState = createWorkspaceState({
			objective: undefined,
		});

		expect(() =>
			render(<PacketReviewPage initialWorkspaceState={lockedWorkspaceState} />),
		).toThrowError("NEXT_REDIRECT:/build-plan");
		expect(redirectMock).toHaveBeenCalledWith("/build-plan");
	});
});
