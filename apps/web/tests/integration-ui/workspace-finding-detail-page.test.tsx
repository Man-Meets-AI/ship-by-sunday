import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { WorkspaceFindingDocument } from "@/app/(workspace)/_lib/workspace-findings-read-model";

const { requestWorkflowRunMock } = vi.hoisted(() => ({
	requestWorkflowRunMock: vi.fn(),
}));

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

vi.mock("convex/react", () => ({
	useMutation: () => requestWorkflowRunMock,
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
			<nav data-testid="workspace-finding-detail-local-nav">
				{localNav?.desktop}
			</nav>
			{children}
		</div>
	),
}));

import { WorkspaceFindingDetailPage } from "@/app/(workspace)/_components/existing-codebase-findings/workspace-finding-detail-page";

function createFinding(
	overrides: Partial<WorkspaceFindingDocument> = {},
): WorkspaceFindingDocument {
	return {
		_id: "codebaseFindings_1",
		findingId: "finding-source-truth-readiness",
		rank: 1,
		status: "needs_approval",
		title: "Source truth needs the first workflow",
		category: "source_truth",
		severity: "high",
		confidence: 0.91,
		buyerImpact: "Later agent work needs a clearer command and proof map.",
		blastRadius: "low",
		proofPath: "Review the source-truth readiness artifact.",
		proofability: "clear",
		permissionRequired: "docs_write",
		recommendedWorkflowId: "source-truth-agent-readiness",
		whyThisNow: "It improves every later local workflow.",
		evidenceRefs: [
			{
				kind: "file",
				repoRelativePath: "AGENTS.md",
				lineStart: 1,
				lineEnd: 40,
				summary: 'export const runtime = "edge";',
			},
			{
				kind: "command",
				commandName: "bun run typecheck",
				summary: "Typecheck is a proof candidate.",
			},
		],
		syncSensitivity: "low",
		localReportRef:
			".sbs/reports/doctor-pass/run-1/source-truth-agent-readiness.json",
		...overrides,
	};
}

