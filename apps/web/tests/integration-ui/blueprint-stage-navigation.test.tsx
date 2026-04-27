import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
} from "@shipbysunday/blueprint-compiler";
import type { BlueprintWorkspaceState } from "@/lib/blueprint-flow/blueprint-workspace-types";

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

import { BlueprintStageNav } from "@/app/(workspace)/_components/blueprint-flow/blueprint-stage-nav";

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

describe("BlueprintStageNav", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("renders stage-level blueprint links without step dropdown buttons", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState();
		const onNavigate = vi.fn();

		render(
			<BlueprintStageNav
				currentStageId="blueprint"
				stageStatuses={workspaceState.stageStatuses}
				onNavigate={onNavigate}
			/>,
		);

		expect(screen.getByRole("link", { name: "Blueprint" })).toBeTruthy();
		expect(screen.getByRole("link", { name: "Review" })).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: "Blueprint" })
				.getAttribute("aria-current"),
		).toBe("page");
		expect(screen.queryByRole("button", { name: "Blueprint" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Review" })).toBeNull();

		await user.click(screen.getByRole("link", { name: "Review" }));
		expect(onNavigate).toHaveBeenCalledWith("/review");
	});

	it("keeps review as a plain active stage link", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState();
		const onNavigate = vi.fn();

		render(
			<BlueprintStageNav
				currentStageId="review"
				stageStatuses={workspaceState.stageStatuses}
				onNavigate={onNavigate}
			/>,
		);

		expect(
			screen.getByRole("link", { name: "Review" }).getAttribute("aria-current"),
		).toBe("page");
		expect(screen.getByRole("link", { name: "Blueprint" })).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Blueprint" })).toBeNull();

		await user.click(screen.getByRole("link", { name: "Blueprint" }));
		expect(onNavigate).toHaveBeenCalledWith("/blueprint");
	});
});
