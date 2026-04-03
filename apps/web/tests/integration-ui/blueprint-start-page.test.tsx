import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
	getBlueprintStageDefinition,
} from "@blueprint-compiler";

import type { BlueprintWorkspaceState } from "@/features/blueprint-flow/lib/blueprint-workspace-types";

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

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
	}),
}));

vi.mock("@/features/course/lesson/components/lesson-video-player", () => ({
	LessonVideoPlayer: ({ title }: { title?: string }) => (
		<div data-testid="blueprint-start-video-player">
			{title ?? "Lesson video"}
		</div>
	),
}));

vi.mock("@/components/ui/hero-highlight", () => ({
	HeroHighlight: ({
		children,
		className,
		containerClassName,
	}: {
		children: React.ReactNode;
		className?: string;
		containerClassName?: string;
	}) => (
		<div className={containerClassName}>
			<div className={className}>{children}</div>
		</div>
	),
	Highlight: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/features/blueprint-flow/components/blueprint-stage-nav", () => ({
	BlueprintStageNav: () => <div data-testid="blueprint-stage-nav" />,
}));

import { BlueprintStartPage } from "@/features/blueprint-flow/components/blueprint-start-page";

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

describe("BlueprintStartPage", () => {
	it("renders a stacked start page with one primary blueprint CTA and no stage strip", () => {
		const workspaceState = createWorkspaceState({
			product_name: "Ship by Sunday",
			objective: undefined,
		});

		render(<BlueprintStartPage initialWorkspaceState={workspaceState} />);

		expect(screen.getByRole("heading", { name: "Start" })).toBeTruthy();
		expect(
			screen.getByRole("heading", {
				name: /Build the BRIEF before you build the app\./i,
			}),
		).toBeTruthy();
		expect(screen.getByTestId("blueprint-start-video-player").textContent).toBe(
			"Welcome Video",
		);
		expect(screen.queryByTestId("blueprint-stage-nav")).toBeNull();
		expect(
			screen.queryByText(
				"This product is pack-first. Every stage fills real output files.",
			),
		).toBeNull();
		expect(
			screen
				.getByRole("link", {
					name: new RegExp(
						`Continue with ${getBlueprintStageDefinition(workspaceState.firstIncompleteStageId).label}`,
					),
				})
				.getAttribute("href"),
		).toBe(
			getBlueprintStageDefinition(workspaceState.firstIncompleteStageId).route,
		);
	});
});
