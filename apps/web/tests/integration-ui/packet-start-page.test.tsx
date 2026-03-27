import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
	getPacketStageDefinition,
} from "@packet-compiler";

import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";

vi.mock("@/features/course/shared/components/app-shell", () => ({
	AppShell: ({
		title,
		subtitle,
		children,
	}: {
		title: string;
		subtitle?: string;
		children: React.ReactNode;
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

vi.mock("@/features/course/lesson/components/lesson-video-player", () => ({
	LessonVideoPlayer: ({ title }: { title?: string }) => (
		<div data-testid="packet-start-video-player">{title ?? "Lesson video"}</div>
	),
}));

vi.mock("@/features/packet-flow/components/packet-stage-nav", () => ({
	PacketStageNav: () => <div data-testid="packet-stage-nav" />,
}));

import { PacketStartPage } from "@/features/packet-flow/components/packet-start-page";

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

describe("PacketStartPage", () => {
	it("renders a stacked start page with one primary packet CTA and no stage strip", () => {
		const workspaceState = createWorkspaceState({
			product_name: "Ship by Sunday",
			objective: undefined,
		});

		render(<PacketStartPage initialWorkspaceState={workspaceState} />);

		expect(screen.getByRole("heading", { name: "Start" })).toBeTruthy();
		expect(
			screen.getByText("Build the folder before you build the app."),
		).toBeTruthy();
		expect(screen.getByText("Welcome video")).toBeTruthy();
		expect(screen.getByTestId("packet-start-video-player").textContent).toBe(
			"Welcome Video",
		);
		expect(screen.queryByTestId("packet-stage-nav")).toBeNull();
		expect(
			screen.queryByText(
				"This product is pack-first. Every stage fills real output files.",
			),
		).toBeNull();
		expect(
			screen
				.getByRole("link", {
					name: `Continue with ${getPacketStageDefinition(workspaceState.firstIncompleteStageId).label}`,
				})
				.getAttribute("href"),
		).toBe(
			getPacketStageDefinition(workspaceState.firstIncompleteStageId).route,
		);
	});
});
