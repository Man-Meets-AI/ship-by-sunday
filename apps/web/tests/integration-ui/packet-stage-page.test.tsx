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

const saveProjectDefinitionFactsMock = vi.fn();
const useMutationMock = vi.fn(() => saveProjectDefinitionFactsMock);
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

vi.mock("convex/react", () => ({
	useConvexAuth: () => ({
		isAuthenticated: false,
		isLoading: false,
	}),
	useMutation: () => useMutationMock(),
	useQuery: () => undefined,
}));

vi.mock("@/features/course/shared/components/app-shell", () => ({
	AppShell: ({
		title,
		subtitle,
		children,
	}: {
		title: string;
		subtitle: string;
		children: React.ReactNode;
	}) => (
		<div>
			<h1>{title}</h1>
			<p>{subtitle}</p>
			{children}
		</div>
	),
}));

import { PacketStagePage } from "@/features/packet-flow/components/packet-stage-page";

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

describe("PacketStagePage", () => {
	beforeEach(() => {
		saveProjectDefinitionFactsMock.mockReset();
		useMutationMock.mockClear();
		redirectMock.mockClear();
	});

	it("lets users browse to a later step inside the unlocked stage and save it", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState({
			screen_sequence: undefined,
			must_have_capabilities: undefined,
			visual_thesis: undefined,
		});

		render(
			<PacketStagePage
				stageId="design"
				initialWorkspaceState={workspaceState}
			/>,
		);

		expect(screen.getAllByText("Current objective")).toHaveLength(2);
		expect(screen.getByText("Design Pack")).toBeTruthy();
		expect(screen.getByText("Marketing").closest("a")).toBeNull();

		await user.click(screen.getByRole("button", { name: /Direction/i }));

		expect(screen.getByText("Step 3 of 4: Direction")).toBeTruthy();

		const visualThesisField = screen.getByLabelText("Visual Thesis");
		await user.clear(visualThesisField);
		await user.type(
			visualThesisField,
			"Sharper visual hierarchy for the hero.",
		);
		await user.click(screen.getByRole("button", { name: "Save step" }));

		expect(saveProjectDefinitionFactsMock).toHaveBeenCalledWith(
			expect.objectContaining({
				stageId: "design",
				factsPatch: expect.objectContaining({
					visual_thesis: "Sharper visual hierarchy for the hero.",
				}),
			}),
		);
	});

	it("redirects locked stage routes back to the first incomplete packet stage", () => {
		const workspaceState = createWorkspaceState({
			screen_sequence: undefined,
			must_have_capabilities: undefined,
		});

		expect(() =>
			render(
				<PacketStagePage
					stageId="marketing"
					initialWorkspaceState={workspaceState}
				/>,
			),
		).toThrowError("NEXT_REDIRECT:/design");
		expect(redirectMock).toHaveBeenCalledWith("/design");
	});
});
