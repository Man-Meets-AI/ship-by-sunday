import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { WorkspaceFindingDocument } from "@/app/(workspace)/_lib/workspace-findings-read-model";
import type { WorkspaceRunHistoryState } from "@/app/(workspace)/_lib/workspace-support-read-model";

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

vi.mock("@/app/(workspace)/_components/app-shell", () => ({
	AppShell: ({
		children,
		localNav,
	}: {
		children: React.ReactNode;
		localNav?: { desktop?: React.ReactNode };
	}) => (
		<div>
			<nav data-testid="workspace-loops-local-nav">{localNav?.desktop}</nav>
			{children}
		</div>
	),
}));

import { WorkspaceLoopsPage } from "@/app/(workspace)/_components/existing-codebase-support/workspace-loops-page";

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
		proofPath: "Review source-truth readiness.",
		proofability: "clear",
		permissionRequired: "docs_write",
		recommendedWorkflowId: "source-truth-agent-readiness",
		whyThisNow: "It improves every later local workflow.",
		evidenceRefs: [
			{
				kind: "file",
				repoRelativePath: "AGENTS.md",
				summary: 'export const runtime = "edge";',
			},
		],
		syncSensitivity: "low",
		localReportRef:
			".sbs/reports/doctor-pass/run-1/source-truth-agent-readiness.json",
		...overrides,
	};
}

function createRunHistory(): WorkspaceRunHistoryState {
	return {
		doctorPassRuns: [],
		workflowRuns: [
			{
				_id: "workflowRuns_1",
				workflowId: "source-truth-agent-readiness",
				workflowVersion: "v1",
				status: "proof_completed",
				proofStatus: "passed",
				deliveryStatus: "local_only",
				createdAt: 1,
				updatedAt: 1,
			},
		],
	};
}

describe("WorkspaceLoopsPage", () => {
	it("renders a finding-filtered catalog with review links and no run buttons", () => {
		render(
			<WorkspaceLoopsPage
				initialFindings={[
					createFinding(),
					createFinding({
						_id: "codebaseFindings_2",
						findingId: "finding-observability",
						rank: 2,
						status: "ready",
						title: "Observability proof is thin",
						category: "observability",
						recommendedWorkflowId: "observability-debuggability",
					}),
				]}
				initialRunHistory={createRunHistory()}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Workflow catalog" }),
		).toBeTruthy();
		expect(screen.getByText("Source Truth Agent Readiness")).toBeTruthy();
		expect(screen.getByText("Workflow Proof Completed")).toBeTruthy();
		expect(screen.getByText("Observability Debuggability")).toBeTruthy();
		expect(screen.getByText("available now")).toBeTruthy();
		expect(screen.getByText("Workflow packet contract")).toBeTruthy();
		expect(screen.getByText("Evidence and probes")).toBeTruthy();
		expect(screen.getByText("Customer bottleneck")).toBeTruthy();
		expect(screen.getByText("Execution surface")).toBeTruthy();
		expect(screen.getByText("Codex interpretation")).toBeTruthy();
		expect(screen.getByText("Write authority")).toBeTruthy();
		expect(screen.getByText("Proof delivery")).toBeTruthy();
		expect(screen.getByText("Sync policy")).toBeTruthy();
		expect(screen.getByText("Revocation and stops")).toBeTruthy();
		expect(screen.getByText("Structured only")).toBeTruthy();
		expect(screen.getByText("Revenue Path Audit")).toBeTruthy();
		expect(screen.getAllByText("future").length).toBeGreaterThan(0);
		expect(
			screen
				.getAllByRole("link", { name: /Review finding/i })[0]
				.getAttribute("href"),
		).toBe("/workspace/findings/finding-source-truth-readiness");
		expect(
			screen.getByTestId("workspace-loops-local-nav").textContent,
		).toContain("Loops");

		const visibleText = document.body.textContent?.toLowerCase() ?? "";
		expect(visibleText).not.toContain("run loop");
		expect(visibleText).not.toContain("queue worker");
		expect(visibleText).not.toContain("push branch now");
		expect(visibleText).not.toContain("open pr");
		expect(visibleText).not.toContain("rerun ci now");
		expect(visibleText).not.toContain("raw source uploaded");
		expect(visibleText).not.toContain("hosted execution enabled");
		expect(visibleText).not.toContain("export const runtime");
	});

	it("points empty workflow catalog state back to the doctor pass", () => {
		render(
			<WorkspaceLoopsPage
				initialFindings={[]}
				initialRunHistory={{ doctorPassRuns: [], workflowRuns: [] }}
			/>,
		);

		expect(screen.getByText("No finding-backed workflows yet")).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: "Open Doctor Pass" })
				.getAttribute("href"),
		).toBe("/workspace/doctor-pass");
	});
});
