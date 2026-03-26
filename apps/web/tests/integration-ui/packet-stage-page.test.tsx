import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
const pushMock = vi.fn();

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
	useRouter: () => ({
		push: pushMock,
	}),
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

vi.mock("@/features/course/lesson/components/lesson-video-player", () => ({
	LessonVideoPlayer: ({ title }: { title?: string }) => (
		<div data-testid="packet-stage-video-player">{title ?? "Lesson video"}</div>
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
		pushMock.mockReset();
	});

	it("blocks blank saves, saves partial drafts in place, and clears field errors as users fix them", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState({
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
			why_this_matters: undefined,
		});

		render(
			<PacketStagePage
				stageId="product"
				stepId="foundation"
				initialWorkspaceState={workspaceState}
			/>,
		);

		const productNameField = screen.getByLabelText("Product Name");
		const productSummaryField = screen.getByLabelText("Product Summary");
		const primaryUserField = screen.getByLabelText("Primary User");
		const whyThisMattersField = screen.getByLabelText("Why This Matters");

		await user.click(screen.getByRole("button", { name: "Save step" }));

		expect(saveProjectDefinitionFactsMock).not.toHaveBeenCalled();
		expect(screen.getByText("Foundation is still blank.")).toBeTruthy();
		expect(document.activeElement).toBe(productNameField);
		expect(productNameField.getAttribute("aria-invalid")).toBe("true");
		expect(productSummaryField.getAttribute("aria-invalid")).toBe("true");
		expect(primaryUserField.getAttribute("aria-invalid")).toBe("true");
		expect(whyThisMattersField.getAttribute("aria-invalid")).toBe("true");

		await user.type(productNameField, "Ship by Sunday");
		await user.type(
			productSummaryField,
			"A packet-first builder for Sunday launches.",
		);
		await user.click(screen.getByRole("button", { name: "Save step" }));

		await waitFor(() =>
			expect(saveProjectDefinitionFactsMock).toHaveBeenCalledWith(
				expect.objectContaining({
					stageId: "product",
					factsPatch: expect.objectContaining({
						product_name: "Ship by Sunday",
						product_summary: "A packet-first builder for Sunday launches.",
					}),
				}),
			),
		);
		expect(screen.getByText("Draft saved.")).toBeTruthy();
		expect(screen.getByText("Step 1 of 4: Foundation")).toBeTruthy();
		expect(document.activeElement).toBe(primaryUserField);
		expect(primaryUserField.getAttribute("aria-invalid")).toBe("true");
		expect(whyThisMattersField.getAttribute("aria-invalid")).toBe("true");

		await user.type(
			primaryUserField,
			"Indie founders shipping a paid product.",
		);

		expect(primaryUserField.getAttribute("aria-invalid")).toBeNull();
		expect(whyThisMattersField.getAttribute("aria-invalid")).toBe("true");
	});

	it("advances after a complete save", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState({
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
			why_this_matters: undefined,
		});

		render(
			<PacketStagePage
				stageId="product"
				stepId="foundation"
				initialWorkspaceState={workspaceState}
			/>,
		);

		await user.type(screen.getByLabelText("Product Name"), "Ship by Sunday");
		await user.type(
			screen.getByLabelText("Product Summary"),
			"A packet-first builder for Sunday launches.",
		);
		await user.type(
			screen.getByLabelText("Primary User"),
			"Indie founders shipping a paid product.",
		);
		await user.type(
			screen.getByLabelText("Why This Matters"),
			"Sunday-bound launches need sharper guidance than generic courses.",
		);
		await user.click(screen.getByRole("button", { name: "Save step" }));

		await waitFor(() =>
			expect(saveProjectDefinitionFactsMock).toHaveBeenCalledWith(
				expect.objectContaining({
					stageId: "product",
					factsPatch: expect.objectContaining({
						product_name: "Ship by Sunday",
						product_summary: "A packet-first builder for Sunday launches.",
						primary_user: "Indie founders shipping a paid product.",
						why_this_matters:
							"Sunday-bound launches need sharper guidance than generic courses.",
					}),
				}),
			),
		);
		expect(pushMock).toHaveBeenCalledWith("/product/problem");
	});

	it("keeps a cleared step in place and explains that it became incomplete again", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState();

		render(
			<PacketStagePage
				stageId="build-plan"
				stepId="delivery"
				initialWorkspaceState={workspaceState}
			/>,
		);

		const priceField = screen.getByLabelText("Price Usd Cents");
		await user.clear(priceField);
		await user.click(screen.getByRole("button", { name: "Save step" }));

		await waitFor(() =>
			expect(saveProjectDefinitionFactsMock).toHaveBeenCalledWith(
				expect.objectContaining({
					stageId: "build-plan",
					clearedFieldKeys: expect.arrayContaining(["price_usd_cents"]),
				}),
			),
		);
		expect(screen.getByText("Step cleared.")).toBeTruthy();
		expect(
			screen.getByText(/This checkpoint is incomplete again\./i),
		).toBeTruthy();
		expect(screen.getByText("Step 1 of 3: Delivery")).toBeTruthy();
		expect(document.activeElement).toBe(priceField);
		expect(priceField.getAttribute("aria-invalid")).toBe("true");
	});

	it("shows a save failure inline and preserves the current draft", async () => {
		const user = userEvent.setup();
		const workspaceState = createWorkspaceState({
			product_name: undefined,
			product_summary: undefined,
			primary_user: undefined,
			why_this_matters: undefined,
		});
		saveProjectDefinitionFactsMock.mockRejectedValueOnce(
			new Error("network unavailable"),
		);

		render(
			<PacketStagePage
				stageId="product"
				stepId="foundation"
				initialWorkspaceState={workspaceState}
			/>,
		);

		const productNameField = screen.getByLabelText("Product Name");
		await user.type(productNameField, "Ship by Sunday");
		await user.click(screen.getByRole("button", { name: "Save step" }));

		await waitFor(() =>
			expect(
				screen.getByText("We could not save this step right now."),
			).toBeTruthy(),
		);
		expect((productNameField as HTMLInputElement).value).toBe("Ship by Sunday");
		expect(screen.getByText("Step 1 of 4: Foundation")).toBeTruthy();
		expect(
			screen.getByLabelText("Primary User").getAttribute("aria-invalid"),
		).toBeNull();
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
					stepId="operating-system"
					initialWorkspaceState={workspaceState}
				/>,
			),
		).toThrowError("NEXT_REDIRECT:/design");
		expect(redirectMock).toHaveBeenCalledWith("/design");
	});

	it("renders the mapped packet video and the L2 orientation fallback", () => {
		const workspaceState = createWorkspaceState();
		const { rerender } = render(
			<PacketStagePage
				stageId="product"
				stepId="foundation"
				initialWorkspaceState={workspaceState}
			/>,
		);

		expect(screen.getByTestId("packet-stage-video-player").textContent).toBe(
			"Product Foundation Video",
		);

		rerender(
			<PacketStagePage
				stageId="product"
				stepId="problem"
				initialWorkspaceState={workspaceState}
			/>,
		);

		expect(screen.queryByTestId("packet-stage-video-player")).toBeNull();
		expect(screen.getByText("Problem checkpoint")).toBeTruthy();
		expect(
			screen.getByText(
				"This page is intentionally text-first until the L2 recording is uploaded.",
			),
		).toBeTruthy();
	});
});
