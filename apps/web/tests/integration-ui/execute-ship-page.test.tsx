import React from "react";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
} from "@packet-compiler";

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

	it("renders the optional execute hub and starter track detail views after unlock", async () => {
		const user = userEvent.setup();
		render(
			<ExecuteShipPage
				initialWorkspaceState={createWorkspaceState({
					executeShipUnlockedAt: 123,
				})}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Execute / Ship" }),
		).toBeTruthy();
		expect(screen.getByRole("tab", { name: /Build Now/i })).toBeTruthy();
		expect(screen.getByRole("tab", { name: /Refine Design/i })).toBeTruthy();
		expect(screen.getByRole("tab", { name: /QA & Debug/i })).toBeTruthy();
		expect(
			screen.getByText(
				"Start with the smallest shippable slice from your build packet.",
			),
		).toBeTruthy();

		await user.click(screen.getByRole("tab", { name: /QA & Debug/i }));

		expect(
			screen.getByText(
				"Find the highest-risk regression before it reaches launch day.",
			),
		).toBeTruthy();
	});

	it("redirects back to review when the execute branch is still locked", () => {
		expect(() =>
			render(
				<ExecuteShipPage initialWorkspaceState={createWorkspaceState()} />,
			),
		).toThrowError("NEXT_REDIRECT:/review");
		expect(redirectMock).toHaveBeenCalledWith("/review");
	});
});
