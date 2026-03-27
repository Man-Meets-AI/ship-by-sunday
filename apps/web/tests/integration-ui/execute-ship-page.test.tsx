import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
} from "@packet-compiler";

import { getLessonHref } from "@/features/course/lesson/model/manifest";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";

const redirectMock = vi.fn((href: string) => {
	throw new Error(`NEXT_REDIRECT:${href}`);
});

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
}));

vi.mock("@/features/course/shared/components/app-shell", () => ({
	AppShell: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

vi.mock("@/features/packet-flow/components/video/packet-video-card", () => ({
	PacketVideoCard: ({
		content,
	}: {
		content:
			| {
					kind: "video";
					description: string;
					title: string;
					video: { videoId: string };
			  }
			| { kind: "orientation"; description: string; title: string };
	}) => (
		<div>
			<p>{content.title}</p>
			{content.kind === "video" ? <p>{content.video.videoId}</p> : null}
			{content.kind === "orientation" ? <p>{content.description}</p> : null}
		</div>
	),
}));

import { ExecuteShipPage } from "@/features/execute-ship/components/execute-ship-page";

function createWorkspaceState(
	options: {
		factOverrides?: Record<string, unknown>;
		executeShipUnlockedAt?: number;
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

describe("ExecuteShipPage", () => {
	beforeEach(() => {
		redirectMock.mockClear();
	});

	it("renders the bonus bridge for a newly unlocked customer", () => {
		render(
			<ExecuteShipPage
				initialWorkspaceState={createWorkspaceState({
					executeShipUnlockedAt: 123,
				})}
			/>,
		);

		expect(
			screen.getByText(
				"Ship by Sunday OS has its packet. Now ship the first slice.",
			),
		).toBeTruthy();
		expect(
			screen.getByText(
				"Review & Download finished the required funnel. Execute / Ship is the unlocked bonus library that helps you turn the packet into working software without reopening the intake workbench.",
			),
		).toBeTruthy();
		expect(
			screen.getByText(
				"Watch this first so the Execute / Ship handoff stays anchored to the packet-first flow before you continue in BUILD.",
			),
		).toBeTruthy();
		expect(
			screen.getByText("3382315c-5cec-4d1c-aa37-611f8b52e6cf"),
		).toBeTruthy();
		expect(screen.getByText("Continue in BUILD")).toBeTruthy();
		expect(screen.getByText("Re-anchor in Product")).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: "Continue in Build" })
				.getAttribute("href"),
		).toBe(getLessonHref("3.1"));
		expect(
			screen
				.getByRole("link", { name: "Start from the beginning" })
				.getAttribute("href"),
		).toBe(getLessonHref("1.1"));
		expect(
			screen.queryByRole("link", { name: "Browse the bonus library" }),
		).toBeNull();
	});

	it("redirects back to review when the execute branch is still locked", () => {
		expect(() =>
			render(
				<ExecuteShipPage initialWorkspaceState={createWorkspaceState()} />,
			),
		).toThrowError("NEXT_REDIRECT:/review");
		expect(redirectMock).toHaveBeenCalledWith("/review");
	});

	it("redirects repeat visitors into mission after any bonus lesson has been opened", () => {
		expect(() =>
			render(
				<ExecuteShipPage
					initialWorkspaceState={createWorkspaceState({
						executeShipUnlockedAt: 123,
					})}
					hasStartedBonusLesson
				/>,
			),
		).toThrowError("NEXT_REDIRECT:/mission");
		expect(redirectMock).toHaveBeenCalledWith("/mission");
	});
});