describe("WorkspaceFindingDetailPage", () => {
	beforeEach(() => {
		requestWorkflowRunMock.mockReset();
	});

	it("renders decision content and bounded actions", async () => {
		const user = userEvent.setup();
		requestWorkflowRunMock.mockResolvedValue({
			_id: "workflowRuns_1",
			branchName: "sbs/source-truth-readiness-20260504-2101",
			profileName: "sbs-workspace-write",
		});
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText: writeTextMock },
		});

		render(
			<WorkspaceFindingDetailPage
				initialFindings={[createFinding()]}
				findingRouteId="finding-source-truth-readiness"
				projectId="workspaceProjects_1"
				activeRunnerId="workspaceRunnerBindings_1"
				approvalTimestamp={1_777_942_800_000}
			/>,
		);

		expect(
			screen.getByRole("heading", {
				name: "Source truth needs the first workflow",
			}),
		).toBeTruthy();
		expect(
			screen.getByText(
				"Later agent work needs a clearer command and proof map.",
			),
		).toBeTruthy();
		expect(
			screen.getByText("It improves every later local workflow."),
		).toBeTruthy();
		expect(screen.getByText("AGENTS.md:1-40")).toBeTruthy();
		expect(screen.getByText("bun run typecheck")).toBeTruthy();
		expect(screen.getByText("Source Truth Agent Readiness")).toBeTruthy();
		expect(screen.getByText("source-truth workflow packet")).toBeTruthy();
		expect(
			screen.getByText(".sbs/runs/<workflow-run-id> workflow artifacts"),
		).toBeTruthy();
		expect(screen.getByText("environment files")).toBeTruthy();
		expect(
			screen.getByText("sbs/source-truth-readiness-20260504-2100"),
		).toBeTruthy();
		expect(screen.getByText("sbs-workspace-write")).toBeTruthy();
		expect(
			screen.getByTestId("workspace-finding-detail-local-nav").textContent,
		).toContain("Findings");

		await user.click(
			screen.getByRole("button", { name: /Copy local evidence ref/i }),
		);
		expect(writeTextMock).toHaveBeenCalledWith("AGENTS.md:1-40");
		expect(screen.getByText("Local evidence ref copied.")).toBeTruthy();

		await user.click(
			screen.getByRole("button", { name: /Create branch and run workflow/i }),
		);
		expect(requestWorkflowRunMock).toHaveBeenCalledWith(
			expect.objectContaining({
				projectId: "workspaceProjects_1",
				findingDocumentId: "codebaseFindings_1",
				runnerId: "workspaceRunnerBindings_1",
				workflowId: "source-truth-agent-readiness",
				branchName: "sbs/source-truth-readiness-20260504-2100",
				profileName: "sbs-workspace-write",
			}),
		);
		expect(
			await screen.findByText(/bunx ship-by-sunday workflow/i),
		).toBeTruthy();
		expect(
			screen.getAllByText(/sbs\/source-truth-readiness-20260504-2101/i),
		).toHaveLength(2);

		const visibleText = document.body.textContent?.toLowerCase() ?? "";
		expect(visibleText).not.toContain("export const runtime");
		expect(visibleText).not.toContain("typecheck is a proof candidate");
		expect(visibleText).not.toContain("raw source");
		expect(visibleText).not.toContain("raw terminal");
		expect(visibleText).not.toContain("transcript");
		expect(screen.queryByRole("button", { name: /Open PR/i })).toBeNull();
		expect(screen.queryByRole("button", { name: /Queue worker/i })).toBeNull();
	});

	it("renders unavailable state for a missing finding", () => {
		render(
			<WorkspaceFindingDetailPage
				initialFindings={[createFinding()]}
				findingRouteId="missing"
				projectId="workspaceProjects_1"
				activeRunnerId="workspaceRunnerBindings_1"
				approvalTimestamp={1_777_942_800_000}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Finding unavailable" }),
		).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: "Back to findings" })
				.getAttribute("href"),
		).toBe("/workspace/findings");
	});

	it("renders broken-app triage as read-only diagnostics before patching", async () => {
		const user = userEvent.setup();
		requestWorkflowRunMock.mockResolvedValue({
			_id: "workflowRuns_broken",
			branchName: "sbs/broken-app-triage-20260504-2100",
			profileName: "sbs-doctor-readonly",
		});

		render(
			<WorkspaceFindingDetailPage
				initialFindings={[
					createFinding({
						_id: "codebaseFindings_broken",
						findingId: "finding-broken-app",
						title: "Checkout route is failing",
						category: "broken_app",
						permissionRequired: "workspace_write",
						recommendedWorkflowId: "broken-app-triage",
					}),
				]}
				findingRouteId="finding-broken-app"
				projectId="workspaceProjects_1"
				activeRunnerId="workspaceRunnerBindings_1"
				approvalTimestamp={new Date(2026, 4, 4, 21, 0).getTime()}
			/>,
		);

		expect(screen.getByText("Broken App Triage")).toBeTruthy();
		expect(screen.getByText("sbs-doctor-readonly")).toBeTruthy();
		expect(screen.getByText("git diff --name-only")).toBeTruthy();
		expect(
			screen.getByText("patch approval boundary for a later write phase"),
		).toBeTruthy();

		await user.click(
			screen.getByRole("button", { name: /Run read-only diagnostics/i }),
		);
		expect(requestWorkflowRunMock).toHaveBeenCalledWith(
			expect.objectContaining({
				workflowId: "broken-app-triage",
				branchName: "sbs/broken-app-triage-20260504-2100",
				profileName: "sbs-doctor-readonly",
			}),
		);
		expect(
			await screen.findByText(
				/bunx ship-by-sunday workflow broken-app-triage run/i,
			),
		).toBeTruthy();

		const visibleText = document.body.textContent?.toLowerCase() ?? "";
		expect(visibleText).toContain("does not patch source files");
		expect(visibleText).not.toContain("open pr");
	});

	it("renders observability workflow with its own command and audit boundary", async () => {
		const user = userEvent.setup();
		requestWorkflowRunMock.mockResolvedValue({
			_id: "workflowRuns_observability",
			branchName: "sbs/observability-debuggability-20260505-1000",
			profileName: "sbs-workspace-write; gh pr create",
		});

		render(
			<WorkspaceFindingDetailPage
				initialFindings={[
					createFinding({
						_id: "codebaseFindings_observability",
						findingId: "finding-observability",
						title: "Production errors are opaque",
						category: "observability",
						permissionRequired: "workspace_write",
						recommendedWorkflowId: "observability-debuggability",
					}),
				]}
				findingRouteId="finding-observability"
				projectId="workspaceProjects_1"
				activeRunnerId="workspaceRunnerBindings_1"
				approvalTimestamp={new Date(2026, 4, 5, 10, 0).getTime()}
			/>,
		);

		expect(screen.getByText("Observability Debuggability")).toBeTruthy();
		expect(
			screen.getByText("sbs/observability-debuggability-20260505-1000"),
		).toBeTruthy();
		expect(screen.getByText("sync-safe debuggability audit")).toBeTruthy();
		expect(
			screen.getByText(".sbs/observability debuggability audit artifacts"),
		).toBeTruthy();

		await user.click(
			screen.getByRole("button", { name: /Run observability audit/i }),
		);
		expect(requestWorkflowRunMock).toHaveBeenCalledWith(
			expect.objectContaining({
				workflowId: "observability-debuggability",
				branchName: "sbs/observability-debuggability-20260505-1000",
				profileName: "sbs-workspace-write",
			}),
		);
		expect(
			await screen.findByText(
				/bunx ship-by-sunday workflow observability-debuggability run/i,
			),
		).toBeTruthy();
		expect(document.body.textContent).toContain(
			"--confirm-observability-audit",
		);
		expect(document.body.textContent).toContain(
			"--profile 'sbs-workspace-write; gh pr create'",
		);

		const visibleText = document.body.textContent?.toLowerCase() ?? "";
		expect(visibleText).toContain("does not edit runtime code");
		expect(visibleText).toContain("does not");
		expect(visibleText).not.toContain("open pr");
	});
});
