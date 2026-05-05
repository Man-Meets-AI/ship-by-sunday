import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useConvexAuthMock = vi.fn();
const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const approveSyncPreviewMock = vi.fn();

vi.mock("@/convex/_generated/api", () => ({
	api: {
		workspace: {
			getWorkspaceSyncPreviewState: "getWorkspaceSyncPreviewState",
			approveWorkspaceSyncPreview: "approveWorkspaceSyncPreview",
		},
	},
}));

vi.mock("convex/react", () => ({
	useConvexAuth: () => useConvexAuthMock(),
	useMutation: (mutationRef: string) => useMutationMock(mutationRef),
	useQuery: (queryRef: string, args: unknown) => useQueryMock(queryRef, args),
}));

vi.mock("@/app/(workspace)/_components/app-shell", () => ({
	AppShell: ({
		children,
		localNav,
	}: {
		children: React.ReactNode;
		localNav?: { desktop?: React.ReactNode };
	}) => (
		<div>
			<nav data-testid="workspace-doctor-pass-local-nav">
				{localNav?.desktop}
			</nav>
			{children}
		</div>
	),
}));

import { WorkspaceDoctorPassPage } from "@/app/(workspace)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-page";

function createSyncPreviewState() {
	return {
		doctorPassRun: {
			_id: "doctorPassRuns_1",
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			status: "sync_preview_ready",
			runnerMode: "daemon",
			syncPreviewStatus: "ready",
			syncPreviewDigest: "sha256:preview",
			syncPreviewFindingsCount: 2,
			excludedArtifactCount: 3,
			localReportRef: ".sbs/reports/doctor-pass/run-local/sync-preview.json",
			startedAt: 100,
			createdAt: 100,
			updatedAt: 100,
		},
	};
}

describe("WorkspaceDoctorPassPage", () => {
	beforeEach(() => {
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
		});
		useQueryMock.mockReturnValue(undefined);
		approveSyncPreviewMock.mockResolvedValue({
			...createSyncPreviewState().doctorPassRun,
			status: "sync_approved",
			syncPreviewStatus: "approved",
		});
		useMutationMock.mockImplementation((mutationRef: string) => {
			if (mutationRef === "approveWorkspaceSyncPreview") {
				return approveSyncPreviewMock;
			}
			throw new Error(`Unexpected mutation ${mutationRef}`);
		});
	});

	it("renders the preview digest and approves through the user mutation", async () => {
		const user = userEvent.setup();
		render(
			<WorkspaceDoctorPassPage
				initialSyncPreviewState={createSyncPreviewState() as never}
			/>,
		);

		expect(screen.getByRole("heading", { name: "Sync preview" })).toBeTruthy();
		expect(screen.getByText("sha256:preview")).toBeTruthy();
		expect(screen.getByText(/run-local\/sync-preview\.json/)).toBeTruthy();
		expect(
			screen.getByTestId("workspace-doctor-pass-local-nav").textContent,
		).toContain("Doctor Pass");

		await user.click(
			screen.getByRole("button", { name: /Approve sync preview/i }),
		);

		expect(approveSyncPreviewMock).toHaveBeenCalledWith({
			projectId: "workspaceProjects_1",
			doctorPassRunId: "doctorPassRuns_1",
			previewDigest: "sha256:preview",
		});
		expect(
			await screen.findByText(
				"Sync preview approved. The local runner can upload findings now.",
			),
		).toBeTruthy();
	});

	it("shows the local runner command when no preview exists", () => {
		render(
			<WorkspaceDoctorPassPage
				initialSyncPreviewState={{ doctorPassRun: null } as never}
			/>,
		);

		expect(screen.getByText("No sync preview yet")).toBeTruthy();
		expect(screen.getAllByText(/ship-by-sunday doctor-pass run/).length).toBe(
			1,
		);
		expect(
			(
				screen.getByRole("button", {
					name: /Approve sync preview/i,
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
	});
});
