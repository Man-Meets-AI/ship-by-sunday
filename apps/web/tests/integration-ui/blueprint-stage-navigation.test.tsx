import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
} from "@blueprint-compiler";
import type { BlueprintWorkspaceState } from "@/features/blueprint-flow/lib/blueprint-workspace-types";

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

import { BlueprintStageNav } from "@/features/blueprint-flow/components/blueprint-stage-nav";

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
				currentStageId="product"
				stageStatuses={workspaceState.stageStatuses}
				onNavigate={onNavigate}
			/>,
		);

		expect(screen.getByRole("link", { name: "Start" })).toBeTruthy();
		expect(screen.getByRole("link", { name: "Review" })).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: "Product" })
				.getAttribute("aria-current"),
		).toBe("page");
		expect(screen.queryByRole("button", { name: "Product" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Design" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Marketing" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Build Plan" })).toBeNull();

		await user.click(screen.getByRole("link", { name: "Design" }));
		expect(onNavigate).toHaveBeenCalledWith("/design");
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
		expect(screen.getByRole("link", { name: "Start" })).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Product" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Design" })).toBeNull();

		await user.click(screen.getByRole("link", { name: "Start" }));
		expect(onNavigate).toHaveBeenCalledWith("/start");
	});
});
