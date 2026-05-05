import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useConvexAuthMock = vi.fn();
const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const approveSyncPreviewMock = vi.fn();
const { reportClientErrorMock, toastErrorMock, toastSuccessMock } = vi.hoisted(
	() => ({
		reportClientErrorMock: vi.fn(),
		toastErrorMock: vi.fn(),
		toastSuccessMock: vi.fn(),
	}),
);

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

vi.mock("sonner", () => ({
	toast: {
		error: toastErrorMock,
		success: toastSuccessMock,
	},
}));

vi.mock("@/lib/observability/client-error-report", () => ({
	reportClientError: reportClientErrorMock,
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
		reportClientErrorMock.mockReset();
		toastErrorMock.mockReset();
		toastSuccessMock.mockReset();
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

		expect(
			screen.getByRole("heading", { name: "Doctor Pass completed locally" }),
		).toBeTruthy();
		expect(
			screen.getByText(
				"The local runner inspected this repo and found 2 items.",
			),
		).toBeTruthy();
		expect(screen.getByText("Raw source is not uploaded.")).toBeTruthy();
		expect(
			screen.getAllByText("Waiting for your approval.").length,
		).toBeGreaterThan(0);
		expect(screen.getByText("sha256:preview")).toBeTruthy();
		expect(screen.getByText(/run-local\/sync-preview\.json/)).toBeTruthy();
		expect(
			screen.getByTestId("workspace-doctor-pass-local-nav").textContent,
		).toContain("Doctor Pass");
		await waitFor(() => {
			expect(toastSuccessMock).toHaveBeenCalledWith(
				"Doctor Pass completed. Review 2 findings before upload.",
				expect.objectContaining({
					id: "workspace-doctor-pass-run-completed-doctorPassRuns_1",
				}),
			);
		});

		await user.click(
			screen.getByRole("button", { name: /Approve findings upload/i }),
		);

		expect(approveSyncPreviewMock).toHaveBeenCalledWith({
			projectId: "workspaceProjects_1",
			doctorPassRunId: "doctorPassRuns_1",
			previewDigest: "sha256:preview",
		});
		expect(toastSuccessMock).toHaveBeenCalledWith("Findings upload approved", {
			id: "workspace-doctor-pass-approve-preview-success",
			description: "Runner will upload automatically.",
			duration: 1800,
			position: "bottom-right",
		});
	});

	it("toasts and reports approval failures", async () => {
		const user = userEvent.setup();
		const approvalError = new Error("Approval write failed");
		approveSyncPreviewMock.mockRejectedValueOnce(approvalError);
		render(
			<WorkspaceDoctorPassPage
				initialSyncPreviewState={createSyncPreviewState() as never}
			/>,
		);

		await user.click(
			screen.getByRole("button", { name: /Approve findings upload/i }),
		);

		expect(toastErrorMock).toHaveBeenCalledWith("Approval write failed", {
			id: "workspace-doctor-pass-approve-preview-error",
			duration: 6000,
			position: "bottom-right",
		});
		expect(reportClientErrorMock).toHaveBeenCalledWith({
			error: approvalError,
			pathname: "/workspace/doctor-pass",
			code: "workspace_doctor_pass_sync_preview_approval_failed",
			severity: "medium",
			details: {
				action: "approve_sync_preview",
			},
		});
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
					name: /Approve findings upload/i,
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
	});

	it("shows uploaded next destinations", async () => {
		render(
			<WorkspaceDoctorPassPage
				initialSyncPreviewState={
					{
						doctorPassRun: {
							...createSyncPreviewState().doctorPassRun,
							status: "findings_uploaded",
							syncPreviewStatus: "uploaded",
							findingsCount: 2,
						},
					} as never
				}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Findings uploaded" }),
		).toBeTruthy();
		expect(
			screen.getByRole("link", { name: "View findings" }).getAttribute("href"),
		).toBe("/workspace/findings");
		expect(
			screen.getByRole("link", { name: "View runs" }).getAttribute("href"),
		).toBe("/workspace/runs");
		await waitFor(() => {
			expect(toastSuccessMock).toHaveBeenCalledWith(
				"Findings uploaded.",
				expect.objectContaining({
					id: "workspace-doctor-pass-upload-completed-doctorPassRuns_1",
				}),
			);
		});
	});

	it("shows failed run status and next action", async () => {
		render(
			<WorkspaceDoctorPassPage
				initialSyncPreviewState={
					{
						doctorPassRun: {
							...createSyncPreviewState().doctorPassRun,
							status: "failed",
							syncPreviewStatus: "not_ready",
							syncPreviewDigest: undefined,
							syncPreviewFindingsCount: undefined,
							blockedReason: "Codex interpretation failed.",
						},
					} as never
				}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Doctor Pass needs attention" }),
		).toBeTruthy();
		expect(
			screen.getAllByText("Codex interpretation failed.").length,
		).toBeGreaterThan(0);
		expect(
			screen.getByText(/Next action: rerun Doctor Pass locally/),
		).toBeTruthy();
		await waitFor(() => {
			expect(toastErrorMock).toHaveBeenCalledWith(
				"Doctor Pass failed. View run details.",
				expect.objectContaining({
					id: "workspace-doctor-pass-run-failed-doctorPassRuns_1",
				}),
			);
		});
	});
});
