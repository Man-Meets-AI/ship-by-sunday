import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { WorkspaceFindingDocument } from "@/app/(app)/_lib/workspace-findings-read-model";

const { requestWorkflowRunMock, routerPushMock, toastSuccessMock } = vi.hoisted(
	() => ({
		requestWorkflowRunMock: vi.fn(),
		routerPushMock: vi.fn(),
		toastSuccessMock: vi.fn(),
	}),
);

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
	useRouter: () => ({
		push: routerPushMock,
	}),
}));

vi.mock("convex/react", () => ({
	useMutation: () => requestWorkflowRunMock,
}));

vi.mock("sonner", () => ({
	toast: {
		success: toastSuccessMock,
	},
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
			<nav data-testid="workspace-finding-detail-local-nav">
				{localNav?.desktop}
			</nav>
			{children}
		</div>
	),
}));

import { WorkspaceFindingDetailPage } from "@/app/(app)/_components/existing-codebase-findings/workspace-finding-detail-page";

function createFinding(
	overrides: Partial<WorkspaceFindingDocument> = {},
): WorkspaceFindingDocument {
	return {
		_id: "codebaseFindings_1",
		findingId: "finding-source-truth-readiness",
		rank: 1,
		status: "ready",
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
		routerPushMock.mockReset();
		toastSuccessMock.mockReset();
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

		const { container } = render(
			<WorkspaceFindingDetailPage
				initialFindings={[createFinding()]}
				findingRouteId="finding-source-truth-readiness"
				projectId="workspaceProjects_1"
				activeRunnerId="workspaceRunnerBindings_1"
				approvalTimestamp={Date.UTC(2026, 4, 4, 21, 0)}
			/>,
		);

		expect(
			container.querySelector('[data-slot="protected-route-page"]'),
		).toBeTruthy();
		expect(
			container.querySelector('[data-slot="protected-route-header"]'),
		).toBeTruthy();
		expect(
			container.querySelector('[data-slot="protected-route-panel"]'),
		).toBeTruthy();
		expect(container.innerHTML).not.toContain("font-heading-serif");
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
		expect(
			screen.getByRole("heading", { name: "Workflow bounds" }),
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
		expect(screen.queryByText("Local evidence ref copied.")).toBeNull();
		expect(toastSuccessMock).toHaveBeenCalledWith(
			"Local evidence ref copied.",
			{
				action: expect.objectContaining({
					label: "View runs",
				}),
				id: "workspace-finding-detail-copy-evidence-ref-success",
				description: "Use Runs to match this ref to the local report history.",
				duration: 6000,
				position: "bottom-right",
			},
		);
		const toastOptions = toastSuccessMock.mock.calls.find(
			([title]) => title === "Local evidence ref copied.",
		)?.[1];
		toastOptions?.action?.onClick();
		expect(routerPushMock).toHaveBeenCalledWith("/workers/runs");

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

	it("renders blocked findings as unavailable and never requests a workflow", async () => {
		const user = userEvent.setup();
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText: writeTextMock },
		});

		render(
			<WorkspaceFindingDetailPage
				initialFindings={[
					createFinding({
						status: "blocked",
						blockedReason: "Codex auth is blocked on the paired machine.",
					}),
				]}
				findingRouteId="finding-source-truth-readiness"
				projectId="workspaceProjects_1"
				activeRunnerId="workspaceRunnerBindings_1"
				approvalTimestamp={Date.UTC(2026, 4, 4, 21, 0)}
			/>,
		);

		expect(
			screen.getByText(
				"This finding is blocked. Resolve the blocker before starting a workflow.",
			),
		).toBeTruthy();
		expect(
			screen.getByText("Reason: Codex auth is blocked on the paired machine."),
		).toBeTruthy();
		expect(
			screen.queryByRole("button", {
				name: /Create branch and run workflow/i,
			}),
		).toBeNull();
		const blockedWorkflowButton = screen.getByRole("button", {
			name: /Workflow blocked/i,
		}) as HTMLButtonElement;
		expect(blockedWorkflowButton.disabled).toBe(true);

		await user.click(
			screen.getByRole("button", { name: /Copy local evidence ref/i }),
		);

		expect(writeTextMock).toHaveBeenCalledWith("AGENTS.md:1-40");
		expect(requestWorkflowRunMock).not.toHaveBeenCalled();
		expect(document.body.textContent).not.toContain("Request ID");
		expect(document.body.textContent).not.toContain("ConvexError");
	});

	it("renders unsupported ready workflows as unavailable and never requests a workflow", async () => {
		const user = userEvent.setup();
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText: writeTextMock },
		});

		render(
			<WorkspaceFindingDetailPage
				initialFindings={[
					createFinding({
						findingId: "finding-proof-harness",
						title: "Proof harness is missing",
						category: "proof",
						recommendedWorkflowId: "proof-harness",
					}),
				]}
				findingRouteId="finding-proof-harness"
				projectId="workspaceProjects_1"
				activeRunnerId="workspaceRunnerBindings_1"
				approvalTimestamp={Date.UTC(2026, 4, 4, 21, 0)}
			/>,
		);

		expect(screen.getByText("Proof Harness")).toBeTruthy();
		expect(
			screen.getByText(
				"This workflow is not available in the local runner yet.",
			),
		).toBeTruthy();
		expect(screen.getByText("Reason: proof-harness")).toBeTruthy();
		expect(
			screen.queryByRole("button", {
				name: /Create branch and run workflow/i,
			}),
		).toBeNull();
		const unavailableWorkflowButton = screen.getByRole("button", {
			name: /Workflow unavailable/i,
		}) as HTMLButtonElement;
		expect(unavailableWorkflowButton.disabled).toBe(true);

		await user.click(unavailableWorkflowButton);
		await user.click(
			screen.getByRole("button", { name: /Copy local evidence ref/i }),
		);

		expect(writeTextMock).toHaveBeenCalledWith("AGENTS.md:1-40");
		expect(requestWorkflowRunMock).not.toHaveBeenCalled();
		expect(document.body.textContent).not.toContain(
			"workspace:requestWorkspaceWorkflowRun",
		);
		expect(document.body.textContent).not.toContain("ConvexError");
	});

	it("keeps non-ready workflow states from starting duplicate runs", () => {
		const unavailableStates: Array<{
			status: WorkspaceFindingDocument["status"];
			buttonLabel: RegExp;
			description: string;
		}> = [
			{
				status: "needs_approval",
				buttonLabel: /Waiting for approval/i,
				description:
					"This finding still needs approval. Approve the finding before starting a workflow.",
			},
			{
				status: "running",
				buttonLabel: /Workflow running/i,
				description:
					"A workflow is already running for this finding. Review the current run state before starting another workflow.",
			},
			{
				status: "done",
				buttonLabel: /Workflow completed/i,
				description:
					"This finding already has completed proof. Review Runs before starting any deliberate rerun.",
			},
		];

		for (const unavailableState of unavailableStates) {
			const { unmount } = render(
				<WorkspaceFindingDetailPage
					initialFindings={[
						createFinding({
							status: unavailableState.status,
						}),
					]}
					findingRouteId="finding-source-truth-readiness"
					projectId="workspaceProjects_1"
					activeRunnerId="workspaceRunnerBindings_1"
					approvalTimestamp={Date.UTC(2026, 4, 4, 21, 0)}
				/>,
			);

			expect(screen.getByText(unavailableState.description)).toBeTruthy();
			expect(
				screen.queryByRole("button", {
					name: /Create branch and run workflow/i,
				}),
			).toBeNull();
			const unavailableWorkflowButton = screen.getByRole("button", {
				name: unavailableState.buttonLabel,
			}) as HTMLButtonElement;
			expect(unavailableWorkflowButton.disabled).toBe(true);
			unmount();
		}

		expect(requestWorkflowRunMock).not.toHaveBeenCalled();
	});

	it("shows a friendly inline error when a workflow request is rejected", async () => {
		const user = userEvent.setup();
		requestWorkflowRunMock.mockRejectedValue(
			new Error(
				"[CONVEX M(workspace:requestWorkspaceWorkflowRun)] Uncaught ConvexError: Blocked findings cannot start workflows\nRequest ID: 604cef4c0fefa456",
			),
		);

		render(
			<WorkspaceFindingDetailPage
				initialFindings={[createFinding()]}
				findingRouteId="finding-source-truth-readiness"
				projectId="workspaceProjects_1"
				activeRunnerId="workspaceRunnerBindings_1"
				approvalTimestamp={Date.UTC(2026, 4, 4, 21, 0)}
			/>,
		);

		await user.click(
			screen.getByRole("button", { name: /Create branch and run workflow/i }),
		);

		expect(
			await screen.findByText(
				"This finding is blocked. Resolve the blocker before starting a workflow.",
			),
		).toBeTruthy();
		expect(document.body.textContent).not.toContain(
			"workspace:requestWorkspaceWorkflowRun",
		);
		expect(document.body.textContent).not.toContain("ConvexError");
		expect(document.body.textContent).not.toContain("604cef4c0fefa456");
	});

	it("shows a friendly inline error when the backend rejects an unsupported workflow", async () => {
		const user = userEvent.setup();
		requestWorkflowRunMock.mockRejectedValue(
			new Error(
				"[CONVEX M(workspace:requestWorkspaceWorkflowRun)] Uncaught ConvexError: Workflow is not supported by the local runner\nRequest ID: 134a84a54dedc72c",
			),
		);

		render(
			<WorkspaceFindingDetailPage
				initialFindings={[createFinding()]}
				findingRouteId="finding-source-truth-readiness"
				projectId="workspaceProjects_1"
				activeRunnerId="workspaceRunnerBindings_1"
				approvalTimestamp={Date.UTC(2026, 4, 4, 21, 0)}
			/>,
		);

		await user.click(
			screen.getByRole("button", { name: /Create branch and run workflow/i }),
		);

		expect(
			await screen.findByText(
				"This workflow is not available in the local runner yet.",
			),
		).toBeTruthy();
		expect(requestWorkflowRunMock).toHaveBeenCalledOnce();
		expect(document.body.textContent).not.toContain(
			"workspace:requestWorkspaceWorkflowRun",
		);
		expect(document.body.textContent).not.toContain("ConvexError");
		expect(document.body.textContent).not.toContain("134a84a54dedc72c");
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
		).toBe("/workers/findings");
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
				approvalTimestamp={Date.UTC(2026, 4, 4, 21, 0)}
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
				approvalTimestamp={Date.UTC(2026, 4, 5, 10, 0)}
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
