import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useConvexAuthMock = vi.fn();
const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const approveSyncPreviewMock = vi.fn();
const {
	reportClientErrorMock,
	routerPushMock,
	toastErrorMock,
	toastSuccessMock,
} = vi.hoisted(() => ({
	reportClientErrorMock: vi.fn(),
	routerPushMock: vi.fn(),
	toastErrorMock: vi.fn(),
	toastSuccessMock: vi.fn(),
}));

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

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: routerPushMock,
	}),
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

vi.mock("@/app/(app)/_components/app-shell", () => ({
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

import { WorkspaceDoctorPassPage } from "@/app/(app)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-page";

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
		routerPushMock.mockReset();
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
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText: writeTextMock },
		});
		render(
			<WorkspaceDoctorPassPage
				initialSyncPreviewState={createSyncPreviewState() as never}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Doctor Pass completed locally" }),
		).toBeTruthy();
		expect(
			document.querySelector('[data-slot="protected-route-page"]'),
		).toBeTruthy();
		expect(
			document.querySelector('[data-slot="protected-route-header"]'),
		).toBeTruthy();
		expect(
			document.querySelectorAll('[data-slot="protected-route-panel"]').length,
		).toBeGreaterThanOrEqual(4);
		expect(document.body.innerHTML).not.toContain("font-heading-serif");
		expect(
			screen.getByText(
				"The local runner inspected this repo and found 2 items.",
			),
		).toBeTruthy();
		expect(screen.getByText("Raw source is not uploaded.")).toBeTruthy();
		const summaryPanel = screen.getByRole("region", { name: "What happened" });
		expect(
			within(summaryPanel)
				.getAllByRole("listitem")
				.filter(
					(summaryItem) =>
						summaryItem.getAttribute("data-summary-status") === "complete",
				),
		).toHaveLength(4);
		expect(
			screen.getAllByText("Waiting for your approval.").length,
		).toBeGreaterThan(0);
		expect(screen.getByText("Server run")).toBeTruthy();
		expect(screen.getByText("doctorPassRuns_1")).toBeTruthy();
		expect(screen.getByText("Local run")).toBeTruthy();
		expect(screen.getByText("run-local")).toBeTruthy();
		expect(screen.getByText("Digest")).toBeTruthy();
		expect(screen.getAllByText("sha256:preview").length).toBeGreaterThan(1);
		expect(screen.getByText("Waiting for browser approval")).toBeTruthy();
		expect(screen.getByText("Human")).toBeTruthy();
		expect(screen.getByText("Click Approve findings upload")).toBeTruthy();
		expect(screen.getAllByText("2").length).toBeGreaterThan(0);
		expect(screen.getAllByText("3").length).toBeGreaterThan(0);
		expect(screen.getAllByText("sha256:preview").length).toBeGreaterThan(1);
		expect(screen.getByText(/run-local\/sync-preview\.json/)).toBeTruthy();
		expect(
			screen.getByTestId("workspace-doctor-pass-local-nav").textContent,
		).toContain("Doctor Pass");
		await user.click(screen.getByRole("button", { name: "Copy Server run" }));
		expect(writeTextMock).toHaveBeenCalledWith("doctorPassRuns_1");

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
			pathname: "/workers/doctor-pass",
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
		expect(screen.getByText("Uploaded")).toBeTruthy();
		expect(screen.getByText("Open Findings")).toBeTruthy();
		expect(
			screen.getByRole("link", { name: "View findings" }).getAttribute("href"),
		).toBe("/workers/findings");
		expect(
			screen.getByRole("link", { name: "View runs" }).getAttribute("href"),
		).toBe("/workers/runs");
	});

	it("shows failed run status and next action", async () => {
		const blockedReason =
			"Codebase intake probe was not found under .sbs/intake-probe.";

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
							blockedReason,
						},
					} as never
				}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Doctor Pass needs attention" }),
		).toBeTruthy();
		expect(screen.getAllByText(blockedReason).length).toBeGreaterThan(0);
		expect(screen.getByText("Failed")).toBeTruthy();
		expect(screen.getByText("Inspect failed run")).toBeTruthy();
		expect(
			screen.getByText(/Next action: rerun Doctor Pass locally/),
		).toBeTruthy();
	});
});
