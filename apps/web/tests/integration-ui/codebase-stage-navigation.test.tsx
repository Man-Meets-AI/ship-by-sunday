import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
} from "@shipbysunday/codebase-compiler";
import type { CodebaseWorkspaceState } from "@/lib/codebase-flow/codebase-workspace-types";

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

import { CodebaseStageNav } from "@/app/(workspace)/_components/codebase-flow/codebase-stage-nav";

function createWorkspaceState(
	factOverrides: Record<string, unknown> = {},
): CodebaseWorkspaceState {
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
		codebaseReadiness: stageStatus.codebaseReadiness,
		stageStatuses: stageStatus.stageStatuses,
	} as CodebaseWorkspaceState;
}

describe("CodebaseStageNav", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("renders stage-level codebase links without step dropdown buttons", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState();
		const onNavigate = vi.fn();

		render(
			<CodebaseStageNav
				currentStageId="codebase"
				stageStatuses={workspaceState.stageStatuses}
				onNavigate={onNavigate}
			/>,
		);

		expect(screen.getByRole("link", { name: "Codebase" })).toBeTruthy();
		expect(screen.getByRole("link", { name: "Review" })).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: "Codebase" })
				.getAttribute("aria-current"),
		).toBe("page");
		expect(screen.queryByRole("button", { name: "Codebase" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Review" })).toBeNull();

		await user.click(screen.getByRole("link", { name: "Review" }));
		expect(onNavigate).toHaveBeenCalledWith("/review");
	});

	it("keeps review as a plain active stage link", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState();
		const onNavigate = vi.fn();

		render(
			<CodebaseStageNav
				currentStageId="review"
				stageStatuses={workspaceState.stageStatuses}
				onNavigate={onNavigate}
			/>,
		);

		expect(
			screen.getByRole("link", { name: "Review" }).getAttribute("aria-current"),
		).toBe("page");
		expect(screen.getByRole("link", { name: "Codebase" })).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Codebase" })).toBeNull();

		await user.click(screen.getByRole("link", { name: "Codebase" }));
		expect(onNavigate).toHaveBeenCalledWith("/codebase");
	});
});
