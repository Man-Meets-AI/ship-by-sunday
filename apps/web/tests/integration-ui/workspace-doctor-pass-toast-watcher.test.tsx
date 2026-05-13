import React from "react";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useConvexAuthMock = vi.fn();
const useQueryMock = vi.fn();
const { routerPushMock, toastErrorMock, toastSuccessMock, pathnameMock } =
	vi.hoisted(() => ({
		routerPushMock: vi.fn(),
		toastErrorMock: vi.fn(),
		toastSuccessMock: vi.fn(),
		pathnameMock: vi.fn(),
	}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		workspace: {
			getWorkspaceSyncPreviewState: "getWorkspaceSyncPreviewState",
		},
	},
}));

vi.mock("convex/react", () => ({
	useConvexAuth: () => useConvexAuthMock(),
	useQuery: (queryRef: string, args: unknown) => useQueryMock(queryRef, args),
}));

vi.mock("next/navigation", () => ({
	usePathname: () => pathnameMock(),
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

import { doctorPassDetailsPanelId } from "@/app/(app)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-panels";
import { WorkspaceDoctorPassToastWatcher } from "@/app/(app)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-toast-watcher";

function createDoctorPassRun(overrides: Record<string, unknown> = {}) {
	return {
		_id: "doctorPassRuns_1",
		projectId: "workspaceProjects_1",
		runnerId: "workspaceRunnerBindings_1",
		status: "sync_preview_ready",
		runnerMode: "daemon",
		syncPreviewStatus: "ready",
		syncPreviewDigest: "sha256:preview",
		syncPreviewFindingsCount: 9,
		excludedArtifactCount: 3,
		localReportRef: ".sbs/reports/doctor-pass/run-local/sync-preview.json",
		startedAt: 100,
		createdAt: 100,
		updatedAt: 100,
		...overrides,
	};
}

describe("WorkspaceDoctorPassToastWatcher", () => {
	beforeEach(() => {
		sessionStorage.clear();
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
		});
		pathnameMock.mockReturnValue("/workers/setup");
		routerPushMock.mockReset();
		toastErrorMock.mockReset();
		toastSuccessMock.mockReset();
		useQueryMock.mockReset();
	});

	it("notifies once when Doctor Pass is ready and links to review", async () => {
		useQueryMock.mockReturnValue({
			doctorPassRun: createDoctorPassRun(),
		});
		const { rerender } = render(<WorkspaceDoctorPassToastWatcher />);

		await waitFor(() => {
			expect(toastSuccessMock).toHaveBeenCalledWith(
				"Doctor Pass completed. Review 9 findings before upload.",
				expect.objectContaining({
					action: expect.objectContaining({
						label: "Review findings",
					}),
					duration: 6000,
					id: "workspace-doctor-pass-run-completed-doctorPassRuns_1",
					position: "bottom-right",
				}),
			);
		});

		const toastOptions = toastSuccessMock.mock.calls[0]?.[1];
		toastOptions?.action?.onClick();
		expect(routerPushMock).toHaveBeenCalledWith("/workers/doctor-pass");

		toastSuccessMock.mockClear();
		rerender(<WorkspaceDoctorPassToastWatcher />);
		expect(toastSuccessMock).not.toHaveBeenCalled();
	});

	it("notifies when findings upload completes and links to findings", async () => {
		useQueryMock.mockReturnValue({
			doctorPassRun: createDoctorPassRun({
				status: "findings_uploaded",
				syncPreviewStatus: "uploaded",
			}),
		});
		render(<WorkspaceDoctorPassToastWatcher />);

		await waitFor(() => {
			expect(toastSuccessMock).toHaveBeenCalledWith(
				"Findings uploaded.",
				expect.objectContaining({
					action: expect.objectContaining({
						label: "View findings",
					}),
					id: "workspace-doctor-pass-upload-completed-doctorPassRuns_1",
				}),
			);
		});

		const toastOptions = toastSuccessMock.mock.calls[0]?.[1];
		toastOptions?.action?.onClick();
		expect(routerPushMock).toHaveBeenCalledWith("/workers/findings");
	});

	it("notifies when Doctor Pass fails and focuses details on the Doctor Pass page", async () => {
		pathnameMock.mockReturnValue("/workers/doctor-pass");
		const scrollIntoViewMock = vi.fn();
		const focusMock = vi.fn();
		useQueryMock.mockReturnValue({
			doctorPassRun: createDoctorPassRun({
				status: "failed",
				syncPreviewStatus: "not_ready",
				blockedReason:
					"Codebase intake probe was not found under .sbs/intake-probe.",
			}),
		});
		render(
			<>
				<section
					id={doctorPassDetailsPanelId}
					ref={(element) => {
						if (!element) {
							return;
						}
						element.scrollIntoView = scrollIntoViewMock;
						element.focus = focusMock;
					}}
				/>
				<WorkspaceDoctorPassToastWatcher />
			</>,
		);

		await waitFor(() => {
			expect(toastErrorMock).toHaveBeenCalledWith(
				"Doctor Pass failed. View run details.",
				expect.objectContaining({
					action: expect.objectContaining({
						label: "View details",
					}),
					id: "workspace-doctor-pass-run-failed-doctorPassRuns_1",
				}),
			);
		});

		const toastOptions = toastErrorMock.mock.calls[0]?.[1];
		toastOptions?.action?.onClick();
		expect(scrollIntoViewMock).toHaveBeenCalledWith({
			behavior: "smooth",
			block: "start",
		});
		expect(focusMock).toHaveBeenCalledWith({ preventScroll: true });
		expect(routerPushMock).not.toHaveBeenCalled();
	});
});
