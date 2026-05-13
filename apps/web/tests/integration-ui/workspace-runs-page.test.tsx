import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { WorkspaceRunHistoryState } from "@/app/(app)/_lib/workspace-support-read-model";

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

vi.mock("@/app/(app)/_components/app-shell", () => ({
	AppShell: ({
		children,
		localNav,
	}: {
		children: React.ReactNode;
		localNav?: { desktop?: React.ReactNode };
	}) => (
		<div>
			<nav data-testid="workspace-runs-local-nav">{localNav?.desktop}</nav>
			{children}
		</div>
	),
}));

import { WorkspaceRunsPage } from "@/app/(app)/_components/existing-codebase-support/workspace-runs-page";

function createRunHistory(): WorkspaceRunHistoryState {
	return {
		doctorPassRuns: [
			{
				_id: "doctorPassRuns_1",
				localRunId: "run-1",
				status: "findings_uploaded",
				runnerMode: "daemon",
				currentStage: "findings_ready",
				syncPreviewStatus: "uploaded",
				syncPreviewFindingsCount: 2,
				excludedArtifactCount: 3,
				localReportRef: ".sbs/reports/doctor-pass/run-1/sync-preview.json",
				startedAt: Date.UTC(2026, 4, 4, 21, 0),
				createdAt: Date.UTC(2026, 4, 4, 21, 0),
				updatedAt: Date.UTC(2026, 4, 4, 21, 5),
			},
		],
		workflowRuns: [
			{
				_id: "workflowRuns_1",
				workflowId: "source-truth-agent-readiness",
				workflowVersion: "v1",
				status: "proof_completed",
				proofStatus: "passed",
				deliveryStatus: "local_only",
				branchName: "sbs/source-truth-readiness-20260504-2100",
				profileName: "sbs-workspace-write",
				writeLeaseExpiresAt: Date.UTC(2026, 4, 4, 21, 45),
				localProofRef: ".sbs/runs/workflowRuns_1/proof.json",
				nextRecommendedWorkflowId: "observability-debuggability",
				createdAt: Date.UTC(2026, 4, 4, 21, 10),
				updatedAt: Date.UTC(2026, 4, 4, 21, 20),
			},
			{
				_id: "workflowRuns_approval_requested",
				workflowId: "source-truth-agent-readiness",
				workflowVersion: "v1",
				status: "approval_requested",
				proofStatus: "not_started",
				deliveryStatus: "not_started",
				branchName: "sbs/source-truth-readiness-20260504-2130",
				profileName: "sbs-workspace-write",
				createdAt: Date.UTC(2026, 4, 4, 21, 30),
				updatedAt: Date.UTC(2026, 4, 4, 21, 30),
			},
		],
	};
}

describe("WorkspaceRunsPage", () => {
	it("renders doctor-pass and workflow run history without queue controls", async () => {
		const user = userEvent.setup();
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText: writeTextMock },
		});
		render(
			<WorkspaceRunsPage
				initialRunHistory={createRunHistory()}
				now={Date.UTC(2026, 4, 4, 21, 30)}
			/>,
		);

		expect(screen.getByRole("heading", { name: "Run history" })).toBeTruthy();
		expect(screen.getByRole("region", { name: "Runs summary" })).toBeTruthy();
		expect(screen.getByText("Runs recorded")).toBeTruthy();
		expect(screen.getByText("Inspect run history")).toBeTruthy();
		expect(screen.getByText("doctorPassRuns_1")).toBeTruthy();
		expect(screen.getAllByText("run-1").length).toBeGreaterThan(0);
		expect(screen.getByText("Doctor pass run-1")).toBeTruthy();
		expect(screen.getByText("2026-05-04 21:00 UTC")).toBeTruthy();
		expect(
			screen.getByText(".sbs/reports/doctor-pass/run-1/sync-preview.json"),
		).toBeTruthy();
		expect(
			screen.getAllByText("Source Truth Agent Readiness").length,
		).toBeGreaterThan(0);
		expect(
			screen.getByText("sbs/source-truth-readiness-20260504-2100"),
		).toBeTruthy();
		expect(screen.getAllByText("sbs-workspace-write").length).toBeGreaterThan(
			0,
		);
		expect(screen.getByText("Observability Debuggability")).toBeTruthy();
		expect(
			(
				screen.getByRole("button", {
					name: /Open local proof/i,
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
		expect(
			screen.getByTestId("workspace-runs-local-nav").textContent,
		).toContain("Runs");
		await user.click(screen.getByRole("button", { name: "Copy Server run" }));
		expect(writeTextMock).toHaveBeenCalledWith("doctorPassRuns_1");

		const visibleText = document.body.textContent?.toLowerCase() ?? "";
		expect(visibleText).not.toContain("worker queue");
		expect(visibleText).not.toContain("pause queued workflow");
		expect(visibleText).not.toContain("approval requested");
		expect(visibleText).not.toContain("open pr");
	});

	it("points empty history back to the doctor pass", () => {
		render(
			<WorkspaceRunsPage
				initialRunHistory={{ doctorPassRuns: [], workflowRuns: [] }}
			/>,
		);

		expect(screen.getByRole("heading", { name: "No runs yet" })).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: "Open Doctor Pass" })
				.getAttribute("href"),
		).toBe("/workers/doctor-pass");
	});
});
