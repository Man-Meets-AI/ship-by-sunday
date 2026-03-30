import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
	getPacketStageDefinition,
} from "@packet-compiler";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";

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

import { PacketStageNav } from "@/features/packet-flow/components/packet-stage-nav";

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

describe("PacketStageNav", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("renders plain start and review links while Product opens its step dropdown", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState();
		const onNavigate = vi.fn();

		const { container } = render(
			<PacketStageNav
				currentStageId="product"
				activeStepId="outcome"
				stageStatuses={workspaceState.stageStatuses}
				onNavigate={onNavigate}
			/>,
		);

		expect(screen.getByRole("link", { name: "Start" })).toBeTruthy();
		expect(screen.getByRole("link", { name: "Review" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Product" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Design" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Marketing" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Build Plan" })).toBeTruthy();
		expect(
			container.querySelector('[data-slot="navigation-menu-viewport"]'),
		).toBeNull();

		await user.click(screen.getByRole("button", { name: "Product" }));

		const productStage = getPacketStageDefinition("product");
		const foundationLink = screen.getByRole("link", {
			name: /Completed Foundation|Foundation/,
		});
		const problemLink = screen.getByRole("link", {
			name: /Completed Problem|Problem/,
		});
		const outcomeLink = screen.getByRole("link", {
			name: new RegExp(productStage.steps[2]?.label ?? "Outcome"),
		});

		expect(foundationLink).toBeTruthy();
		expect(problemLink).toBeTruthy();
		expect(outcomeLink.getAttribute("aria-current")).toBe("page");
		expect(outcomeLink.getAttribute("data-active")).toBe("true");

		await user.click(foundationLink);

		expect(onNavigate).toHaveBeenCalledWith("/product/foundation");
	});

	it("keeps review as a plain link while still exposing routed stage dropdowns", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState();

		render(
			<PacketStageNav
				currentStageId="review"
				stageStatuses={workspaceState.stageStatuses}
			/>,
		);

		expect(
			screen.getByRole("link", { name: "Review" }).getAttribute("aria-current"),
		).toBe("page");
		expect(screen.getByRole("link", { name: "Start" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Product" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Design" })).toBeTruthy();

		await user.click(screen.getByRole("button", { name: "Build Plan" }));

		const buildPlanStage = getPacketStageDefinition("build-plan");
		for (const step of buildPlanStage.steps) {
			expect(screen.getByText(step.label)).toBeTruthy();
		}
	});
});
